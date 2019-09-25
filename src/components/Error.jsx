import React from 'react';

function Error({ children, machine }) {
    // useEffect(() => console.log('render'));
    return <div className='errir'>
        <h1>Error</h1>
        {children}
        <button onClick={e => machine.send('RELOAD')}>Reload</button>
    </div>;
}

export default Error;