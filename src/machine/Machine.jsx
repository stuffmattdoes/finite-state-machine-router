import React, { useState } from 'react';
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory({
    basename: '/checkout',
});

const initialState = {
    current: 'loading',
    transition: () => {},
    matches: () => {}
};

export const StateMachineContext = React.createContext(initialState);

function Machine ({ children, url }) {
    const [ state, setState ] = useState(initialState);
    const matches = (compareState) => compareState === state.current;
    const transition = target => setState({ ...state, current: target });

    // TODO:
    // Compose URL routes and state machine from machine tree
    // React.Children.map(children, console.log);

    return <StateMachineContext.Provider value={{
        ...state,
        matches,
        transition
    }}>
        {children}
    </StateMachineContext.Provider>;
}

export default Machine;