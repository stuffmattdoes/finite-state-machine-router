import React, { useContext } from 'react';
import { StateMachineContext } from './Machine';

function State(props) {
    const machineContext = useContext(StateMachineContext);
    const { current, matches, transition } = machineContext;
    const { children, component: WrappedComponent, initial, state, url } = props;
    const transitions = {};
    const actionTypes = [];

    // List our actions available to the component being rendered
    React.Children.forEach(children, child => {
        if (child.type.name === 'Transition') {
            let skip = false;

            // Just check for some required props
            if (!child.props.hasOwnProperty('action')) {
                console.error('Component "<Transition/>" requires an "action" property.');
                skip = true;
            }

            if (!child.props.hasOwnProperty('target')) {
                console.error('Component "<Transition/>" requires a "target" property.');
                skip = true; 
            }

            if (!skip) {
                transitions[child.props['action']] = child.props['target'];
                actionTypes.push(child.props['action']);
            }

            return;
        }
    });

    const handleDispatch = (action, event) => {
        if (!transitions.hasOwnProperty(action)) {
            console.error(`Action: "${action}" is not available from within state: "${state}"`);
        }

        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
        
        console.group(`%cFSM Router transition: %c${action} %c@ ${time}`, 'color: grey; font-weight: normal', 'font-weight: bold;', 'color: grey; font-weight: normal');
        console.log(`%cprev state: %c${current}\n`, 'color: grey; font-weight: bold;', 'color: black; font-weight: bold;');
        console.log(`%caction: %c${action}\n`, 'color: blue; font-weight: bold;', 'color: black; font-weight: bold;');
        console.log(`%cnext state: %c${transitions[action]}\n`, 'color: green; font-weight: bold;', 'color: black; font-weight: bold;');
        console.groupEnd();

        transition(transitions[action]);
    }

    const componentProps = {
        ...props
    }

    delete componentProps.component;
    
    let machineProps = {
        actionTypes,
        current,
        dispatch: handleDispatch,
        matches,
        update: machineContext.update
    }

    return matches(state) ?
        <StateMachineContext.Consumer>
            { ctx => <WrappedComponent machine={machineProps} {...componentProps}/>}
        </StateMachineContext.Consumer>
    : null;
}

export default State;