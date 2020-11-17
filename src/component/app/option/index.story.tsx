import React from 'react';
import { StateHandler } from '../../../service/state-handler/root';
import { StateHandle } from '../../../service/handle/state';
import { createMockAppState } from '../../../mock/app-state';
import { OptionApp } from '.';

const App = StateHandle.init(OptionApp, {
    root: [ createMockAppState(), new StateHandler() ],
});

export default {
    title: 'App - Option',
    component: OptionApp,
};

export const Default = () => <App />;