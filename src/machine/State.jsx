import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { StateMachineContext } from './Machine';
import { tsNamespaceExportDeclaration } from '@babel/types';

export const StateNodeContext = React.createContext({});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: WrappedComponent, id, initial = false, type, url } = props;
    const { current, id: machineId, matches, resolveStack, transition } = useContext(StateMachineContext);
    const { siblingStates, parentId } = useContext(StateNodeContext);

    // Expensive, therefore memo
    const { _childrenArr, _hasStateChildren, _transitions, childStates, events } = useMemo(() => {
        const _childrenArr = React.Children.toArray(children);
        const _hasStateChildren = _childrenArr.find(child => child.type.name === 'State');
        const _transitions = {};
        const events = [];
        // const childStates = [];

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
            }
            // else if (child.type.name === 'State') {
            //     childStates.push(child.props.id);
            // }
        });

        return {
            _childrenArr,
            _hasStateChildren,
            _transitions,
            // childStates,
            events
        }
    }, [ children ]);

    let _type = type ? type : _childrenArr.length === 0 || !_hasStateChildren ? 'atomic' : null;
    let _mounted = true;

    useEffect(() => {
        // Resolve root stack
        if (initial && _mounted && _type === 'atomic') {
            resolveStack(`${parentId}.${id}`);
        }

        return () => _mounted = false;
    }, []);

    // List our events available to the component being rendered
    const send = (event) => {
        const target = parentId ? `${parentId}.${_transitions[event]}` : _transitions[event];
        // console.log(id, childStates, target);
        if (!_transitions.hasOwnProperty(event)) {
            console.error(`Event "${event}" is not available from within StateNode "${current}"`);
            return;
        }
        // if (siblingStates && !siblingStates.includes(target)) {
        //     console.error(`State "${target}" is not a sibling of "${id}" and cannot be transitioned to.`);
        //     return;
        // }

        // Resolve entire state stack
        console.log(event, target);
        transition(event, target);
    }
    
    // const transition = (event, target) => {
    //     setState({ ...state, current: `#${id}.${target}` });
    // };

    const componentProps = {
        ...props,
        machine: {
            events,
            current,
            matches,
            send
        }
    }
    delete componentProps.component;
    delete componentProps.id;

    // console.log(id, { 'matches': matches(id), 'moutned': _mounted, 'initial': initial });

    return WrappedComponent ?
        (matches(id) || _mounted && initial) ?
            <StateNodeContext.Provider value={{ parentId: id, /* siblingStates: childStates */ }}>
                <WrappedComponent {...componentProps}/>
            </StateNodeContext.Provider>
        : null
    : children;
}

export default State;