import { AppState } from '../../../service/model/app-state';
import { IStateHandler } from '../../../service/state-handler/root/type';
import { IAppProps } from '../../../service/handle/state/type';
import { IRowComponentProps } from '../../widget/data-grid/type';

export interface IProps extends IAppProps<AppState, IStateHandler> {}

export interface ITbRowProps extends IRowComponentProps {
    commonProps: IProps;
}