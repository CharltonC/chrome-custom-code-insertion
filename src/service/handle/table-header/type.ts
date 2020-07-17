//// Option
export interface IOption {
    title: string;
    sortKey?: string;
    subHeader?: IOption[]
}

//// State
export type TState = IThCtx[][];

export interface IThCtx {
    title: string;
    sortKey?: string;
    rowSpan?: number;
    colSpan?: number;
}

//// Other
export interface IThColCtx {
    title: string;
    ownColTotal?: number;
}

export interface IThColCtxCache {
    slots: IThColCtx[][];
    colTotal: number;
}
