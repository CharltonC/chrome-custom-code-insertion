import { AppState } from '../../../service/model/app-state';
import { IStateHandler } from '../../../service/state-handler/root/type';
import { IAppProps } from '../../../service/handle/state/type';

export interface IProps extends IAppProps<AppState, IStateHandler> {}