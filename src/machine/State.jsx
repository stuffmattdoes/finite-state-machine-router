import React, { useContext, useEffect, useMemo, useState } from 'react';
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
    const { children, component: WrappedComponent, id, initial = false, type, url } = props;

    // List our events & transitions available from this StateNode
    const { _initial, _transitions, _type, events } = useMemo(() => {
        const _childrenArr = React.Children.toArray(children);
        let _initial = initial;
        let _type = type;
        let _childStatesCount = 0;
        const _transitions = {};
        const events = [];

        _childrenArr.forEach(child => {
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
                if (!skip) {
                    _transitions[child.props['event']] = child.props['target'];
                    events.push(child.props['event']);
                }
            } else if (child.type.name === 'State') {
                _childStatesCount++;
            }
        });

        // Determine State type, if unspecified by props
        if (!_type) {
            if (_childStatesCount === 0) {
                _type = 'atomic';
            } else if (_childStatesCount > 1) {
                _type = 'compound';
            } else {
                _type = 'default';
            }
        }

        // Determine initial type, if unspecified by props && not of type 'parallel'
        // if (!_initial) {
        //     if ()
        // }

        return {
            _initial,
            _transitions,
            _type,
            events
        }
    }, [ children ]);

    const { current, id: machineId, matches, resolveStack, resolveUrl, transition } = useContext(StateMachineContext);
    const { parent, send } = useContext(StateNodeContext);
    const { stack: parentStack, url: parentUrl } = parent;
    const [ { _mounted }, setState ] = useState({ _mounted: false });
    const getStateNodeStack = (id) => parentStack ? `${parentStack}.${id}` : id;
    const stateNodeUrl = url ? parentUrl ? parentUrl + url : url : parentUrl;

    // Resolve initial. needs 'effect' hook to properly resolve 'initial' states
    useEffect(() => {
        if (_type === 'atomic' /* && !_mounted */ && _initial) {
            resolveStack(getStateNodeStack(id));
            stateNodeUrl && resolveUrl(stateNodeUrl);
        }

        setState({ _mounted: true });
    }, []);

    // Resolve subsequent state changes
    useEffect(() => {
        if (_type === 'atomic' && matches(id)) {
            resolveStack(getStateNodeStack(id));
            resolveUrl(stateNodeUrl);
        }

        // return () => {
        //     if (matches(id) && url) {
        //         resolveUrl('/');
        //     }
        // }
    }, [ current ]);

    const _send = (event) => {
        const target = getStateNodeStack(_transitions[event]);

        if (!_transitions.hasOwnProperty(event)) {
            console.error(`Event "${event}" is not available from within StateNode "${current}"`);
            return;
        }

        transition(event, target);
    }

    const initialContext = {
        parent: {
            id: id,
            stack: getStateNodeStack(id),
            url: stateNodeUrl,
        },
        send: _send
    }
    const componentProps = {
        ...props,
        machine: {
            events,
            current,
            matches,
            send: _send
        }
    }
    delete componentProps.component;
    delete componentProps.id;

    return (matches(id) || !_mounted && _initial) ?
        <StateNodeContext.Provider value={initialContext}>
            { WrappedComponent ? 
                <WrappedComponent {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

export default State;