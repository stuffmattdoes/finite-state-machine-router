import React from 'react';

function SubError({ children, machine }) {
    // useEffect(() => console.log('render'));
    return <div className='errir'>
        <p>Something went wrong!</p>
    </div>;
}

export default SubError;