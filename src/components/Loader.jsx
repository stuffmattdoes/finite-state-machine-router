import React, { useEffect } from 'react';

function Loader ({ children, machine }) {
    useEffect(() => {
        const res = Math.random() > 0.5 ? true : false;
        let id = setTimeout(() => res ? machine.send('RESOLVE') : machine.send('REJECT'), 1500);
        return () => clearTimeout(id);
    }, []);    
    return <div className='loader'>
        <h1>Loading...</h1>
        {children}
    </div>
}

export default Loader;