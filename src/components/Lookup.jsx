import React from 'react';

function Lookup({ children }) {
    return <div className='lookup'>
        <p>Lookup body text</p>
        {children}
    </div>;
}

export default Lookup;