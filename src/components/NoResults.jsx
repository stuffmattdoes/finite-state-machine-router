import React, { useEffect } from 'react';

function NoResults({ children }) {
    // useEffect(() => console.log('render'));
    return <div className='no-results'>
        <h1>No Results</h1>
    </div>;
}

export default NoResults;