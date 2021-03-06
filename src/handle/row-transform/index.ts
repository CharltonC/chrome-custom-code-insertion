import {
    IOption, IRawRowsOption, IParsedRowsOption,
    IRowItemBaseCtx, TRowType, IErrMsg, ICtxRowsQuery, IRowItemCtx,
} from './type';

export class RowTransformHandle {
    readonly errMsg: IErrMsg = {
        ROW_KEY_MISSING: 'Key in Row Config is missing',
        ROW_KEY_TYPE: 'Key in Row Config must be a string',
        PROP_DATA_TYPE: 'Data must be an array',
    };

    //// Core
    createOption(modOption: Partial<IOption>, existingOption?: IOption): IOption {
        const baseOption = existingOption ? existingOption : {
            data: [],
            rows: [],
            rowIdKey: 'id',
            showAll: false,
            pgnStartIdx: 0
        };
        return { ...baseOption, ...modOption };
    }

    createCtxRows<T = IRowItemCtx>(option: Partial<IOption> = {}): T[] {
        const { data, rows, rowIdKey, showAll, pgnStartIdx }: any = this.createOption(option);

        // Skip if data has no rows OR config doesnt exist
        const _data: any[] = this.getValidatedData(data);
        if (!_data) return;

        return this.getCtxRows<T>({data, rows, rowLvl: 0, rowIdKey, parentPath: '', showAll, pgnStartIdx});
    }

    /**
     *
     * Usage in React:
     * .getCtxRows({
     *      data: <dataArray>,
     *      rowLvl: 0,       // starting index for rows
     *      rowConfig: [    //
     *          [ (itemCtx) => <newStuffToReturn>? ]
     *          ['nestedDataLvl1Key', (itemCtx) => <newStuffToReturn>? ]
     *          ['nestedDataLvl2Key', (itemCtx) => <newStuffToReturn>? ]
     *      ]
     * })
     */
    getCtxRows<T = IRowItemCtx>(ctxRowsQuery: ICtxRowsQuery): T[] {
        const { data, rows, rowIdKey, rowLvl, pgnStartIdx, parentPath, showAll, parentItemCtx }: any = ctxRowsQuery;
        const { rowKey, transformFn }: IParsedRowsOption = this.parseRowConfig(rows[rowLvl], rowLvl);

        return data.map((item: any, idx: number) => {
            // Self
            const baseRowItemCtx: IRowItemBaseCtx = {
                ctxIdx: typeof pgnStartIdx !== 'undefined' ? (idx + pgnStartIdx) : null,
                idx: idx,
                rowType: this.getRowType(idx),
                item,
                itemPath: this.getItemPath(idx, rowKey, parentPath),
                parentPath: parentPath,
                itemKey: rowKey,
                itemLvl: rowLvl,
            };
            const itemCtx: IRowItemCtx<T[]> = {
                ...baseRowItemCtx,
                itemId: typeof rowIdKey === 'function' ? rowIdKey(baseRowItemCtx) : item[rowIdKey],
                parentItemCtx,
                nestedItems: null,
                isExpdByDef: null
            };

            // Nested Items
            const nestedItems: T[] = this.getCtxNestedRows<T>({
                ...ctxRowsQuery,
                data: item,
                rowLvl: rowLvl + 1,
                parentPath: baseRowItemCtx.itemPath,
                parentItemCtx: itemCtx,
            });
            Object.assign(itemCtx, {
                nestedItems,
                isExpdByDef: !!nestedItems?.length && showAll
            })

            return transformFn ? transformFn(itemCtx) : itemCtx;
        });
    }

    getCtxNestedRows<T = IRowItemCtx>(ctxRowsQuery: ICtxRowsQuery): T[] {
        const { data, rows, rowLvl } = ctxRowsQuery;
        const nestedData: any[] = this.getValidatedData(data, rows[rowLvl]);
        return nestedData ? this.getCtxRows<T>({...ctxRowsQuery, data: nestedData}) : null;
    }

    //// Helper Methods
    parseRowConfig(config: IRawRowsOption, rowLvl: number): IParsedRowsOption {
        let [ itemOne, itemTwo ] = config;
        itemOne = itemOne ? itemOne : null;
        itemTwo = itemTwo ? itemTwo : null;

        const isTopLvl: boolean = rowLvl === 0;

        const rowKey = (isTopLvl ? '' : itemOne) as string;
        const transformFn = (isTopLvl ?
            (typeof itemOne === 'function' ? itemOne : null) :
            itemTwo ? itemTwo : null
        ) as AFn;

        return { rowKey, transformFn };
    }

    // Check if row config, row key, and data exists & has at least 1 item
    getValidatedData(target: any, config?: IRawRowsOption): any[] {
        //// When Target is an array, config is optional
        if (Array.isArray(target)) return !!target.length ? target : null;

        //// When Target is an object whose property is an array
        // If config doesnt exist
        const { ROW_KEY_MISSING, ROW_KEY_TYPE, PROP_DATA_TYPE } = this.errMsg;
        if (!config) return null;

        // If row key doesnt exist or not a string
        const [ rowKey ] = config;
        if (!rowKey) throw new Error(ROW_KEY_MISSING);
        if (typeof rowKey !== 'string') throw new Error(ROW_KEY_TYPE);

        let val: any[] = (rowKey as string)
            .split('/')
            .reduce((_target, key: string) => target[key], target);

        // If nested property found based on the row key is not an array
        const isAry: boolean = Array.isArray(val);
        if (val && !isAry) throw new Error(PROP_DATA_TYPE);

        return isAry && !!val.length ? val : null;
    }

    getItemPath(idx: number, rowKey: string, prefixCtx: string): string {
        const suffixCtx: string = rowKey ? [rowKey, idx].join(':') : `${idx}`;
        const rowCtx: string = prefixCtx ? [prefixCtx, suffixCtx].join('/') : suffixCtx;
        return rowCtx;
    }

    getRowType(rowIdx: number): TRowType {
        return rowIdx % 2 === 0 ? 'odd' : 'even';
    }

    isGteZeroInt(val: number): boolean {
       return Number.isInteger(val) && val >= 0;
    }
}