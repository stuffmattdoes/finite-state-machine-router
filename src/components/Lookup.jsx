import React from 'react';

function Lookup({ children }) {
    return <div className='lookup'>
        <h1>Lookup</h1>
        {children}
    </div>;
}

export default Lookup;