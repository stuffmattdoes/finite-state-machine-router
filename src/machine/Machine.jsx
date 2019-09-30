import React, { useEffect, useState } from 'react';
import { createBrowserHistory } from 'history';
import { log } from './util';

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
    
    const matches = (stateId) => {
        // console.log('matches', stateId, state.current);
        return state.current.split('.').includes(stateId);
    };
    const resolveStack = (stateId) => {
        // console.log('resolveStack', stateId);
        setState({ ...state, current: `#${id}.${stateId}` });
    };

    // TODO
    // Resolve doulbe URL push
    const resolveUrl = history.push;
    const transition = (event, target) => {
        // log(state, event, target);
        // console.log('transition', state.current);       // Stale
        setState({ ...state, current: `#${id}.${target}` });
    };

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

