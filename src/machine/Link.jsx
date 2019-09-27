import React, { useContext } from 'react';
import { StateMachineContext } from './Machine';
import { StateNodeContext } from './State';

export default function Link({ children, event: stateEvent, href = '#', onClick, replace }) {
    const { history } = useContext(StateMachineContext);
    const { send } = useContext(StateNodeContext);

    const handleClick = (e) => {
        if (stateEvent) {
            send(stateEvent);
        }

        if (!replace && !stateEvent) {
            e.preventDefault();
            history.push(href);
        }

        onClick && onClick(e);
    }

    return <a href={href} onClick={handleClick}>{children}</a>
}
