import React from 'react';
import { Link } from '../src';

export const App = ({ children }) => <main>
    <header>Example | Finite State Machine Router</header>
    {children}
    <nav>
        <Link className='custom-class' href='/parent/child'>Link</Link>
        <Link className='custom-class' href='/parent/child-2'>Link</Link>
    </nav>
</main>;

export const Child = (props) => <div><h1>Child</h1></div>;
export const Error = (props) => <div><h1>Error</h1></div>
export const NotFound = (props) => <div><h1>Not Found</h1></div>
