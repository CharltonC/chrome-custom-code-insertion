import { IOption, IState, ISelectedRowIndexes, IRowsContext } from './type';

export class RowSelectHandle {
    readonly ROW_IDX_ERR: string = '`rowIdx` value must be larger than or equal to `startRowIdx` and smaller than `endRowIdx`';

    getState(option: Partial<IOption> = {}): IState {
        const { isAll, rowsCtx, currState } = Object.assign(this.defOption, option);
        return isAll ? this.toggleSelectAll(currState) : this.toggleSelectOne(currState, rowsCtx);
    }

    /**
     * Toggle Selection (checkboxes) for all rows:
     * - if 1 or more rows are already selected, Unselect them all
     * - if all rows are selected, Unselect them all
     * - if no rows are selected, Select them all
     */
    toggleSelectAll({ areAllRowsSelected, selectedRowKeys }: IState): IState {
        const isPartiallySelected = selectedRowKeys ? Object.getOwnPropertyNames(selectedRowKeys).length : false;
        return {
            areAllRowsSelected: isPartiallySelected ? false : !areAllRowsSelected,
            selectedRowKeys: {},
        };
    }

    toggleSelectOne({ areAllRowsSelected, selectedRowKeys }: IState, { startRowIdx, endRowIdx, rowIdx }: IRowsContext): IState {
        const { toggleSelect, ROW_IDX_ERR } = this;
        const totalItems: number = endRowIdx - startRowIdx;             // since `endRowIdx` is not inclusive
        const selectedRowKeysCopy = { ...selectedRowKeys };
        const isRowSelected = selectedRowKeys[rowIdx];

        if (rowIdx < startRowIdx || rowIdx >= endRowIdx) throw new Error(ROW_IDX_ERR);

        // Add the rest of checkboxes to selected except current one
        if (areAllRowsSelected) {
            for (let i = startRowIdx; i < endRowIdx; i++) {
                const isCurrRow = i === rowIdx;
                const isSelected = i in selectedRowKeysCopy;
                const isCurrRowSelected = isCurrRow && isSelected;
                const isUnselectedNonCurrRow = !isCurrRow && !isSelected;

                if (isCurrRowSelected) {
                    toggleSelect(selectedRowKeysCopy, i, false);

                } else if (isUnselectedNonCurrRow) {
                    toggleSelect(selectedRowKeysCopy, i);
                }
            }

        // Toggle the current checkbox
        } else {
            toggleSelect(selectedRowKeysCopy, rowIdx, !isRowSelected);
        }

        // if All checkboxes are selected at that page AFTER the abv operation
        const wereAllSelected = Object.entries(selectedRowKeysCopy).length === totalItems;

        return {
            areAllRowsSelected: wereAllSelected ? true : (areAllRowsSelected ? false : areAllRowsSelected),
            selectedRowKeys: wereAllSelected ? {} : selectedRowKeysCopy
        };
    }

    toggleSelect(selectedRowKeys: ISelectedRowIndexes, rowIdx: number, doSelect: boolean = true) {
        selectedRowKeys[rowIdx] = doSelect ? true : null;
        if (!doSelect) delete selectedRowKeys[rowIdx];
    }

    get defState(): IState {
        return {
            areAllRowsSelected: false,
            selectedRowKeys: {}
        };
    }

    get defOption(): IOption {
        return {
            isAll: true,
            rowsCtx: null,
            currState: this.defState
        };
    }
}