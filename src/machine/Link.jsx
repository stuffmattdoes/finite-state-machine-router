import React from 'react';
import { history } from './Machine';

function Link({ children, href, onClick, replace, stateNode }) {    
    function handleClick(event) {
        if (!replace) {
            event.preventDefault();
            history.push(href);
        }

        onClick && onClick(event);
    }

    return <a href={href} onClick={handleClick}>{children}</a>
}

export default Link;