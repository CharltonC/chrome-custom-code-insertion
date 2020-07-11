import { ReactElement } from "react";

import * as expdHandleType from '../../../service/handle/expand/type';
import * as pgnHandleType from '../../../service/handle/paginate/type';
import * as thHandleType from '../../../service/handle/table-header/type';
import * as dropdownType from '../../prsntn/dropdown/type';

//// Props
export interface IProps extends React.HTMLAttributes<HTMLElement> {
    data: any[];
    rows: IRow[];
    type?: TGridType;
    header?: thHandleType.IThConfig[];
    expand?: IExpandOption;
    sort?: ISortOption;
    paginate?: Partial<pgnHandleType.IOption>;
}

export type TCmpCls = React.FC<any> | React.ComponentClass<any>;

export type TGridType = 'table' | 'list';

export interface ISortOption {
    key: string;
    isAsc?: boolean;
}

export interface IExpandOption {
    showInitial?: expdHandleType.TVisibleNestablePath;
    showOnePerLvl?: boolean;
}

export interface IRow extends Array<any> {
    0: string | TCmpCls;
    1?: TCmpCls;
}

//// State
export interface IState {
    expandState: TExpandState;
    sortState: ISortState;
    pgnState: IPgnState;
    thState: thHandleType.IThCtx[][]
}

export type TExpandState = Record<string, boolean>;

export interface ISortState {
    option: ISortOption;
    data: any[];
}

export interface INestedRowProps extends React.HTMLAttributes<HTMLElement> {
    item: {[k: string]: any};
    nestedRow?: ReactElement;
}

export type TShallResetState = {
    [K in keyof IState]: boolean;
}


//// Expand/Collapse
export interface IClpsProps {
    isNestedOpen?: boolean;
    onCollapseChanged?: TFn;
}


//// Pagination
export interface IPgnState {
    option: pgnHandleType.IOption;
    status: pgnHandleType.IState;
}

export interface IPgnProps {
    firstBtnProps: TBtnProps;
    prevBtnProps: TBtnProps;
    nextBtnProps: TBtnProps;
    lastBtnProps: TBtnProps;
    perPageSelectProps: dropdownType.IProps;
    pageSelectProps: dropdownType.IProps;
}

export interface IPgnPropsCtx {
    data: any[];
    option: pgnHandleType.IOption;
    callback?: TPgnCallback;
}

export type TPgnCallback = (pgnState: IPgnState) => any;

export {pgnHandleType as pgnHandleType};
export {dropdownType as dropdownType}


//// Generic
export type TFn = (...args: any[]) => any;
export type TBtnProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type TSelectEvt = React.ChangeEvent<HTMLSelectElement>;


//// Reexport
export {expdHandleType as expdHandleType};
export {thHandleType as thHandleType};
export * as sortBtnType from '../../prsntn/sort-btn/type';
export * as paginationType from '../../prsntn/pagination/type';