import { AppState } from '../../../service/model/app-state';
import { StateHandler } from '../../../service/state-handler/root';
import { IAppProps } from '../../../service/handle/state/type';
import { IRowComponentProps } from '../../widget/data-grid/type';

export type IProps = IAppProps<AppState, StateHandler>;

export interface ITbRowProps extends IRowComponentProps {
    commonProps: IProps;
}