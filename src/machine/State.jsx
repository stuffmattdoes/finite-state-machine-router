import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StateMachineContext } from './Machine';
import { tsNamespaceExportDeclaration } from '@babel/types';

export const StateNodeContext = React.createContext({});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: WrappedComponent, id, initial = false, type, url } = props;

    // List our events & transitions available in this
    // Expensive, therefore memo
    const { _childrenArr, _hasChildrenStateNodes, _transitions, events } = useMemo(() => {
        const _childrenArr = React.Children.toArray(children);
        const _hasChildrenStateNodes = _childrenArr.find(child => child.type.name === 'State');
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
            }
        });

        return {
            _childrenArr,
            _hasChildrenStateNodes,
            _transitions,
            events
        }
    }, [ children ]);

    const { current, id: machineId, matches, resolveStack, transition } = useContext(StateMachineContext);
    const { parentId, parentStack } = useContext(StateNodeContext);
    const [ { mounted }, setState ] = useState({ mounted: false });
    const _type = type ? type : _childrenArr.length === 0 || !_hasChildrenStateNodes ? 'atomic' : null;
    const getNodeStack = (id) => parentStack ? `${parentStack}.${id}` : id;

    useEffect(() => {
        // Resolve initial stack
        if (initial && !mounted) {
            if (_type === 'atomic') {
                resolveStack(getNodeStack(id));
            }
        }

        return setState({ mounted: true });
    }, []);

    const send = (event) => {
        const target = getNodeStack(_transitions[event]);

        if (!_transitions.hasOwnProperty(event)) {
            console.error(`Event "${event}" is not available from within StateNode "${current}"`);
            return;
        }

        // TODO
        // Stale state causing improper transition
        // console.log('send', current, target);
        transition(event, target);
    }

    const initialValue = {
        parentId: id,
        parentStack: getNodeStack(id)
    }
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

    return (matches(id) || !mounted && initial) ?
        <StateNodeContext.Provider value={initialValue}>
            { WrappedComponent ? 
                <WrappedComponent {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

export default State;