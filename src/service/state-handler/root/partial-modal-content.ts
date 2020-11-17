import { StateHandle } from '../../handle/state';
import { AppState } from '../../model/app-state';
import { Setting } from '../../model/setting';

export class ModalContentStateHandler extends StateHandle.BaseStoreHandler {
    //// Settings
    onResultsPerPageChange({ setting }: AppState, resultsPerPageIdx: number) {
        return {
            setting: {
                ...setting,
                resultsPerPageIdx
            }
        };
    }

    onResetAll() {
        return {
            setting: new Setting()
        };
    }

    onDefHostRuleToggle({ setting }: AppState, key: string) {
        const { defRuleConfig } = setting;
        const isValid: boolean = key in defRuleConfig && typeof defRuleConfig[key] === 'boolean';
        if (!isValid) throw new Error('key is not valid');
        const val: boolean = defRuleConfig[key];

        return {
            setting: {
                ...setting,
                defRuleConfig: {
                    ...defRuleConfig,
                    [key]: !val
                }
            }
        };
    }

    onDefJsExecStageChange({ setting }: AppState, evt, idx: number) {
        const { defRuleConfig } = setting;
        return {
            setting: {
                ...setting,
                defRuleConfig: {
                    ...defRuleConfig,
                    jsExecPhase: idx
                }
            }
        };
    }

    onDelConfirmToggle({ setting }: AppState) {
        return {
            setting: {
                ...setting,
                showDeleteModal: !setting.showDeleteModal
            }
        };
    }

    //// Add/Edit Rule
    onEditItemIdChange({ localState }: AppState, { val, validState }) {
        const { targetItem, isTargetItemValValid } = localState;
        return {
            localState: {
                ...localState,
                isTargetItemIdValid: validState.isValid,
                allowModalConfirm: isTargetItemValValid && validState.isValid,
                targetItem: {
                    ...targetItem,
                    id: val
                },
            }
        };
    }

    onEditItemValChange({ localState }: AppState, { val, validState }) {
        const { targetItem, isTargetItemIdValid } = localState;
        return {
            localState: {
                ...localState,
                isTargetItemValValid: validState.isValid,
                allowModalConfirm: isTargetItemIdValid && validState.isValid,
                targetItem: {
                    ...targetItem,
                    value: val
                },
            }
        };
    }

    //// Import/Export Rules
    onImportFileChange({ localState }, { target }, { isValid }) {
        return {
            localState: {
                ...localState,
                importFile: target.files.item(0),
                allowModalConfirm: isValid
            }
        };
    }

    onExportFileNameChange({ localState }: AppState, { validState, val }) {
        const isValid = validState?.isValid ?? true;

        return {
            localState: {
                ...localState,
                allowModalConfirm: isValid,
                exportFileName: isValid ? val : null
            }
        };
    }
}