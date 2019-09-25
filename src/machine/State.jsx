import React, { useContext, useEffect } from 'react';
import { StateMachineContext } from './Machine';

function State(props) {
    const { current, matches, resolveInitial, transition } = useContext(StateMachineContext);
    const { children, component: WrappedComponent, id, initial, url } = props;
    const transitions = {};
    const events = [];

    // Called once after first render
    useEffect(() => {
        // Communicate "initial" status to parent
        if (initial) {
            resolveInitial(id);
            // console.log('initial:', id);
        }
    }, []);

    // List our events available to the component being rendered
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

            return;
        }
    });

    const handleSend = (event) => {
        if (!transitions.hasOwnProperty(event)) {
            console.error(`Event: "${event}" is not available from within id: "${id}"`);
        }

        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
        
        console.group(`%cFSM Router transition: %c${event} %c@ ${time}`, 'color: grey; font-weight: normal', 'font-weight: bold;', 'color: grey; font-weight: normal');
        console.log(`%cprev state: %c${current}\n`, 'color: grey; font-weight: bold;', 'color: black;');
        console.log(`%cevent: %c${event}\n`, 'color: blue; font-weight: bold;', 'color: black;');
        console.log(`%cnext state: %c${transitions[event]}\n`, 'color: green; font-weight: bold;', 'color: black;');
        console.groupEnd();

        transition(transitions[event]);
    }

    const componentProps = {
        ...props,
    }

    delete componentProps.component;
    delete componentProps.id;
    
    let machineProps = {
        events,
        current,
        send: handleSend,
        matches,
    }

    // TODO:
    // Update context for initial state

    // TODO:
    // Compare "loading" or "checkout.loading" to current ?

    if (matches(id)) {
        return WrappedComponent ?
            <StateMachineContext.Consumer>
                { ctx => <WrappedComponent machine={machineProps} {...componentProps}/>}
            </StateMachineContext.Consumer>
        : children ? children : null;
    } else {
        return null;
    }
}

export default State;