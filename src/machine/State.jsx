/*
Render steps:
    1. Determine resolution method:
        - If URL, match 'url' prop to URL until atomic child (children if parallel)
    2. Determine state type:
        - If compound (default), determine initial child state node
        - If parallel, render all children
        - if atomic, send stack & URL resolutions
*/

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StateMachineContext } from './Machine';

export const StateNodeContext = React.createContext({
    parent: {
        id: null,
        stack: null,
        url: null
    }
});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: WrappedComponent, id, initial, type, url } = props;
    const { _children, _transitions, _type, events } = useMemo(() => {
        const _childrenArr = React.Children.toArray(children);
        const _hasInitialChild = _childrenArr.filter(c => c.props.initial).length > 0;
        let _childStatesCount = 0;
        const _transitions = {};
        const events = [];
        const _children = React.Children.map(children, child => {
            if (child.type.name === 'Transition') {
                let skip = false;

                // Just check for some required props
                if (!child.props.hasOwnProperty('event')) {
                    console.error('Component "<Transition/>" requires an "event" property.');
                    skip = true;
                }
                if (!child.props.hasOwnProperty('target')) {
                    console.error('Component "<Transition/>" requires a "target" property.');
                    skip = true;
                }
                if (child.props.url) {
                    console.warn(`<Transition/> has a "url" property on it. Did you mean to apply that its parent <State/>, "${id}"?`);
                }
                if (!skip) {
                    _transitions[child.props['event']] = child.props['target'];
                    events.push(child.props['event']);
                }
            } else if (child.type.name === 'State') {
                _childStatesCount++;

                if (_childStatesCount === 1 && type !== 'parallel' && !_hasInitialChild) {
                    return React.cloneElement(child, { initial: true });
                }
            }
            return child;
        });

        // Determine State type, if unspecified by props
        // 'parallel' is the only StateNode type you'd need to specify. All others can be derived.
        let _type = type;

        if (!_type) {
            if (_childStatesCount === 0) {
                _type = 'atomic';
            } else if (_childStatesCount > 1) {
                _type = 'compound';
            } else {
                _type = 'default';
            }
        }

        return { _children, _transitions, _type, events };
    }, [ children ]);

    const { current, history, id: machineId, matches, resolveStack, resolveUrl, transition } = useContext(StateMachineContext);
    const { parent, send } = useContext(StateNodeContext);
    const { stack: parentStack, url: parentUrl } = parent;
    const [ { _mounted }, setState ] = useState({ _mounted: false });
    const getStateNodeStack = (id) => parentStack ? `${parentStack}.${id}` : `.${id}`;
    const _matches = matches(id);
    const stack = getStateNodeStack(id);
    const stateNodeUrl = url ? parentUrl ? parentUrl + url : url : parentUrl;
    
    const _send = (event) => {
        const target = getStateNodeStack(_transitions[event]);

        if (!_transitions.hasOwnProperty(event)) {
            console.error(`Event "${event}" is not available from within StateNode "${current}"`);
            return;
        }

        transition(event, target);
    }

    // Resolve initial state
    // needs 'effect' hook to properly resolve 'initial' states
    useEffect(() => {
        if (_type === 'atomic' && initial) {
            console.log(1, id, _type, stack);
            resolveStack(stack);
        }

        setState({ _mounted: true });
    }, []);

    // Resolve subsequent state changes
    useEffect(() => {
        if (_type === 'atomic' && _matches) {
            // console.log(2, id, _type, stateNodeUrl);
            stateNodeUrl && resolveUrl(stateNodeUrl);
        }
    }, [ current ]);

    const initialContext = {
        parent: {
            id: id,
            stack,
            url: stateNodeUrl,
        },
        send: _send
    }
    const componentProps = {
        ...props,
        children: _children,
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

    // BUG
    // Sub states marked as initial aren't rendering. 'initial' is still false
    return (_matches || (!_mounted && initial)) ?
        <StateNodeContext.Provider value={initialContext}>
            { WrappedComponent ?
                <WrappedComponent {...componentProps}/>
            : _children }
        </StateNodeContext.Provider>
    : null;
}

export default State;