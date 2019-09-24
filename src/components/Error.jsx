import React, { useEffect } from 'react';

function Error({ children, machine }) {
    // useEffect(() => console.log('render'));
    return <div className='errir'>
        <p>Error!</p>
        <button onClick={e => machine.dispatch('RETRY')}>Retry</button>
    </div>;
}

export default Error;