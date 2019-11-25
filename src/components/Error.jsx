import React from 'react';
import { Link } from '../machine';

function Error({ children, machine }) {
    return <div className='error'>
        <h1>Error</h1>
        {children}
        <Link event={'RELOAD'}>Reload (State event)</Link>
        <br/>
        <Link href='/loading'>Reload (URL push - WIP)</Link>
    </div>;
}

export default Error;