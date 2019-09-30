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
    const { parent, pathnamesResolve, send } = useContext(StateNodeContext);
    const { stack: parentStack, url: parentUrl } = parent;
    const [ { _mounted }, setState ] = useState({ _mounted: false });
    const getStateNodeStack = (id) => parentStack ? `${parentStack}.${id}` : id;
    let _initial = initial;
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

    // Resolve state from URL (for direct navigation, previous, next)
    // Resolve URL first -> then 'initial' down to 'atomic' type
    // const _pathnamesResolve = null;
    const { _pathnamesResolve } = useMemo(() => {
        const _url = url && url.replace(/#|\//g, '');
        let _pathnamesResolve = pathnamesResolve
            || history.location.pathname.split('/').slice(1);      // Remove initial empty index

        if (_url) {
            if (_pathnamesResolve[0] === _url) {
                // _initial = true;
                _pathnamesResolve.shift();

                if (_pathnamesResolve.length === 0) {
                    // console.log('resolve', id, _pathnamesResolve, _type, stack);
                    resolveStack(stack);
                }
            }
            // else {
            //     _initial = false;
            // }
        }

        return {
            _pathnamesResolve
        }
    // }, [ history.location.pathname ]);
    }, []);

    // Resolve initial state
    // needs 'effect' hook to properly resolve 'initial' states
    useEffect(() => {
        if (_type === 'atomic' && _initial) {
            // console.log(1, id, _type, stack);
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
            stack: stack,
            url: stateNodeUrl,
        },
        pathnamesResolve: _pathnamesResolve,
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

    return (_matches || (!_mounted && _initial)) ?
        <StateNodeContext.Provider value={initialContext}>
            { WrappedComponent ? 
                <WrappedComponent {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

export default State;