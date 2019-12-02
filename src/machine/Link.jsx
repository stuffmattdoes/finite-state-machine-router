import React, { useContext } from 'react';
import { MachineContext } from './Machine';
import { StateNodeContext } from './State';

export default function Link({ children, event, href = '#', onClick, replace }) {
    const { history } = useContext(MachineContext);
    const { send } = useContext(StateNodeContext);

    const handleClick = (e) => {
        if (event) {
            e.preventDefault();
            send(event);
        }

        if (!replace && !event) {
            e.preventDefault();
            history.push(href);
        }

        onClick && onClick(e);
    }

    return <a href={href} onClick={handleClick}>{children}</a>
}
