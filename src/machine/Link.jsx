import classnames from 'classnames';
import React, { useContext } from 'react';
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

    return <a className={classnames([
        className,
        { 'link-exact': href === history.location.pathname },
        { 'link-active': history.location.pathname.includes(href) && !disabled },
        { 'disabled': disabled }
    ])} href={href} onClick={handleClick}>{children}</a>
}

Link.displayName = 'Link';

export default Link;