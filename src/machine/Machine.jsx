import React, { useState } from 'react';
import { createBrowserHistory } from 'history';

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

function Machine ({ children, id, url }) {
    const [ state, setState ] = useState({
        ...initialState,
        current: `#${id}`
    });
    const matches = (id) => state.current && state.current.includes(id);
    const resolveStack = (id) => setState({ ...state, current: `${state.current}.${id}` });
    const transition = (target) => setState({ ...state, current: `#${id}.${target}` });

    // console.log(state);

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