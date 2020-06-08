import React, { ReactElement } from "react";

import { TName, EMode } from './type';
import { inclStaticIcon } from "./";

describe('Static Component - Icon', () => {
    const iconName: TName = 'setting';
    const iconBaseCls: string = `icon icon--${iconName} icon`;

    it("should render the icon with light mode", () => {
        const clsName: string = `${iconBaseCls}--${EMode.light}`;
        const expIconElem: ReactElement = <span className={clsName} />

        expect(inclStaticIcon(iconName, false)).toEqual(expIconElem);
    });

    it("should render the icon with dark mode", () => {
        const clsName: string = `${iconBaseCls}--${EMode.dark}`;
        const expIconElem: ReactElement = <span className={clsName} />

        expect(inclStaticIcon(iconName, true)).toEqual(expIconElem);
    });

    it('should render the icon in plain mode', () => {
        const clsName: string = `${iconBaseCls}--plain`;
        const expIconElem: ReactElement = <span className={clsName} />

        expect(inclStaticIcon(iconName)).toEqual(expIconElem);
    });
});
