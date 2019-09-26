import React, { useState } from 'react';
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
        // log(state, event, target);
        setState({ ...state, current: `#${id}.${target}` });
    };

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
