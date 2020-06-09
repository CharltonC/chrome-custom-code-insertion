import React, { Component, memo, ReactElement } from "react";
import { inclStaticIcon } from '../../static/icon';
import { IProps, IState} from './type';

const dnArrowElem: ReactElement = inclStaticIcon('arrow-dn');

export class _Dropdown extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = this.getInitialState(props);
        this.onSelect = this.onSelect.bind(this);
    }

    /**
     * Only deal with `selectIdx` changes
     * - everything else is designed to be fixed/constant
     */
    shouldComponentUpdate({selectIdx}: IProps): boolean {
        const { list, selectIdx: oldSelectIdx } = this.props;
        if (typeof oldSelectIdx === 'undefined' || (selectIdx === oldSelectIdx)) return false;

        const state: IState = this.getInitialState({list, selectIdx});
        this.setState(state);
        return true;
    }

    getInitialState({list, selectIdx}: Partial<IProps>): IState {
        return {
            hsList: !!list.length,
            hsSelectIdx: typeof selectIdx !== 'undefined' && !!list[selectIdx]
        };
    }

    onSelect(evt: React.ChangeEvent<HTMLSelectElement>): void {
        const { onSelect } = this.props;
        const selectIdx: number = parseInt(evt.target.value);
        if (onSelect) onSelect(evt, selectIdx);
    }

    render() {
        const { id, list, border, selectIdx, disabled } = this.props;
        const { hsList, hsSelectIdx } = this.state;

        const baseCls: string = 'dropdown';
        const wrapperCls: string = border ? `${baseCls} ${baseCls}--border` : `${baseCls} ${baseCls}--plain`;
        const selectValueProp = hsSelectIdx ? { value: selectIdx } : {};

        return hsList ?
            <div className={wrapperCls}>
                <select id={id}
                    {...selectValueProp}
                    disabled={disabled}
                    onChange={this.onSelect}
                    >
                    { list.map((text: string, idx: number) =>
                        <option key={`${id}-${idx}`} value={idx}>{text}</option>
                    )}
                </select>
                { dnArrowElem }
            </div> :
            null;
    }
}

export const Dropdown = memo(_Dropdown);