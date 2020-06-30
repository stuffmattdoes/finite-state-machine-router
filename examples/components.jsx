import React from 'react';
import { Link } from '../src';

export const App = ({ children, machine }) => <main>
    <header>Example | Finite State Machine Router</header>
    <ul>
        <li onClick={event => machine.send('test-event-1')}>Child 1</li>
        <li onClick={event => machine.send('test-event-2')}>Grand Child 2</li>
    </ul>
    {children}
</main>;

export const generic = (name) => ({ children }) => <div>
    <p>{name}</p>
    {children}
</div>
