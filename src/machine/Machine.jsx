import React, { useEffect, useState } from 'react';
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
    const resolveStack = (stateId) => setState({ ...state, current: `#${id}.${stateId}` });
    const resolveUrl = history.push;
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

