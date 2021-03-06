import { StateHandle } from '../../state';
import { AppState } from '../../../model/app-state';
import { SettingState } from '../../../model/setting-state';
import * as TSelectDropdown from '../../../component/base/select-dropdown/type';
import * as TFileInput from  '../../../component/base/input-file/type';

export class SettingStateHandler extends StateHandle.BaseStateHandler {
    //// Setting Modal Content
    onResultsPerPageChange({ setting }: AppState, payload: TSelectDropdown.IOnSelectArg) {
        const { selectValueAttrVal } = payload;
        return {
            setting: {
                ...setting,
                resultsPerPageIdx: selectValueAttrVal
            }
        };
    }

    onResetAll() {
        return {
            setting: new SettingState()
        };
    }

    onDefHostRuleToggle({ setting }: AppState, payload) {
        const { key } = payload;
        const { defRuleConfig } = setting;
        const isValid = key in defRuleConfig && typeof defRuleConfig[key] === 'boolean';
        if (!isValid) throw new Error('key is not valid');

        return {
            setting: {
                ...setting,
                defRuleConfig: {
                    ...defRuleConfig,
                    [key]: !defRuleConfig[key]
                }
            }
        };
    }

    onDefJsExecStageChange({ setting }: AppState, payload: TSelectDropdown.IOnSelectArg) {
        const { selectValueAttrVal } = payload;
        const { defRuleConfig } = setting;
        return {
            setting: {
                ...setting,
                defRuleConfig: {
                    ...defRuleConfig,
                    jsExecPhase: selectValueAttrVal
                }
            }
        };
    }

    onDelConfirmDialogToggle({ setting }: AppState) {
        return {
            setting: {
                ...setting,
                showDeleteModal: !setting.showDeleteModal
            }
        };
    }

    //// Json Import/Export Modal Content
    onImportConfigFileModalInputChange({ localState }, payload: TFileInput.IOnFileChange) {
        const { evt, isValid } = payload;
        return {
            localState: {
                ...localState,
                modalImportFileInput: evt.target.files.item(0),
                isModalConfirmBtnEnabled: isValid
            }
        };
    }

    onExportConfigFileModalInputChange({ localState }: AppState, payload) {
        const { isGte3, validState, val } = payload;
        const isValid = isGte3 && validState?.isValid;

        return {
            localState: {
                ...localState,
                modalExportFileInput: {
                    value: val,
                    isValid,
                    errMsg: validState?.errMsg,
                },
                isModalConfirmBtnEnabled: isValid,
            }
        };
    }
}