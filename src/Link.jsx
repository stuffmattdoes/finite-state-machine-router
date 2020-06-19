import React, { useContext } from 'react';
import { classNames } from './util';
import { MachineContext } from './Machine';
import { StateNodeContext } from './State';

function Link({ children, className, disabled, event: machineEvent, href = '#', onClick, replace }) {
    const { history } = useContext(MachineContext);
    const { send } = useContext(StateNodeContext);

    const handleClick = (event) => {
        if (disabled) {
            event.preventDefault();
            return;
        }

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

    return <a className={classNames([
        className,
        href === history.location.pathname && 'link-exact',
        history.location.pathname.includes(href) && !disabled && 'link-active',
        disabled && 'disabled'
    ])} href={href} onClick={handleClick}>{children}</a>
}

Link.displayName = 'Link';

export default Link;