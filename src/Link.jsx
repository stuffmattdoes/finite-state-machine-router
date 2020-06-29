import React, { useContext } from 'react';
import { classNames } from './util';
import { MachineContext } from './Machine';
import { StateNodeContext } from './State';

function Link({ children, className, disabled = false, event: machineEvent, href = '#', onClick, replace = false }) {
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

        if (!replace) {
            event.preventDefault();

            if (!machineEvent) {
                history.push(href);
            }
        } else {
            event.preventDefault();
            history.replace(href);
        }

        onClick && onClick(event);
    }

    return <a className={classNames([
        className,
        { 
            'link-exact': href === history.location.pathname,
            'link-active': history.location.pathname.includes(href) && !disabled,
            'disabled': disabled
        }
    ])} href={href} onClick={handleClick}>{children}</a>
}

Link.displayName = 'Link';

export default Link;