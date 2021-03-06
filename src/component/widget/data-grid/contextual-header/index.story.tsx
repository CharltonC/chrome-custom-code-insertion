import React, { useState } from 'react';
import { DataGridHeader } from '.';

export default {
    title: 'Widget/Data Grid/Table Grid Header',
    component: DataGridHeader,
};

const defStyle = {};

export const TableHeaderGroup = () => {
    const rows = {
        rowTotal: 2,
        colTotal: 2,
        headers: [
            [ {title: 'A', colSpan: 2}, {title: 'B', rowSpan: 2} ],
            [ {title: 'A1'}, {title: 'A2'} ]
        ]
    };

    return (
        <table style={defStyle} >
            <DataGridHeader rows={rows} data={[]} />
        </table>
    );
};

export const ListHeaderGroup = () => {
    const [ sortState, setSortState ] = useState({
        isAsc: true,
        key: 'name'
    });

    const sortBtnProps = (sortKey) => {
        return {
            isAsc: sortState.key === sortKey ? sortState.isAsc : null,
            onClick: () => setSortState({
                key: sortKey,
                isAsc: sortState.key === sortKey ? !sortState.isAsc : true
            })
        };
    }

    const rows = {
        rowTotal: 2,
        colTotal: 3,
        headers: [
            { title: 'A', sortKey: 'name', gridColumn: '1/3', gridRow: '1/2' },
            { title: 'A-1', sortKey: 'first name', gridColumn: '1/2', gridRow: '2/3' },
            { title: 'A-2', sortKey: 'last name', gridColumn: '2/3', gridRow: '2/3' },
            { title: 'B', sortKey: 'age', gridColumn: '3/4', gridRow: '1/3' },
        ],
        gridTemplateColumns: '',
        gridTemplateRows: ''
    };

    return (
        <table style={defStyle} >
            <DataGridHeader
                type="list"
                rows={rows}
                data={[]}
                sortBtnProps={sortBtnProps}
                />
        </table>
    );
};