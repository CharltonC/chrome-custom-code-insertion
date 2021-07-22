import { StateHandle } from '../state';
import { ModalStateHandler } from './modal';
import { SettingStateHandler } from './setting';
import { DataStateHandler } from './data';
import { EditViewStateHandler } from './option-edit-view';
import { ListViewStateHandler } from './option-list-view';
import { IStateHandler } from './type';
import { HelperHandler } from './helper';

export const AppStateHandler = StateHandle.BaseStateHandler.join<IStateHandler>([
    ListViewStateHandler,
    EditViewStateHandler,
    ModalStateHandler,
    SettingStateHandler,
    DataStateHandler,
    HelperHandler,
]);