import * as NIcon from '../../static/icon/type';

export interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon: NIcon.TIcon;
    theme?: NIcon.TTheme;
    clsSuffix?: string | string[];
}