import React, { useEffect } from 'react';

function Loader (props) {
    const { children, machine } = props;

    useEffect(() => {
        const rnd = Math.random();
        setTimeout(() => rnd < 0.25 ? machine.dispatch('REJECT') : machine.dispatch('RESOLVE'), 1500);
        // console.log('render', rnd);
    });
    
    return <div className='loader'>
        <p>Loading...</p>
    </div>
}

export default Loader;