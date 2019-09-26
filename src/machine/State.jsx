import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { StateMachineContext } from './Machine';
import { tsNamespaceExportDeclaration } from '@babel/types';

export const StateNodeContext = React.createContext({});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: WrappedComponent, id, initial, type, url } = props;
    const { current, id: machineId, matches, resolveStack, transition } = useContext(StateMachineContext);
    const { parentId, resolveState } = useContext(StateNodeContext);
    
    const _childrenArr = React.Children.toArray(children);
    const _hasStateChildren = _childrenArr.find(child => child.type.name === 'State');
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
    const transitions = {};
    const events = [];

    React.Children.forEach(children, child => {
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
                transitions[child.props['event']] = child.props['target'];
                events.push(child.props['event']);
            }
        }
    });

    const send = (event) => {
        const target = transitions[event];
        if (!transitions.hasOwnProperty(event)) {
            console.error(`Event "${event}" is not available from within StateNode "${id}"`);
        }
        // if (!states.includes(target)) {
        //     console.error(`State "${target}" cannot be transitioned to from state "${current}"`);
        // }

        // Resolve entire state stack
        // transition(event, target);
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


    return WrappedComponent ?
        (matches(id) || _mounted && initial) ?
            <StateNodeContext.Provider value={{
                parentId: id,
                // parentStack: `${parentId}.${id}`,
                // resolveState: resolveStateCb
            }}>
                <WrappedComponent {...componentProps}/>
            </StateNodeContext.Provider>
        : null
    : children;
}

export default State;