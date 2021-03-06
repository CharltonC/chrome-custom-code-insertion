import React from 'react';
import { TextBtn } from '.';

export default {
    title: 'Base/Button/Text Button',
    component: TextBtn,
};

export const Default = () => (
    <>
        <TextBtn text="outline" outline />
        <TextBtn text="filled" style={{marginLeft: 20}}/>
    </>
);