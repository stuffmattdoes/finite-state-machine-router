import React, { useEffect } from 'react';

function Estimate({ children }) {
    useEffect(() => console.log('render'));
    return <div className='estimate'>
        <h1>Estimate</h1>
    </div>;
}

export default Estimate;