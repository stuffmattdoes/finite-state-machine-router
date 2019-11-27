/*
Render steps:
    1. Determine resolution method:
        - If URL, match 'path' prop to URL until atomic child (children if parallel)
    2. Determine state type:
        - If compound (default), determine initial child state node
        - If parallel, render all children
        - if atomic, send stack & URL resolutions
*/

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MachineContext } from './Machine';

export const StateNodeContext = React.createContext({
    parent: {
        id: null,
        path: null,
        stack: null
    }
});
StateNodeContext.displayName = 'StateNode';

// TODO
// - auto generate ID if missing
// - throw error if state ID is not unique

function State(props) {
    const { children, component: WrappedComponent, id, initial, invoke, onEntry, onExit, path, type } = props;
    const machineContext = useContext(MachineContext);
    const { current, history, id: machineId, params, resolvePath, resolveState, send: machineSend } = machineContext;
    const { parent } = useContext(StateNodeContext);
    const { stack: parentStack, path: parentPath } = parent;
    const [ { mounted }, setState ] = useState({ mounted: false });
    // const getStateNodeStack = (id) => parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;
    const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;
    const stackPath = path ? parentPath ? parentPath + path : path : parentPath;
    const match = (() => {
        if (current.includes(stack)) {
            return {
                exact: current === stack,
                params,
                path: stackPath,
                url: history.location.pathname
            }
        } else {
            return false;
        }
    })();

    /*
    https://www.w3.org/TR/scxml/#CoreIntroduction
    
    3.1.2 Compound States:
    ... Thus transitions in ancestor states serve as defaults that will be taken if no transition matches in a descendant state. If no transition matches in any state, the event is discarded.
    
    https://www.w3.org/TR/scxml/#InternalStructureofEvents
    
    5.10.1 The Internal Structure of Events
    */
    const send = (event, data) => {
        if (events[event]) {
            machineSend({ name: event, sendid: id, data });
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
        if (match.exact && initialChild) {
            // resolveStack(`${stack}.${initialChild.props.id}`);
            resolveState(initialChild.props.id);
        }
        // if (_type === 'atomic' && match && path !== '*') {
            if (_type === 'atomic' && match) {
            stackPath && resolvePath(stackPath, params);
        }
        if (!match && mounted) {
            onExit && onExit();
            setState({ mounted: false });
        }
    }, [ current ]);

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