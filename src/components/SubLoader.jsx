import React, { useEffect } from 'react';

function SubLoader ({ children, machine }) {
    useEffect(() => {
        let id = setTimeout(() => machine.send('SUBLOADER'), 500);
        // return () => clearTimeout(id);
    }, []);

    return <div className='sub-loader'>
        <p>This will only take a minute!</p>
    </div>
}

export default SubLoader;