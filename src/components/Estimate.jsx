import React, { useEffect } from 'react';

function Estimate({ children }) {
    useEffect(() => console.log('render'));
    return <div className='estimate'>Estimate</div>;
}

export default Estimate;