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
    const { _transitions, _type, events } = useMemo(() => {
        const _childrenArr = React.Children.toArray(children);
        // let _initial = initial;
        let _type = type;
        let _childStatesCount = 0;
        // let _childInitial = false;
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
                if (child.props.url) {
                    console.warn(`<Transition/> has a "url" property on it. Did you mean to apply that its parent <State/>, "${id}"?`);
                }
                if (!skip) {
                    _transitions[child.props['event']] = child.props['target'];
                    events.push(child.props['event']);
                }
            } else if (child.type.name === 'State') {
                _childStatesCount++;

                // if (child.props.initial) {

                //     if (!_childInitial) {
                //         _childInitial = true;
                //     } else {
                //         console.error('You cannot have more than one child initial StateNode.');
                //     }
                // }
            }
        });

        // Determine State type, if unspecified by props
        // 'parallel' is the only StateNode type you'd need to specify. All others can be derived.
        if (!_type) {
            if (_childStatesCount === 0) {
                _type = 'atomic';
            } else if (_childStatesCount > 1) {
                _type = 'compound';
            } else {
                _type = 'default';
            }
        }

        // Determine initial child StateNode, if unspecified by props && parent StateNode is not of type 'parallel'
        // if (!_initial) {
        //     if ()
        // }

        return {
            // _initial,
            _transitions,
            _type,
            events
        }
    }, [ children ]);

    const { current, history, id: machineId, matches, resolveStack, resolveUrl, transition } = useContext(StateMachineContext);
    const { parent, send } = useContext(StateNodeContext);
    const { stack: parentStack, url: parentUrl } = parent;
    const [ { _mounted }, setState ] = useState({ _mounted: false });
    const getStateNodeStack = (id) => parentStack ? `${parentStack}.${id}` : id;
    const _stack = getStateNodeStack(id);
    const stateNodeUrl = url ? parentUrl ? parentUrl + url : url : parentUrl;
    const _matches = matches(id);

    // const _resolveState = () => {
    //     resolveStack(_stack);
    //     console.log('resolveStack', id, stateNodeUrl, _stack);
    //     stateNodeUrl && resolveUrl(stateNodeUrl);
    // }

    const _send = (event) => {
        const target = getStateNodeStack(_transitions[event]);

        if (!_transitions.hasOwnProperty(event)) {
            console.error(`Event "${event}" is not available from within StateNode "${current}"`);
            return;
        }

        transition(event, target);
    }

    // Resolve state from URL (for direct navigation, previous, next)
    // Resolve URL -> initial
    useEffect(() => {
        // console.log(1, id, history.location.pathname);

        if (_type === 'atomic') {
            console.log(2, id, history.location.pathname);
        }
    }, [ history.location.pathname ]);

    // Resolve initial state
    // needs 'effect' hook to properly resolve 'initial' states
    useEffect(() => {
        if (_type === 'atomic' && initial) {
            // console.log(1, id, _type, _stack);
            // _resolveState();
            resolveStack(_stack);
        }

        setState({ _mounted: true });
    }, []);

    // Resolve subsequent state changes
    useEffect(() => {
        if (_type === 'atomic' && _matches) {
            // console.log(2, id, _type, stateNodeUrl);
            // _resolveState();
            stateNodeUrl && resolveUrl(stateNodeUrl);
        }
    }, [ current ]);

    const initialContext = {
        parent: {
            id: id,
            stack: _stack,
            url: stateNodeUrl,
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

    return (_matches || (!_mounted && initial)) ?
        <StateNodeContext.Provider value={initialContext}>
            { WrappedComponent ? 
                <WrappedComponent {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

export default State;