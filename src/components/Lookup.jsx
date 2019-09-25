import React, { useEffect } from 'react';

function Lookup({ children }) {
    // useEffect(() => console.log('render'));
    return <div className='lookup'>
        <h1>Lookup</h1>
        {children}
    </div>;
}

export default Lookup;