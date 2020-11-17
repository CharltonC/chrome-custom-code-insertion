import { StateHandle } from '../../handle/state';
import { AppState } from '../../model/app-state';
import { LocalState } from '../../model/local-state';
import { HostRuleConfig } from '../../model/rule-config';
import { resultsPerPage } from '../../constant/result-per-page';

export class GeneralStateHandler extends StateHandle.BaseStoreHandler {
    //// Common
    // TODO: debounce at component
    onSearch({ localState, rules }: AppState, evt, val: string, gte3Char: boolean): Partial<AppState> {
        const baseLocalState = {
            ...localState,
            searchedText: val
        };

        if (!val) return {
            localState: {
                ...baseLocalState,
                searchedRules: null,
            }
        };

        if (!gte3Char) return { localState: baseLocalState };

        const searchedRules: HostRuleConfig[] = val
            .split(/\s+/)
            .reduce((filteredRules: HostRuleConfig[], text: string) => {
                return filteredRules.filter(({ id, value, paths }: HostRuleConfig) => {
                    const isIdMatch = id.indexOf(text) !== -1;
                    if (isIdMatch) return true;

                    const isValMatch = value.indexOf(text) !== -1;
                    if (isValMatch) return true;

                    return paths.some(({ id: childId, value: childValue}) => {
                        return (childId.indexOf(text) !== -1) || (childValue.indexOf(text) !== -1);
                    });
                });
            }, rules);

        return {
            localState: {
                ...baseLocalState,
                searchedRules,
            }
        };
    }

    onSearchClear({ localState }: AppState) {
        return {
            localState: {
                ...localState,
                searchedRules: null,
                searchedText: ''
            }
        };
    }

    //// List View
    onListView({localState}: AppState): Partial<AppState> {
        const { pgnIncrmIdx } = localState;   // maintain the only pagination setting
        const resetLocalState = new LocalState();

        return {
            localState: {
                ...resetLocalState,
                pgnIncrmIdx,
                currView: 'LIST',
            }
        };
    }

    onListItemClick({ localState }: AppState, ...[, { item }]) {
        return {
            localState: {
                ...localState,
                targetItem: item,
            }
        };
    }

    //// Edit View
    onPaginate({ localState}: AppState, { curr, perPage, startIdx, endIdx }) {
        const pgnIncrmIdx: number = resultsPerPage.indexOf(perPage);

        return {
            localState: {
                ...localState,

                // clear all selections
                areAllRowsSelected: false,
                selectedRowKeys: {},

                // pagination state
                pgnPageIdx: curr,
                pgnIncrmIdx,
                pgnItemStartIdx: startIdx,
                pgnItemEndIdx: endIdx,
            }
        };
    }
}