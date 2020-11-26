import React, { useContext } from 'react';
import { classNames } from './util';
import { MachineContext } from './Machine';

const Link = ({ children, className, disabled = false, href = '#', onClick, replace = false }) => {
    const { current, history } = useContext(MachineContext);

    const handleClick = (event) => {
        event.preventDefault();

        if (disabled) {
            return;
        }

        const action = replace ? 'replace' : 'push';
        history[action](href);
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