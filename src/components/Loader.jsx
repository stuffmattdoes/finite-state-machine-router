import React, { useEffect } from 'react';

function Loader ({ children, machine }) {
    useEffect(() => {
        const rnd = Math.random();
        const timeout = 1500;
        setTimeout(() => rnd < 0.25 ? machine.send('REJECT') : machine.send('RESOLVE'), timeout);
    }, []);
    
    return <div className='loader'>
        <h1>Loading...</h1>
        {children}
    </div>
}

export default Loader;