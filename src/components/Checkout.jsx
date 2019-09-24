import React, { useEffect } from 'react';

function Checkout ({ children }) {
    // useEffect(() => console.log('render'));

    return <div className='checkout'>
        Checkout
        {children}
    </div>
}

export default Checkout;