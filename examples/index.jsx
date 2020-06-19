import React from 'react';
import ReactDOM from 'react-dom';
import { Machine, State, Transition } from '../src';

const App = ({ children }) => <main>
    <header>Example | Finite State Machine Router</header>
    {children}
</main>;

ReactDOM.render(
    <Machine id='base' path='lol'>
        <State id='parent' component={App} path='child'/>
    </Machine>,
    // <App/>,
    document.getElementById('root')
);
