import React, { memo } from 'react';
import { TbHeader } from './tb-header';
import { TbRow } from './tb-row';
import { DataGrid } from '../../widget/data-grid';

const mockData = [
    {
        https: true,
        id: 'Host ID 1',
        addr: 'www.abc.com',
        script_exec: 2,
        script_js: true,
        script_css: true,
        script_lib: true,
        paths: [
            {
                id: 'lorem1',
                addr: 'lorem',
                script_js: true,
                script_css: true,
                script_lib: true,
            },
            {
                id: 'lorem2',
                addr: 'lorem2',
                script_js: true,
                script_css: false,
                script_lib: true,
            }
        ],
    },
    {
        https: false,
        id: 'Host ID 2',
        addr: 'cnn.com',
        script_exec: 1,
        script_js: true,
        script_css: true,
        script_lib: false,
        paths: [
            {
                id: 'sum1',
                addr: 'sum',
                script_js: false,
                script_css: true,
                script_lib: true,
            }
        ],
    }
];

const dataGridConfig: any = {
    type: "table",
    component: {
        Header: TbHeader,
        rows: [
            [ TbRow ],
            [ 'paths', TbRow ]
        ]
    },
    rowKey: "id",
    header: [
        { title: '' },
        { title: 'HTTPS' },
        { title: 'ID', sortKey: 'id' },
        { title: 'ADDRESS', sortKey: 'addr' },
        { title: 'SCRIPT EXECUTION' },
        { title: 'JS' },
        { title: 'CSS' },
        { title: 'LIBRARY' },
        { title: '' },
        { title: '' },
        { title: '' }
    ],
    expand:{
        onePerLevel: true
    },
    sort: {
        key: 'name',
        isAsc: true,
        reset: true,
    },
    paginate:{
        page: 0,
        increment: [10, 25, 50],
    }
};

export const OptionListView = memo(({ data }: any) => {
    return (<>
        <DataGrid {...dataGridConfig} data={data} />
    </>);
});