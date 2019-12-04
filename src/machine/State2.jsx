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
    // const machineContext = useContext(MachineContext);
    // const { _event: machineEvent, current, history, id: machineId, params, resolvePath, resolveByState, send: machineSend } = machineContext;
    const { _event: machineEvent, current, history, id: machineId, params, resolvePath, resolveByState, send: machineSend } = useContext(MachineContext)
    // const { parent } = useContext(StateNodeContext);
    // const { stack: parentStack, path: parentPath } = parent;
    // const [ { mounted }, setState ] = useState({ mounted: false });
    // const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;
    // const stackPath = path ? parentPath ? parentPath + path : path : parentPath;
    const match = isCurrentStack(id, current) ? {
        exact: isExactStack(id, current),
        params,
        // path: stackPath,
        url: history.location.pathname
    } : false;

    // function send(event, data) {
    //     console.log(0);
    //     if (events[event]) {
    //         machineSend(event, { sendid: id, data });
    //     }
    // }

    // const { initialChild, _type, events } = useMemo(() => {
    //     const childrenArr = React.Children.toArray(children);
    //     const childStates = getChildStateNodes(children);
    //     const events = childrenArr.reduce((acc, t) => {
    //         if (t.type.name === 'Transition') {
    //             acc[t.props.event] = t.props.target;
    //         }
    //         return acc;
    //     }, {});
    //     const initialChild = childStates.find(c => c.props.initial) || childStates[0];

    //     // Determine State type, if unspecified by props
    //     // 'parallel' is the only StateNode type you'd need to specify. All others can be derived.
    //     let _type = type;

    //     if (_type !== 'parallel') {
    //         if (!childStates.length) {
    //             _type = 'atomic';
    //         } else if (childStates.length > 1) {
    //             _type = 'compound';
    //         } else {
    //             _type = 'default';
    //         }
    //     }

    //     return { initialChild, _type, events };
    // }, [ children ]);

    // useMemo(() => {
    //     if (match) {
    //         if (_type === 'atomic') {
    //             console.log('resolePath', stackPath);
    //             stackPath && resolvePath(stackPath);
    //         } else if (match.exact && initialChild && !machineEvent) {
    //             console.log(1, machineEvent);
    //             resolveByState(initialChild.props.id);
    //         }
    //     } else if (mounted) {
    //         onExit && onExit();
    //         setState({ mounted: false });
    //     }
    // }, [ current ]);

    // useEffect(() => {
    //     if (machineEvent && events[machineEvent.name]) {
    //         console.log(2, machineEvent);
    //         resolveByState(events[machineEvent.name]);
    //     }
    // }, [ machineEvent ]);

    // useEffect(() => {
    //     if(match && !mounted) {
    //         invoke && invoke(machineContext);
    //         onEntry && onEntry();
    //         setState({ mounted: true });
    //     }
    // }, [ current ]);

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
        // machine: {
        //     current,
        //     events,
        //     send
        // },
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
