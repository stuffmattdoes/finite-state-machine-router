import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MachineContext } from './Machine';
import { isCurrentStack } from './util';
import { fakeUUID } from './util';

export const StateNodeContext = React.createContext({
    parent: {
        id: null,
        path: '/',
        stack: null
    }
});
StateNodeContext.displayName = 'StateNode';

// TODO
// - throw error if state ID is not unique

function State(props) {
    const { children, component: WrappedComponent, id = fakeUUID(), initial, invoke, onEntry, onExit, path, type } = props;
    const machineContext = useContext(MachineContext);
    const { _event: machineEvent, current, history, id: machineId, params, resolvePath, resolveByState, send: machineSend } = machineContext;
    const { parent } = useContext(StateNodeContext);
    const { stack: parentStack, path: parentPath } = parent;
    const [ { mounted }, setState ] = useState({ mounted: false });
    const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;
    const stackPath = path ? parentPath ? parentPath + path : path : parentPath;
    const match = isCurrentStack(id, current) ? {
        exact: current === stack,
        params,
        path: stackPath,
        url: history.location.pathname
    } : false;
    
    function send(event, data) {
        console.log('send');
        if (events[event]) {
            machineSend(event, { sendid: id, data });
        }
    }

    const { initialChild, _type, events } = useMemo(() => {
        const childrenArr = React.Children.toArray(children);
        const childStates = childrenArr.filter(c => c.type.name === 'State');
        const events = childrenArr.reduce((acc, t) => {
            if (t.type.name === 'Transition') {
                acc[t.props.event] = t.props.target;
            }
            return acc;
        }, {});
        const initialChild = childStates.find(c => c.props.initial) || childStates[0];

        // Determine State type, if unspecified by props
        // 'parallel' is the only StateNode type you'd need to specify. All others can be derived.
        let _type = type;

        if (_type !== 'parallel') {
            if (!childStates.length) {
                _type = 'atomic';
            } else if (childStates.length > 1) {
                _type = 'compound';
            } else {
                _type = 'default';
            }
        }

        return { initialChild, _type, events };
    }, [ children ]);

    useMemo(() => {
        if (match) {
            if (_type === 'atomic') {
                console.log('resolePath', stackPath);
                stackPath && resolvePath(stackPath);
            } else if (match.exact && initialChild && !machineEvent) {
                console.log(0);
                resolveByState(initialChild.props.id);
            }
        } else if (mounted) {
            onExit && onExit();
            setState({ mounted: false });
        }
    }, [ current ]);

    useEffect(() => {
        if (machineEvent && events[machineEvent.name]) {
            console.log(1, machineEvent);
            resolveByState(events[machineEvent.name]);
        }
    }, [ machineEvent ]);

    useEffect(() => {
        if(match && !mounted) {
            invoke && invoke(machineContext);
            onEntry && onEntry();
            setState({ mounted: true });
        }
    }, [ current ]);

    const initialContext = {
        parent: {
            id: id,
            path: stackPath,
            stack
        },
        send
    }
    const componentProps = {
        ...props,
        history,
        machine: {
            current,
            events,
            send
        },
        match
    }
    delete componentProps.component;
    delete componentProps.id;

    return match ?
        <StateNodeContext.Provider value={initialContext}>
            { WrappedComponent ?
                <WrappedComponent {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

export default State;