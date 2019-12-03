import React, { useContext } from 'react';
import { MachineContext } from './Machine';
import { StateNodeContext } from './State';

export default function Link({ children, event: machineEvent, href = '#', onClick, replace }) {
    const { history } = useContext(MachineContext);
    const { send } = useContext(StateNodeContext);

    const handleClick = (event) => {
        if (machineEvent) {
            event.preventDefault();
            send(machineEvent);
        }

        if (!replace && !machineEvent) {
            event.preventDefault();
            history.push(href);
        }

        onClick && onClick(event);
    }

    return <a href={href} onClick={handleClick}>{children}</a>
}
