import React, { useState } from 'react';
import { GridHeader } from '.';

export default {
    title: 'Table Header',
    component: GridHeader,
};

const defStyle = {};

export const WithoutSortButton = () => {
    const sampleThRowsContext = [
        [ {title: 'A', colSpan: 2}, {title: 'B', rowSpan: 2} ],
        [ {title: 'A1'}, {title: 'A2'} ]
    ];

    return (
        <table style={defStyle} >
            <GridHeader thRowsContext={sampleThRowsContext} />
        </table>
    );
};

export const WithSortButton = () => {
    const [ sortState, setSortState ] = useState({
        isAsc: true,
        key: 'name'
    });

    const sampleThRowsContext = [
        [ {title: 'A', sortKey: 'name'}, {title: 'B', sortKey: 'age'} ]
    ];

    const sortBtnProps = (sortKey) => {
        return {
            isAsc: sortState.key === sortKey ? sortState.isAsc : null,
            onClick: () => setSortState({
                key: sortKey,
                isAsc: sortState.key === sortKey ? !sortState.isAsc : true
            })
        };
    }

    return (
        <table style={defStyle} >
            <GridHeader
                thRowsContext={sampleThRowsContext}
                sortBtnProps={sortBtnProps}
                />
        </table>
    );
};