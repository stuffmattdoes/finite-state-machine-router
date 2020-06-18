import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MachineContext } from './Machine';
import { getChildrenOfType, getChildStateNodes, isCurrentStack, isExactStack } from './util';

export const StateNodeContext = React.createContext({
    id: null,
    path: null,
    stack: null
});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: Component, id, initial, onEntry, onExit, path, type } = props;
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

    const _type = useMemo(() => {
        let _type = type;
        const childStates = getChildStateNodes(children);
        // const transitions = getChildrenOfType(children, 'Transition').map(({ props }) => ({
        //     cond: props.cond || null,
        //     event: props.event,
        //     sendid: id,
        //     target: props.target,
        //     type: 'internal'
        // }));
        // const initialChild = childStates.find(c => c.props.initial) || childStates[0];

        if (_type !== 'parallel') {
            if (!childStates.length) {
                _type = 'atomic';
            } else if (childStates.length > 1) {
                _type = 'compound';
            } else {
                _type = 'default';
            }
        }

        return _type;
    }, [ children ]);

    useEffect(() => {
        if (match) {
            if (_type === 'atomic' && id !== '*') {
                stackPath ? resolvePath(stackPath) : resolvePath('/');
            }
        }
    }, [ current ]);

    // const interrupted = useMemo(() => {
    //     if (match && onEntry) {
    //         return !onEntry(machineContext);
    //     }

    //     return false;
    // }, [ match ]);

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
            {/* { Component && !interrupted ? */}
            { Component ?
                <Component {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

State.displayName = 'State';

export default State;