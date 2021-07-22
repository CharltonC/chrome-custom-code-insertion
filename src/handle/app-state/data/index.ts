import { StateHandle } from '../../state';
import { AppState } from '../../../model/app-state';
import { HostRuleConfig } from '../../../model/rule-config';
import { IStateHandler } from '../type';
import * as TSelectDropdown from '../../../component/base/select-dropdown/type';
import { AJsExecPhase } from '../../../model/rule-config/type';

export class DataStateHandler extends StateHandle.BaseStateHandler {
    //// ADD RULE (Host/Path)
    onAddRuleModalInputChange({ localState }: AppState, payload): Partial<AppState> {
        const { val, isValid, errMsg, inputKey } = payload;

        // Check valid state of other text inputs in the same Modal
        // TODO: constant
        const inputKeys = ['titleInput', 'hostOrPathInput'];
        const isModalConfirmBtnEnabled = isValid && inputKeys
            .filter(key => key !== inputKey)
            .every(key => localState[key].isValid);

        return {
            localState: {
                ...localState,
                isModalConfirmBtnEnabled,
                [inputKey]: {
                    isValid,
                    errMsg,
                    value: val
                }
            }
        };
    }

    //// REMOVE RULE (Host/Path; used only in `reflect`)
    rmvRow({ localState }: AppState, idx: number, parentIdx?: number) {
        const { dataSrc } = localState;      // set by `onDelModal`
        const isSubRow = Number.isInteger(parentIdx);
        const modItems = isSubRow ? dataSrc[parentIdx].paths : dataSrc;
        modItems.splice(idx, 1);

        return {
            rules: dataSrc,
            localState: {}
        };
    }

    rmvSearchedRow(state: AppState, idx: number, parentIdx?: number) {
        const { reflect } = this;
        const { rules: currRules, localState } = state;
        const { searchedRules: currSearchedRules } = localState;
        const isSubRow = Number.isInteger(parentIdx);

        // Remove either row or sub row for searched rules
        const { rules: searchedRules } = reflect.rmvRow(state, idx, parentIdx);

        // If Not sub row, Remove corresponding row in global rules as well
        const ruleIdx = isSubRow ? null : currRules.indexOf(currSearchedRules[idx]);
        const modRules = isSubRow ? currRules : reflect.rmvRow({
            ...state,
            localState: {
                ...localState,
                dataSrc: currRules       // replace the ref & point to global rules
            }
        }, ruleIdx, null).rules;

        return {
            rules: modRules,
            localState: {
                searchedRules
            }
        };
    }

    rmvRows(state: AppState) {
        const { areAllRowsSelected } = state.localState.selectState;
        const { reflect } = this;
        return areAllRowsSelected ? reflect.rmvAllRows(state) : reflect.rmvPartialRows(state);
    }

    rmvAllRows({ localState }: AppState) {
        const { dataSrc, pgnOption, pgnState } = localState;
        const totalRules = dataSrc.length;
        const { startRowIdx, totalVisibleRows } = (this as unknown as IStateHandler).reflect.getRowIndexCtx(totalRules, pgnOption, pgnState);
        let modRules: HostRuleConfig[] = dataSrc.concat();

        // - if only 1 page regardless of pagination or not, remove all items
        // - if not, then only remove all items at that page
        if (totalRules <= totalVisibleRows) {
            modRules = [];

        } else {
            modRules.splice(startRowIdx, totalVisibleRows);
        }

        return {
            rules: modRules,
            localState: {}
        };
    }

    rmvPartialRows({ localState }: AppState ) {
        const { selectState, dataSrc } = localState;
        const rowIndexes: [string, boolean][] = Object.entries(selectState.selectedRowKeys);
        const selectedRowsTotal: number = rowIndexes.length - 1;
        let modRules: HostRuleConfig[] = dataSrc.concat();

        // Remove the item from the end of array so that it doesnt effect the indexes from the beginning
        for (let i = selectedRowsTotal; i >= 0; i--) {
            const rowIdx: number = Number(rowIndexes[i][0]);
            modRules.splice(rowIdx, 1);
        }

        return {
            rules: modRules,
            localState: {}
        };
    }

    rmvSearchedRows(state: AppState) {
        const { reflect } = this;
        const { localState, rules } = state;
        const { searchedRules } = localState;

        // Update the searched rules
        const { rules: modSearchedRules } = reflect.rmvRows(state);

        // Update corresponding global rules by Excluding all removed searched rows
        const removedSearchedRules = searchedRules.filter(rule => !modSearchedRules.includes(rule));
        const modRules: HostRuleConfig[] = rules.filter(rule => !removedSearchedRules.includes(rule));

        return {
            rules: modRules,
            localState: {
                searchedRules: modSearchedRules
            }
        };
    }

    //// EDIT RULE
    // TODO: see if we need its because we already have `onAddRuleModalInputChange`
    onItemTitleChange({ rules, localState }: AppState, payload) {
        return this._onTextInputChange({
            inputKey: 'titleInput',
            payload,
            rules,
            localState,
        });
    }

    onItemHostOrPathChange({ rules, localState }: AppState, payload) {
        return this._onTextInputChange({
            inputKey: 'hostOrPathInput',
            payload,
            rules,
            localState,
        });
    }

    //// SCRIPT EXEC STAGE & SWITCH
    // TODO: this is used in list view, remove duplicate ones for edit view
    onItemJsStageChange({ rules }: AppState, payload): Partial<AppState> {
        // TODO: Common
        const { parentCtxIdx, ctxIdx, selectIdx } = payload;
        const item = Number.isInteger(parentCtxIdx)
          ? rules[parentCtxIdx].paths[ctxIdx]
          : rules[ctxIdx];
        item.jsExecPhase = selectIdx;
        return { rules };
    }

    onItemSwitchToggle({ rules }: AppState, payload): Partial<AppState> {
        const { parentCtxIdx, ctxIdx, key } = payload;
        const item = Number.isInteger(parentCtxIdx)
          ? rules[parentCtxIdx].paths[ctxIdx]
          : rules[ctxIdx];
          item[key] = !item[key];
        return { rules };
    }

    // TODO: this is for edit view
    onItemJsExecStageChange({ rules, localState }: AppState, payload: TSelectDropdown.IOnSelectArg) {
        const item = this._getActiveItem({ rules, ...localState.activeRule });
        const { selectValueAttrVal } = payload;
        item.jsExecPhase = selectValueAttrVal as AJsExecPhase;
        return { rules };
    }

    // TODO: Payload as object in component
    onItemActiveTabChange({ rules, localState }: AppState, ...payload: any[]) {
        const item = this._getActiveItem({ rules, ...localState.activeRule });
        const [, , idx] = payload;
        item.activeTabIdx = idx;
        return { rules };
    }

    // TODO: Payload as object in component
    onItemTabEnable({ rules, localState }: AppState, ...payload: any[]) {
        const item = this._getActiveItem({ rules, ...localState.activeRule });
        const [ , { id, isOn } ] = payload;
        let key: string;
        switch(id) {
            case 'css':
                key = 'isCssOn';
                break;
            case 'js':
                key = 'isJsOn';
                break;
            case 'lib':
                key = 'isLibOn';
                break;
            default:
                throw new Error('key does not match');
        }
        item[key] = !isOn;
        return { rules };
    }

    onItemEditorCodeChange({ rules, localState }: AppState, payload) {
        const item = this._getActiveItem({ rules, ...localState.activeRule });
        const { codeMode, value } = payload;
        const key = `${codeMode}Code`;
        const hsKey = key in item;
        if (!hsKey) throw new Error('key does not match');

        item[key] = value;
        return { rules };
    }

    //// SHORTCUTS
    get _getActiveItem() {
        return (this as unknown as IStateHandler).reflect.getActiveItem;
    }

    get _onTextInputChange() {
        return ((this as unknown) as IStateHandler).reflect.onTextInputChange;
    }
}