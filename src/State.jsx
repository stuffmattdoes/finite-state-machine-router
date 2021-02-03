import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MachineContext } from './Machine';
import { isCurrentStack, isExactStack } from './util';

export const StateNodeContext = React.createContext({
    id: null,
    path: null,
    send: null,
    stack: null
});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    // const [ restarts, restart ] = useState(0);
    const { children, component: Component, id, initial, path } = props;
    const machineContext = useContext(MachineContext);
    const { current, event: machineEvent, history, id: machineId, params, send: machineSend } = machineContext;
    const { id: parentId, path: parentPath, stack: parentStack } = useContext(StateNodeContext);
    const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;
    const stackPath = path ? parentPath ? parentPath + path : path : parentPath;
    const match = isCurrentStack(id, current) ? {
        exact: isExactStack(id, current),
        params,
        path: stackPath,
        url: history.location.pathname
    } : false;

    // useMemo(() => {
    //     console.log('mount');
    //     return () => console.log('unmount');
    // }, []);

    // console.log('render', id);

    const initialContext = {
        id,
        path: stackPath,
        stack,
        send: machineSend,
    }
    const componentProps = {
        children,
        history,
        machine: {
            current,
            send: machineSend
        },
        match
    }

    return match ?
        <StateNodeContext.Provider value={initialContext}>
            { Component ?
                <Component key={machineEvent.target === stack ? 'restart' : id } {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

State.displayName = 'State';

export default State;
