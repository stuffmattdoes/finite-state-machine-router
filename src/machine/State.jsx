import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StateMachineContext } from './Machine';

export const StateNodeContext = React.createContext({});
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { children, component: WrappedComponent, id, initial = false, type, url } = props;

    // List our events & transitions available from this StateNode
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

    const { current, id: machineId, matches, resolveStack, resolveUrl, transition } = useContext(StateMachineContext);
    const { parentId, parentStack, send } = useContext(StateNodeContext);
    const [ { mounted }, setState ] = useState({ mounted: false });
    const _type = type ? type : _childrenArr.length === 0 || !_hasChildrenStateNodes ? 'atomic' : null;
    const getStateNodeStack = (id) => parentStack ? `${parentStack}.${id}` : id;

    // resolve initial stack
    useEffect(() => {
        // Resolve initial stack
        if (initial && !mounted && _type === 'atomic') {
            resolveStack(getStateNodeStack(id));
            
            // if (url) {
            //     resolveUrl(stateNodeUrl);
            // }
        }

        setState({ mounted: true });
    }, []);

    // Resolve URL
    // const _resolveUrl = useMemo(() => {
        if (matches(id) && url) {
            resolveUrl(url);
        }

    //     return () => {
    //         if (matches(id) && url) {
    //             resolveUrl('/');
    //         }
    //     }
    // }, [ current ]);

    // _resolveUrl();

    const _send = (event) => {
        const target = getStateNodeStack(_transitions[event]);

        if (!_transitions.hasOwnProperty(event)) {
            console.error(`Event "${event}" is not available from within StateNode "${current}"`);
            return;
        }

        transition(event, target);
    }

    const initialContext = {
        parentId: id,
        parentStack: getStateNodeStack(id),
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

    return (matches(id) || !mounted && initial) ?
        <StateNodeContext.Provider value={initialContext}>
            { WrappedComponent ? 
                <WrappedComponent {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

export default State;