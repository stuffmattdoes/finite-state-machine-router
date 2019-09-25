import React from 'react';

function SubLoader ({ children, machine }) {
    return <div className='sub-loader'>
        <p>This will only take a minute!</p>
        {children}
    </div>
}

export default SubLoader;