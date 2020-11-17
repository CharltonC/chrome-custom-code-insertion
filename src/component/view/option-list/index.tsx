import React from 'react';
import { resultsPerPage } from '../../../service/constant/result-per-page';
import { MemoComponent } from '../../extendable/memo-component';
import { DataGrid } from '../../widget/data-grid';
import { IconBtn } from '../../base/btn-icon';
import { Checkbox } from '../../base/checkbox';
import { TbRow } from './tb-row';
import { IProps } from './type';

export class OptionListView extends MemoComponent<IProps> {
    dataGridProps;

    constructor(props: IProps) {
        super(props);

        const { onPaginate } = props.storeHandler;

        // Fixed props for DataGrid component
        this.dataGridProps = {
            type: 'table',
            rowKey: 'id',
            expand: {
                onePerLevel: true
            },
            sort: {
                reset: true,
            },
            callback: {
                onPaginateChange: ({ pgnState }) => onPaginate(pgnState)
            }
        };
    }

    render() {
        const { props, dataGridProps } = this;
        const { store, storeHandler } = props;
        const { rules, localState } = store;

        const {
            areAllRowsSelected,
            searchedRules,
            selectedRowKeys,
            pgnPageIdx, pgnIncrmIdx,
        } = localState;

        const {
            onRowsSelectToggle,
            onDelModal
        } = storeHandler;

        const selectedTotal: number = Object.entries(selectedRowKeys).length;
        const allowDelAll: boolean = areAllRowsSelected || !!selectedTotal;
        const isPartialSelected = !areAllRowsSelected && !!selectedTotal;

        const selectAllHeader = (
            <Checkbox
                id="check-all"
                clsSuffix={isPartialSelected ? 'partial' : ''}
                disabled={!rules.length}
                checked={areAllRowsSelected || isPartialSelected}
                onChange={onRowsSelectToggle}
                />
        );

        // TODO: required to get the sorted data from DataGrid component
        const delAllHeader = (sortedData) => (
            <IconBtn
                icon="delete"
                theme="gray"
                disabled={!allowDelAll}
                onClick={() => onDelModal({ sortedData })}
                />
        );

        return (<>
            <DataGrid
                {...dataGridProps}
                data={searchedRules || rules}
                component={{
                    rows: [
                        [ TbRow ],
                        [ 'paths', TbRow ]
                    ],
                    commonProps: props
                }}
                header={[
                    { title: selectAllHeader as any},
                    { title: 'HTTPS' },
                    { title: 'ID', sortKey: 'id' },
                    { title: 'ADDRESS', sortKey: 'value' },
                    { title: 'SCRIPT EXECUTION' },
                    { title: 'JS' },
                    { title: 'CSS' },
                    { title: 'LIBRARY' },
                    { title: '' },
                    { title: '' },
                    { title: delAllHeader as any}
                ]}
                paginate={{
                    page: pgnPageIdx,
                    increment: resultsPerPage,
                    incrementIdx: pgnIncrmIdx,
                }}
                />
        </>);
    }
}