import React, { useState } from 'react';
import { DataGridHeader } from './contextual-header';
import { DataGridPagination as PaginationCmp } from './contextual-pagination';
import { DataGrid } from '.';
import { IRowComponentProps } from './type';

export default {
    title: 'Widget/Data Grid',
    component: DataGrid,
};

const defStyle = {
    wrapper: {
        padding: 20
    },
    expdBtn: {
        width: '20px',
        height: '20px',
        lineHeight: '20px',
        border: '1px solid #8E8E8E',
        borderRadius: '5px',
        color: '#8E8E8E',
    }
};

const sampleData: any[] = [
    {

        name: 'Zack',
        age: '21',
        id: 'A1',
        isCollapsed: false,
        lvl1key: [
            {

                name: 'John',
                age: '21',
                id: 'A1-B1',
                isCollapsed: false,
                lvl2key: [
                    {

                        name: 'John',
                        age: '21',
                        id: 'A1-B1-C1',
                        isCollapsed: false,
                        lvl3key: [
                            {

                                name: 'John',
                                age: '21',
                                id: 'A1-B1-C1-D1',
                                isCollapsed: false,
                                lvl4key: [
                                    {
                                        name: 'John',
                                        age: '21',
                                        id: 'A1-B1-C1-D1-E1'},
                                    {
                                        name: 'John',
                                        age: '21',
                                        id: 'A1-B1-C1-D1-E2'},
                                ]
                            },
                            {
                                name: 'John',
                                age: '21',
                                id: 'A1-B1-C2-D2'},
                            {
                                name: 'John',
                                age: '21',
                                id: 'A1-B1-C1-D3'},
                            {
                                name: 'John',
                                age: '21',
                                id: 'A1-B1-C2-D4'}
                        ]
                    },
                    {
                        name: 'John',
                        age: '21',
                        id: 'A1-B1-C2'}
                ]
            },
            {

                name: 'John',
                age: '21',
                id: 'A1-B2',
                lvl2key: [
                    {
                        name: 'John',
                        age: '21',
                        id: 'A1-B2-C1'},
                    {
                        name: 'John',
                        age: '21',
                        id: 'A1-B2-C2'}
                ]
            }
        ]
    },
    {

        name: 'Jane',
        age: '10',
        id: 'A2',
        lvl1key: [
            {

                name: 'John',
                age: '21',
                id: 'A2-B1',
                lvl2key: [
                    {
                        name: 'John',
                        age: '21',
                        id: 'A2-B1-C1'},
                    {
                        name: 'John',
                        age: '21',
                        id: 'A2-B1-C2'}
                ]
            },
            {

                name: 'John',
                age: '21',
                id: 'A2-B2',
                lvl2key: [
                    {
                        name: 'John',
                        age: '21',
                        id: 'A2-B2-C1'},
                    {
                        name: 'John',
                        age: '21',
                        id: 'A2-B2-C2'}
                ]
            }
        ]
    },
    {
        name: 'Michael',
        age: '16',
        id: 'A3',
        lvl1key: [
            {

                name: 'John',
                age: '21',
                id: 'A3-B1',
            }
        ]
    }
];

const commonProps = {
    data: sampleData,
    rowKey: 'id',
    header: [
        { title: 'a', subHeader: [
            {title: 'a-1', subHeader: [
                {title: 'a-1-1'},
                {title: 'a-1-2'}
            ] },
            {title: 'a-2'}
        ]},
        {title: 'b'},
    ],
    expand: {
        // showAll: true,
        onePerLevel: true
    },
    sort: {
        key: 'name',
        isAsc: true,
        reset: true,
    },
    paginate: {
        page: 0,
        increment: [10, 5, 20],
    }
};

export const TableGrid = () => {
    const [ rowsExpdState, setRowsExpdState ] = useState({});

    const TrCmp = ({ item, itemId, nestedItems , classNames, expandProps }: IRowComponentProps) => {
        const { REG_ROW, NESTED_ROW, NESTED_GRID } = classNames;
        const { onClick }: any = nestedItems ? expandProps : {};
        const { name, age, id } = item;
        const isOpen = itemId in rowsExpdState;

        return <>
            <tr className={REG_ROW}>
                <td>{id}</td>
                <td>{name}</td>
                <td>{age}</td>
                <td>{ nestedItems &&
                    <button type="button" style={defStyle.expdBtn} onClick={onClick}>
                        {isOpen ? '-' : '+' }
                    </button>}
                </td>
            </tr>{ nestedItems && isOpen &&
            <tr className={NESTED_ROW}>
                {/* Customizable Cells and Column Span*/}
                <td colSpan={4}>
                    <table className={NESTED_GRID}>
                        {/* Customizable Header */}
                        <tbody>
                            {nestedItems}
                        </tbody>
                    </table>
                </td>
            </tr>}
        </>;
    };

    return <div style={defStyle.wrapper}>
        <DataGrid
            {...commonProps}
            type="table"
            header={[
                { title: 'id', sortKey: 'id' },
                { title: 'name', sortKey: 'name' },
                { title: 'age', sortKey: 'age' },
                { title: '' },
            ]}
            component={{
                Header: DataGridHeader,
                Pagination: PaginationCmp,
                rows: [
                    [TrCmp],
                    ['lvl1key', TrCmp],
                    ['lvl2key', TrCmp],
                    ['lvl3key', TrCmp],
                    ['lvl4key', TrCmp]
                ]
            }}
            callback={{
                onPaginateChange: (modState) => console.log(modState),
                onSortChange: (modState) => console.log(modState),
                onExpandChange: ({expdState}) => setRowsExpdState(expdState)
            }}
            />
    </div>;
};

export const ListGrid = () => {
    const ListCmp = ({ item, nestedItems, rowColStyle, classNames, expandProps }) => {
        const { REG_ROW, NESTED_ROW, NESTED_GRID } = classNames;
        const { isOpen, onClick }: any = nestedItems ? expandProps : {};
        const { name, age, id } = item;

        return <>
            <li style={rowColStyle} className={REG_ROW}>
                <span className="cell" data-header="id">{id}</span>
                <span className="cell" data-header="name">{name}</span>
                <span className="cell" data-header="age">{age}</span>
                <span className="cell">{ nestedItems &&
                    <button type="button" style={defStyle.expdBtn} onClick={onClick}>
                        {isOpen ? '-' : '+' }
                    </button>}
                </span>
            </li>{ nestedItems && isOpen &&
            <li className={NESTED_ROW}>
                {/* Customizable Cells and Column Span*/}
                <ul className={NESTED_GRID}>
                    {/* Customizable Header */}
                    {nestedItems}
                </ul>
            </li>}
        </>;
    };

    return <div style={defStyle.wrapper}>
        <DataGrid
            type="list"
            component={{
                Header: DataGridHeader,
                Pagination: PaginationCmp,
                rows: [
                    [ListCmp],
                    ['lvl1key', ListCmp],
                    ['lvl2key', ListCmp],
                    ['lvl3key', ListCmp],
                    ['lvl4key', ListCmp]
                ]
            }}
            {...commonProps}
            />
    </div>;
};