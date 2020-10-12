import React, { ReactElement } from "react";
import { NumBadge } from './';

describe('Static Component: Number Badge', () => {
    it('should have a default badge of `0` if no number is provided or if number is less than 0', () => {
        const expElem: ReactElement = <span className="badge">0</span>;
        expect(NumBadge()).toEqual(expElem);
        expect(NumBadge(-9)).toEqual(expElem);
    });

    it('should have a badge of `9+` if number is greater than 9', () => {
        const expElem: ReactElement = <span className="badge">9+</span>;
        expect(NumBadge(11)).toEqual(expElem);
    });

    it('should have a badge of same number if number is greater than 0 & less than and equal to 9', () => {
        const expElem: ReactElement = <span className="badge">6</span>;
        expect(NumBadge(6)).toEqual(expElem);
    });
});

