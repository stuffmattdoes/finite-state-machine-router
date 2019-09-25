import React from 'react';

function Checkout ({ children, machine}) {
    // useEffect(() => console.log('render'));

    return <div className='checkout'>
        <h1>Checkout</h1>
        <button onClick={e => machine.send('RELOAD')}>Reload</button>
        {children}
    </div>
}

export default Checkout;