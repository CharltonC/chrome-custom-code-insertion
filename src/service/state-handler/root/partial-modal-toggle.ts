import { StateHandle } from '../../handle/state';
import { AppState } from '../../model/app-state';
import { HostRuleConfig, PathRuleConfig } from '../../model/rule-config';
import { modals } from '../../constant/modals';
import { FileHandle } from '../../handle/file';

const { defSetting, importConfig, exportConfig, removeConfirm, editHost, editPath, addLib, editLib } = modals;
const fileHandle = new FileHandle();

export class ModalToggleStateHandler extends StateHandle.BaseStoreHandler {
    onModalOpen({ localState }: AppState, currModalId: string): Partial<AppState> {
        return {
            localState: {
                ...localState,
                currModalId
            }
        };
    }

    onModalCancel({ localState }: AppState): Partial<AppState> {
        return {
            localState: {
                ...localState,
                currModalId: null,
                allowModalConfirm: false,
                targetItem: null,
                targetItemIdx: null,
                targetChildItemIdx: null,
                isTargetItemIdValid:  false,
                isTargetItemValValid:  false,
            }
        };
    }

    onSettingModal(state: AppState) {
        return this.reflect.onModalOpen(state, defSetting.id);
    }

    onImportConfigModal(state: AppState) {
        return this.reflect.onModalOpen(state, importConfig.id);
    }

    onExportConfigModal(state: AppState) {
        return this.reflect.onModalOpen(state, exportConfig.id);
    }

    onDelModal(appState: AppState, {sortedData, ctxIdx, parentCtxIdx}) {
        const { localState, setting } = appState;
        const { showDeleteModal } = setting;
        const isDelSingleItem = typeof ctxIdx !== 'undefined';
        const baseModState = {
            ...localState,
            sortedData: sortedData.concat(),
            currModalId: removeConfirm.id,
        };
        const partialModState: Partial<AppState> = {
            localState: isDelSingleItem ? {
                    ...baseModState,
                    targetChildItemIdx: ctxIdx,
                    targetItemIdx: parentCtxIdx
                } : baseModState
        };
        return showDeleteModal ? partialModState : this.reflect.onDelModalConfirm({...appState, ...partialModState});
    }

    onDelModalConfirm(state: AppState) {
        return false;
        // TODO: Move condition logic to component
        // const { onModalCancel, onSearchedRowRmv, onSearchedRowsRmv, onRowRmv, onRowsRmv } = this.reflect;
        // const { targetChildItemIdx, targetItemIdx, searchedRules } = state.localState;
        // const isDelSingleItem = Number.isInteger(targetChildItemIdx);
        // const hsSearchResults = searchedRules?.length;

        // const resetLocalState = {
        //     ...onModalCancel(state).localState,
        //     pgnPageIdx: 0,
        //     pgnItemStartIdx: 0,
        //     pgnItemEndIdx: null,
        //     sortedData: null
        // };

        // if (isDelSingleItem) {
        //     const { rules, localState } = hsSearchResults ?
        //         onSearchedRowRmv(state, targetChildItemIdx, targetItemIdx) :
        //         onRowRmv(state, targetChildItemIdx, targetItemIdx);

        //     return {
        //         rules,
        //         localState: {
        //             ...localState,
        //             ...resetLocalState,
        //         }
        //     };

        // // If remove all items
        // } else {
        //     const { rules, localState } = hsSearchResults ?
        //         onSearchedRowsRmv(state) :
        //         onRowsRmv(state);

        //     return {
        //         localState: {
        //             ...localState,
        //             ...resetLocalState,
        //         },
        //         rules
        //     };
        // }
    }

    onAddHostModal({ localState }: AppState) {
        return {
            localState: {
                ...localState,
                currModalId: editHost.id,
                targetItem: new HostRuleConfig('', '')
            }
        };
    }

    onAddHostConfirm(state: AppState) {
        const { localState, rules, setting } = state;
        const cloneRules = rules.concat();
        const { targetItem } = localState;
        const resetState = this.reflect.onModalCancel(state);

        // merge with user config before added
        Object.assign(targetItem, setting.defRuleConfig);
        cloneRules.push(localState.targetItem);

        return {
            ...resetState,
            rules: cloneRules
        };
    }

    onAddPathModal({ localState }: AppState, idx: number) {
        return {
            localState: {
                ...localState,
                currModalId: editPath.id,
                targetItemIdx: idx,
                targetItem: new PathRuleConfig('', '')
            }
        };
    }

    onAddPathConfirm({ localState, rules, setting }: AppState) {
        const cloneRules = rules.concat();
        const { targetItem, targetItemIdx } = localState;
        const { isHttps, ...defConfig } = setting.defRuleConfig

        // merge with user config before added
        Object.assign(targetItem, defConfig);
        cloneRules[targetItemIdx].paths.push(targetItem);

        return {
            rules: cloneRules,
            localState: {
                ...localState,
                currModalId: null,
                targetItemIdx: null,
                allowModalConfirm: false,
                isTargetItemIdValid: false,
                isTargetItemValValid: false,
            }
        };
    }

    async onImportModalConfirm({ localState }: AppState) {
        return {
            rules: await fileHandle.readJson(localState.importFile),
            localState: {
                ...localState,
                currView: 'LIST',
                allowModalConfirm: false,
                importFile: null,
                currModalId: null
            }
        };
    }

    onExportModalConfirm({ rules, localState }: AppState) {
        const { exportFileName } = localState;
        fileHandle.saveJson(rules, exportFileName, true);

        return {
            localState: {
                ...localState,
                currModalId: null,
                allowModalConfirm: false,
                exportFileName: null
            }
        };
    }
}