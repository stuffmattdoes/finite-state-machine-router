import React, { useState } from 'react';
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory({
    basename: '/checkout',
});

export const StateMachineContext = React.createContext({
    current: 'loading',
    transition: () => {},
    matches: () => {}
});

function Machine ({ children, url }) {
    const [ state, setState ] = useState({
        current: 'loading'
    });

    function matches(compareState) {
        return compareState === state.current;
    }

    function transition (target) {
        setState({ ...state, current: target });
    }

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