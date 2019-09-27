import React from 'react';

function SubError({ children, machine }) {
    return <div className='error'>
        <p>Something went wrong!</p>
    </div>;
}

export default SubError;