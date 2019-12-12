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
    const machineContext = useContext(MachineContext);
    const { event: machineEvent, current, history, id: machineId, params, resolvePath, resolveState, send: machineSend } = machineContext;
    const { path: parentPath, stack } = useContext(StateNodeContext);
    const stackPath = path ? parentPath ? parentPath + path : path : parentPath;
    const match = isCurrentStack(id, current) ? {
        exact: isExactStack(id, current),
        params,
        path: stackPath,
        url: history.location.pathname
    } : false;

    const [ _type, transitions ] = useMemo(() => {
        let _type = type;
        const childStates = getChildStateNodes(children);
        const transitions = getChildrenOfType(children, 'Transition').map(({ props }) => ({
            cond: props.cond || null,
            event: props.event,
            sendid: id,
            target: props.target,
            type: 'internal'
        }));
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

        return [ _type, transitions ];
    }, [ children ]);

    // useEffect(() => {
    //     if (match) {
    //         invoke && invoke(machineContext);
    //     }
    // }, []);

    useEffect(() => {
        if (match) {
            if (_type === 'atomic') {
                resolvePath(stackPath);
            }

            // if (machineEvent) {
            //     const transition = transitions.find(trans => trans.event === machineEvent.event);

            //     if (transition) {
            //         console.log('machineEvent', id, machineEvent);
            //         // executeTransition(events[machineEvent.name]);
            //         // resolveByState(events[machineEvent.name]);
            //     }
            // }
        }
    }, [ machineEvent ]);

    const initialContext = {
        path: stackPath,
        // stack,
        send: machineSend
    }
    const componentProps = {
        children,
        history,
        machine: {
            current,
            // events,
            send: machineSend
        },
        match
    }

    return match ?
        <StateNodeContext.Provider value={initialContext}>
            {console.log('render', id)}
            { WrappedComponent ?
                <WrappedComponent {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

export default State;
