import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MachineContext } from './Machine';
import { getChildrenOfType, getChildStateNodes, isCurrentStack, isExactStack } from './util';

export const StateNodeContext = React.createContext({
    // id: null,
    path: null,
    stack: null
});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: WrappedComponent, id, initial, invoke, onEntry, onExit, path, type } = props;
    const { _event: machineEvent, current, history, id: machineId, params, resolvePath, resolveState, send: machineSend } = useContext(MachineContext)
    const { path: parentPath, stack } = useContext(StateNodeContext);
    const stackPath = path ? parentPath ? parentPath + path : path : parentPath;
    const match = isCurrentStack(id, current) ? {
        exact: isExactStack(id, current),
        params,
        path: stackPath,
        url: history.location.pathname
    } : false;

    const _type = useMemo(() => {
        console.log('type', type);

        return type;
    });

    const initialContext = {
        path: stackPath,
        // stack,
        // send
    }
    const componentProps = {
        children,
        history,
        machine: {
            current,
            // events,
            // send
        },
        match
    }

    return match ?
        <StateNodeContext.Provider value={initialContext}>
            { WrappedComponent ?
                <WrappedComponent {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

export default State;
