import React, { useContext } from 'react';
import { MachineContext } from './Machine';
import { isCurrentStack, isExactStack } from './util';

export const StateNodeContext = React.createContext({
    id: null,
    path: null,
    stack: null
});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: Component, id, initial, path } = props;
    const machineContext = useContext(MachineContext);
    const { event: machineEvent, current, history, id: machineId, params, resolvePath, send: machineSend } = machineContext;
    const { id: parentId, path: parentPath, stack: parentStack } = useContext(StateNodeContext);
    const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;
    const stackPath = path ? parentPath ? parentPath + path : path : parentPath;
    const match = isCurrentStack(id, current) ? {
        exact: isExactStack(id, current),
        params,
        path: stackPath,
        url: history.location.pathname
    } : false;

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
                <Component {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

State.displayName = 'State';

export default State;
