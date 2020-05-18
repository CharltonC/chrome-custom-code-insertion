import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { SymbolBtn } from './';

const TestUtil = {
    setupElem(): HTMLElement {
        const elem: HTMLElement = document.createElement("div");
        document.body.appendChild(elem);
        return elem;
    },
    teardown(elem: HTMLElement): void {
        unmountComponentAtNode(elem);
        elem.remove();
    }
}

describe('Component - Symbol Button', () => {
    let elem: HTMLElement;
    let labelElem: Element;
    let spanElem: HTMLElement;
    let inputElem: HTMLInputElement;

    beforeEach(() => {
        elem = TestUtil.setupElem();

        act(() => {
            render(<SymbolBtn text="Js" defaultChecked={true} />, elem);
        });

        labelElem = elem.children[0];
        spanElem = labelElem.querySelector('span');
        inputElem = labelElem.querySelector('input');
    });

    afterEach(() => {
        TestUtil.teardown(elem);
        elem = null;
    });

    it("should render", () => {
        expect(labelElem.getAttribute('for')).toBe('symbol-btn-Js');
        expect(inputElem.id).toBe('symbol-btn-Js');
        expect(spanElem.textContent).toBe('Js');
    });

    it('should pass the unknown props', () => {
        expect(inputElem.checked).toBe(true);
        act(() => {
            labelElem.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
        expect(inputElem.checked).toBe(false);
    });
});
