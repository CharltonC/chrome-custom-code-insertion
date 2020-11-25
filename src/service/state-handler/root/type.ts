import { GeneralStateHandler } from './general.partial';
import { ListViewStateHandler } from './list-view.partial';
import { EditViewStateHandler } from './edit-view.partial';
import { ModalToggleStateHandler } from './modal-toggle.partial';
import { ModalContentStateHandler } from './modal-content.partial';
import { TbRowStateHandler } from './list-view-row.partial';

export interface IStateHandler extends GeneralStateHandler, ListViewStateHandler, EditViewStateHandler, ModalToggleStateHandler, ModalContentStateHandler, TbRowStateHandler {}