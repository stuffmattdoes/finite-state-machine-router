import React, { useContext } from 'react';
import { classNames, resolveSeedToAtomic } from './util';
import { MachineContext } from './Machine';

function Link({ children, className, disabled = false, href = '#', onClick, replace = false }) {
    const { current, history } = useContext(MachineContext);

    const handleClick = (event) => {
        event.preventDefault();

        if (disabled) {
            return;
        }

        if (replace) {
            history.replace(href, {
                sourceState: current,
                // targetState: null,
                shouldgetAtomic: true
            });
        } else {
            history.push(href, {
                sourceState: current,
                // targetState: null,
                shouldgetAtomic: true
            });
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