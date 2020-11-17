import { GeneralStateHandler } from './partial-general';
import { ModalToggleStateHandler } from './partial-modal-toggle';
import { ModalContentStateHandler } from './partial-modal-content';
import { TbRowStateHandler } from './partial-tb-row';

export interface IStateHandler extends GeneralStateHandler, ModalToggleStateHandler, ModalContentStateHandler, TbRowStateHandler {}