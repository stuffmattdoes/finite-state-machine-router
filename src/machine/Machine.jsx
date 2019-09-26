import React, { useEffect, useState } from 'react';
import { createBrowserHistory } from 'history';
import { log } from './util';

export const history = createBrowserHistory({
    basename: '/checkout',
});

export const StateMachineContext = React.createContext();
StateMachineContext.displayName = 'Machine';

function Machine ({ children, id, url }) {    
    const [ state, setState ] = useState({
        current: `#${id}`,
        id
    });
    
    const matches = (stateId) => state.current.split('.').includes(stateId);
    const resolveStack = (stateId) => setState({ ...state, current: `#${id}.${stateId}` });
    const transition = (event, target) => {
        log(state, event, target);
        return setState({ ...state, current: `#${id}.${target}` });
    };

    const value = {
        ...state,
        matches,
        resolveStack,
        transition
    }
    
    return <StateMachineContext.Provider value={value}>
        {children}
    </StateMachineContext.Provider>;
}

export default Machine;
