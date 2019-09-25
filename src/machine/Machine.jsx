import React, { useState } from 'react';
import { createBrowserHistory } from 'history';
import { log } from './util';

export const history = createBrowserHistory({
    basename: '/checkout',
});

const initialState = {
    // current: {
    //     value: 'loading',
    //     full: null
    // },
    current: null,
    matches: (id) => {},
    resolveStack: (id) => {},
    transition: (target) => {}
};

export const StateMachineContext = React.createContext(initialState);
StateMachineContext.displayName = 'Machine';

function Machine ({ children, id, url }) {
    const [ state, setState ] = useState({
        ...initialState,
        current: `#${id}`,
        id
    });
    const matches = (id) => {
        // Match entire stack to current stack
        const matches = state.current.split('.').includes(id);

        if (matches) {
            console.log('Initial state:', id, state.current);
        }

        return matches
    }
    const resolveStack = (target) => setState({ ...state, current: `${state.current}.${target}` });
    const transition = (event, target) => {
        log(state, event, target);
        setState({ ...state, current: `#${id}.${target}` });
    };

    // console.log('state', state.current);

    return <StateMachineContext.Provider value={{
        ...state,
        matches,
        resolveStack,
        transition
    }}>
        {children}
    </StateMachineContext.Provider>;
}

export default Machine;
