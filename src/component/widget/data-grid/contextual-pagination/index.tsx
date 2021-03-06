import React from "react";
import { MemoComponent } from '../../../extendable/memo-component';
import { Dropdown } from '../../../base/select-dropdown';
import { inclStaticIcon } from '../../../static/icon';

import {
    IProps, IBtnProps, ISelectProps,
    TPgnHandle
 } from './type';

const CLS_PREFIX = 'paginate';
const $ltArrow = inclStaticIcon('arrow-lt');
const $rtArrow = inclStaticIcon('arrow-rt');

export class DataGridPagination extends MemoComponent<IProps> {
    render() {
        const {
            startRecord, endRecord, totalRecord,
            firstBtnAttr, prevBtnAttr, nextBtnAttr, lastBtnAttr,
            pageSelectAttr, perPageSelectAttr,
        } = this.props;

        const perPageSelectProps: ISelectProps = this.getMappedSelectProps(perPageSelectAttr, true);
        const pageSelectProps: ISelectProps = this.getMappedSelectProps(pageSelectAttr, false);
        const firstBtnProps: IBtnProps = this.getMappedBtnProps(firstBtnAttr, 'first');
        const prevBtnProps: IBtnProps = this.getMappedBtnProps(prevBtnAttr, 'prev');
        const nextBtnProps: IBtnProps = this.getMappedBtnProps(nextBtnAttr, 'next');
        const lastBtnProps: IBtnProps = this.getMappedBtnProps(lastBtnAttr, 'last');

        return (
            <div className={CLS_PREFIX}>
                <p className={`${CLS_PREFIX}__record`}>Showing {startRecord} - {endRecord} of {totalRecord}</p>
                <Dropdown {...perPageSelectProps} />
                <button {...firstBtnProps}>{$ltArrow}{$ltArrow}</button>
                <button {...prevBtnProps}>{$ltArrow}</button>
                <Dropdown {...pageSelectProps} />
                <button {...nextBtnProps}>{$rtArrow}</button>
                <button {...lastBtnProps}>{$rtArrow}{$rtArrow}</button>
            </div>
        );
    }

    getOptionTextPipe(isPerPage: boolean): (val: any) => string {
        return isPerPage ?
            (text: string | number) => `${text} Per Page` :
            (text: string | number) => Number.isInteger(text as number) ? `Page ${text}` : `${text}`;
    }

    getMappedBtnProps(btnAttr: TPgnHandle.ICmpBtnAttr, btnName: string): IBtnProps {
        const { disabled, onClick } = btnAttr;
        return {
            type: 'button',
            className:`${CLS_PREFIX}__btn ${CLS_PREFIX}__btn--${btnName}`,
            disabled,
            onClick
        }
    }

    getMappedSelectProps(selectAttr: TPgnHandle.ICmpSelectAttr, isPerPage: boolean): ISelectProps {
        const { disabled, options, selectedOptionIdx, onSelect, } = selectAttr;
        return {
            clsSuffix: isPerPage ? 'perpage' : 'page',
            border: true,
            disabled,
            list: options,
            listTxtTransform: this.getOptionTextPipe(isPerPage),
            selectIdx: selectedOptionIdx,
            onSelect,
        };
    }
}