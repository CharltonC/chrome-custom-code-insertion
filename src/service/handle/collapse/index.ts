import { IUserRowConfig, IRowConfig, TClpsShowTarget, TData, TFn, IItemsReq, IItems } from './type';

export class ClpsConfig {
    data: any[] = [];
    rowConfigs: IUserRowConfig[] = [];
    showTargetCtx?: TClpsShowTarget = 'ALL';       // setting this to be diff. value will trigger change in React
}

export class ClpsHandle {
    // Dont use `g` flag here as it conflicts w/ regex.test()/str.search()
    readonly ctxPattern: RegExp = /^(\d+)(\/([a-z]+:?)\d*)*/i;
    readonly ctxCapPattern: RegExp = /(([a-z]+):?)?(\d*)/i;
    readonly defClpsConfig = new ClpsConfig();

    getClpsState(clpsConfig?: ClpsConfig): any[] {
        const { data, rowConfigs, showTargetCtx }: ClpsConfig = Object.assign(this.defClpsConfig, clpsConfig);

        // Skip if data has no rows OR config doesnt exist
        const isValidConfig: boolean = this.validateMapping(data);
        if (!isValidConfig) return;

        return this.getMappedItems({data, rowConfigs, rowLvl: 0, prevItemCtx: '', showTargetCtx});
    }

    /**
     *
     * Usage in React:
     * .getMappedItems({
     *      data: <dataArray>,
     *      rowLvl: 0,       // starting index for rowConfigs
     *      rowConfig: [    //
     *          [ (mappedItem) => <newStuffToReturn>? ]
     *          ['nestedDataLvl1Key', (mappedItem) => <newStuffToReturn>? ]
     *          ['nestedDataLvl2Key', (mappedItem) => <newStuffToReturn>? ]
     *      ]
     * })
     */
    getMappedItems<TRtnType>(itemsReq: IItemsReq): IItems[] | TRtnType[] {
        const { data, rowConfigs, rowLvl, prevItemCtx, showTargetCtx }: IItemsReq = itemsReq;
        const { rowKey, transformFn }: IRowConfig = this.parseRowConfig(rowConfigs[rowLvl], rowLvl);

        return data.map((item: any, idx: number) => {
            // This Item
            const itemCtx: string = this.getRowCtx(idx, rowKey, prevItemCtx);

            // Nested Items
            const nestedItems: IItems[] = this.getNestedMappedItems({
                ...itemsReq,
                data: item,
                rowLvl: rowLvl+1,
                prevItemCtx: itemCtx
            });
            const isNestedOpen: boolean = nestedItems ? this.isNestedOpen(itemCtx, showTargetCtx) : false;

            // Return item
            const mappedItem: IItems = { idx, item, itemCtx, nestedItems, isNestedOpen };
            return transformFn ? transformFn(mappedItem) : mappedItem;
        });
    }

    getNestedMappedItems(itemsReq: IItemsReq): IItems[] {
        const { data, rowConfigs, rowLvl } = itemsReq;
        const isValidConfig: boolean = this.validateMapping(data, rowConfigs[rowLvl]);
        return isValidConfig ? this.getMappedItems(itemsReq) : null;
    }

    /**
     * Assume the Context of Current Collapse Item is:
     * "0/lvl1NestedKey:0/lvl2NestedKey:0",
     *
     * Then the Context of relevant parents items that should remain open (i.e. isNestedOpen: true) are:
     * - "0",
     * - "0/lvl1NestedKey:0"
     *
     * So the collapse state for all relavant items should be:
     * {
     *      "0": true
     *      "0/lvl1NestedKey:0": true,
     *      "0/lvl1NestedKey:0/lvl2NestedKey:0": <oppositeOfPrevCollapseState>
     * }
     */
    isNestedOpen(rowCtx: string, showTargetCtx: TClpsShowTarget): boolean {
        return Array.isArray(showTargetCtx) ?
            showTargetCtx.some((showTarget: string) => showTarget.indexOf(rowCtx, 0) === 0) :
            (showTargetCtx === 'ALL' ? true : false);
    }

    parseRowConfig(config: IUserRowConfig, rowLvl: number): IRowConfig {
        let [ itemOne, itemTwo ] = config;
        itemOne = itemOne ? itemOne : null;
        itemTwo = itemTwo ? itemTwo : null;

        const isTopLvl: boolean = rowLvl === 0;

        const rowKey = (isTopLvl ? '' : itemOne) as string;
        const transformFn = (isTopLvl ?
            (typeof itemOne === 'function' ? itemOne : null) :
            itemTwo ? itemTwo : null
        ) as TFn;

        return { rowKey, transformFn };
    }

    // Check if row config, row key, and data exists & has at least 1 item
    validateMapping(target: TData, config?: IUserRowConfig): boolean {
        // If it is an array, config is optional
        if (Array.isArray(target)) return !!target.length;

        // If it is nested data
        if (!config) return false;

        const [ rowKey ] = config;
        if (!rowKey) return false;

        const nestedData: any[] = target[rowKey as string];
        return Array.isArray(nestedData) && !!nestedData.length;
    }

    getRowCtx(idx: number, rowKey: string, prefixCtx: string): string {
        const suffixCtx: string = rowKey ? [rowKey, idx].join(':') : `${idx}`;
        const rowCtx: string = prefixCtx ? [prefixCtx, suffixCtx].join('/') : suffixCtx;
        return rowCtx;
    }

    findItemInData<T>(data: T[], itemCtx: string): T {
        if (!data.length || !itemCtx) return;
        const dataCopy: T[] = data.slice(0);

        if (!this.ctxPattern.test(itemCtx)) return;

        const ctxs: string[] = itemCtx.split('/');
        const matchItem: T | T[] = ctxs.reduce((_data: T[], ctx: string) => {
            // 1st value is the entire match; 2nd value is 1st inner bracket captures the `[a-zA-z]:` (no `g` flag here in order to capture)
            const [, , key, _idx ] = ctx.match(this.ctxCapPattern);
            const idx: number = parseFloat(_idx);
            const hsIdx: boolean = this.isGteZeroInt(idx);
            const hsKey: boolean = !!key;
            try {
                const result = (hsKey && hsIdx) ?
                    _data[key][idx] :
                    (hsIdx ? _data[idx] : _data[key]);
                return result;
            } catch (err) {
                return dataCopy;
            }
        }, dataCopy);

        // If we ends up with the data itself, Means we can't find any matched item
        return (matchItem !== dataCopy) ? matchItem as T : null;
    }

    isGteZeroInt(val: number): boolean {
       return Number.isInteger(val) && val >= 0;
    }
}