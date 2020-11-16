import { AppState } from '../../../service/model/app-state';
import { StateHandler } from '../../../service/state-handler/root';
import { IAppProps } from '../../../service/handle/state/type';

export interface IProps extends IAppProps<AppState, StateHandler> {}