import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MachineContext } from './Machine';
import { isCurrentStack } from './util';
import { fakeUUID, getChildrenOfType, getChildStateNodes, isExactStack } from './util';

export const StateNodeContext = React.createContext({
    parent: {
        id: null,
        path: '/',
        stack: null
    }
});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: WrappedComponent, id = fakeUUID(), initial, invoke, onEntry, onExit, path, type } = props;
    const { _event: machineEvent, current, history, id: machineId, params, resolvePath, resolveState, send: machineSend } = useContext(MachineContext)
    const match = isCurrentStack(id, current) ? {
        exact: isExactStack(id, current),
        params,
        // path: stackPath,
        url: history.location.pathname
    } : false;

    const initialContext = {
        // parent: {
        //     id: id,
        //     path: stackPath,
        //     stack
        // },
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
