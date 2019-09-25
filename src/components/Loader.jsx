import React, { useEffect } from 'react';

function Loader ({ children, machine }) {
    useEffect(() => {
        const rnd = Math.random();
        setTimeout(() => rnd < 0.25 ? machine.send('REJECT') : machine.send('RESOLVE'), 1500);
        // console.log('render', rnd);
    });
    
    return <div className='loader'>
        <h1>Loading...</h1>
        {children}
    </div>
}

export default Loader;