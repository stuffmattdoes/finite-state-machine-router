/*
Render steps:
    1. Determine resolution method:
        - If URL, match 'path' prop to URL until atomic child (children if parallel)
    2. Determine state type:
        - If compound (default), determine initial child state node
        - If parallel, render all children
        - if atomic, send stack & URL resolutions
*/

import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { MachineContext } from './Machine';

export const StateNodeContext = React.createContext({
    parent: {
        id: null,
        path: null,
        stack: null
    }
});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: WrappedComponent, id, initial, onEntry, onExit, path, type } = props;
    const { current, history, id: machineId, matches, resolvePath, resolveStack, transition } = useContext(MachineContext);
    const { parent, send } = useContext(StateNodeContext);
    const { stack: parentStack, path: parentPath } = parent;
    const getStateNodeStack = (id) => parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;
    const stack = getStateNodeStack(id);
    const stackPath = path ? parentPath ? parentPath + path : path : parentPath;
    const _matches = matches(id);
    const _exact = current === stack;
    
    const { _initialChild, _type, events } = useMemo(() => {
        const _childrenArr = React.Children.toArray(children);
        const _childStates = _childrenArr.filter(c => c.type.name === 'State');
        const events = _childrenArr.reduce((acc, t) => {
            if (t.type.name === 'Transition') {
                acc[t.props.event] = t.props.target;
            }
            return acc;
        }, {});
        const _initialChild = _childStates.find(c => c.props.initial) || _childStates[0];
        
        // Determine State type, if unspecified by props
        // 'parallel' is the only StateNode type you'd need to specify. All others can be derived.
        let _type = type;

        if (_type !== 'parallel') {
            if (!_childStates.length) {
                _type = 'atomic';
            } else if (_childStates.length > 1) {
                _type = 'compound';
            } else {
                _type = 'default';
            }
        }

        return {_initialChild,  _type, events };
    }, [ children ]);

    const _send = (event) => {
        const target = getStateNodeStack(events[event]);

        transition(event, target);
    }

    useEffect(() => {
        if(_matches) {
            onEntry && onEntry();
        }

        // TODO
        // onExit state action
        // if (_matches && onExit) {
        //     return () => onExit();
        // }
    }, []);

    // Resolve subsequent state changes
    useEffect(() => {
        if (_exact && _initialChild) {
            resolveStack(`${stack}.${_initialChild.props.id}`);
        }
        
        if (_type === 'atomic' && _matches) {
            stackPath && resolvePath(stackPath);
        }
    }, [ current ]);

    const initialContext = {
        parent: {
            id: id,
            path,
            stack
        },
        send: _send
    }
    const componentProps = {
        ...props,
        history,
        machine: {
            events,
            current,
            matches,
            send: _send
        }
    }
    delete componentProps.component;
    delete componentProps.id;

    return _matches ?
        <StateNodeContext.Provider value={initialContext}>
            { WrappedComponent ?
                <WrappedComponent {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

export default State;