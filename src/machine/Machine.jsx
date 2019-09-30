import React, { useState } from 'react';
import { createBrowserHistory } from 'history';
// import { log } from './util';

export const StateMachineContext = React.createContext();
StateMachineContext.displayName = 'Machine';

export function Machine ({ children, history, id, url }) {
    const [ state, setState ] = useState({
        current: `#${id}`,
        id
    });

    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: url });
    }
    
    const matches = (stateId) => state.current.split('.').includes(stateId);
    const resolveStack = (stack) => {
        console.log('resolveStack', stack);
        setState({ ...state, current: `#${id}.${stack}` });
    }
    const resolveUrl = (url) => {
        console.log('resolveUrl', url);
        history.push(url);
    }
    const transition = (event, target) => setState({ ...state, current: `#${id}.${target}` });

    const providerValue = {
        ...state,
        history,
        matches,
        resolveStack,
        resolveUrl,
        transition
    }
    
    return <StateMachineContext.Provider value={providerValue}>
        {children}
    </StateMachineContext.Provider>;
}

