import React, { memo } from 'react';
import { IProps } from './type';
import { UtilHandle } from '../../../service/handle/util';

const { cssCls } = UtilHandle.prototype;

export const Checkbox: React.FC<IProps> = memo((props: IProps) => {
    const { id, label, ltLabel, clsSuffix, ...inputProps } = props;
    const className: string = cssCls('checkbox', (clsSuffix ?? '') + `${ltLabel ? 'lt-label' : ''}`);

    return (
        <div className={className}>
            <input
                type="checkbox"
                id={id}
                name={id}
                {...inputProps}
                />{ label &&
            <label htmlFor={id}>{label}</label> }
        </div>
    );
});