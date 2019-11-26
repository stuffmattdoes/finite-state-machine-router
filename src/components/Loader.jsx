import React from 'react';

function Loader ({ children, machine }) {
    return <div className='loader'>
        <h1>Loading...</h1>
        {children}
    </div>
}

export default Loader;