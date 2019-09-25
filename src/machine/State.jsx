import React, { useContext, useEffect } from 'react';
import { StateMachineContext } from './Machine';

export const StateNodeContext = React.createContext();
StateNodeContext.displayName = 'StateNode';

function State(props) {
    const { current, id: machineId, matches, resolveStack, transition } = useContext(StateMachineContext);
    const { children, component: WrappedComponent, id, initial, url } = props;
    // const stateNodeContext = useContext(StateNodeContext);
    const transitions = {};
    const events = [];

    const send = (event) => {
        if (!transitions.hasOwnProperty(event)) {
            console.error(`Event: "${event}" is not available from within id: "${id}"`);
        }

        // Resolve entire state stack
        transition(event, transitions[event]);
    }

    // Called once after first render
    useEffect(() => {
        if (initial/* || matches(id)*/) {
            resolveStack(id);
        }
    }, []);

    // List our events available to the component being rendered
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

            if (!skip) {
                transitions[child.props['event']] = child.props['target'];
                events.push(child.props['event']);
            }

            return null;
        }
        // else if (child.type.name === 'State') {
        //     console.log('Clone StateNode');

        //     return React.cloneElement(child, {
        //         ...child.props,
        //         send: send,
        //         testProp: 'test'
        //     });
        // }
    });

    const componentProps = {
        ...props,
        // children: _children,
        machine: {
            events,
            current,
            matches,
            send
        }
    }

    delete componentProps.component;
    delete componentProps.id;

    // TODO:
    // Update context for initial state

    // TODO:
    // Compare "loading" or "checkout.loading" to current ?

    // TODO:
    // Add additional provider for State to resolve stack

    if (matches(id)) {
        // return WrappedComponent ?
        //     <StateMachineContext.Consumer>
        //         { ctx => <WrappedComponent {...componentProps}/>}
        //     </StateMachineContext.Consumer>
        // : _children;

        return WrappedComponent ?
            <StateNodeContext.Provider value={{ id }}>
                <WrappedComponent {...componentProps}/>
            </StateNodeContext.Provider>
        : null
    } else {
        return null;
    }
}

export default State;