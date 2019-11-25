import React from 'react';
import { Link } from '../machine';

function Checkout ({ children, machine, match }) {
    return <div className='checkout'>
        <h1>Checkout #{match.params.stockNumber}</h1>
        <Link event={'RELOAD'}>Reload (State event)</Link>
        <br/>
        <Link href='/loading'>Reload (URL push - WIP)</Link>
        {children}
    </div>
}

export default Checkout;