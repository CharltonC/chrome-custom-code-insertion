import { StateHandle } from '../../handle/state';
import { GeneralStateHandler } from './partial-general';
import { ModalToggleStateHandler } from './partial-modal-toggle';
import { ModalContentStateHandler } from './partial-modal-content';
import { TbRowStateHandler } from './partial-tb-row';
import { IStateHandler } from './type';

export const StateHandler = StateHandle.BaseStoreHandler.join<IStateHandler>([
    GeneralStateHandler,
    ModalToggleStateHandler,
    ModalContentStateHandler,
    TbRowStateHandler
]);