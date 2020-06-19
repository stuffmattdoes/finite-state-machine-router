import React from 'react';
import ReactDOM from 'react-dom';
import { Machine, State, Transition } from '../../dist';

const App = ({ children }) => <main>
    <header>Finite State Machine Router</header>
    {children}
</main>;

ReactDOM.render(
    <Machine id='base'>
        {/* <State id='parent' component={App}/> */}
    </Machine>,
    document.getElementById('root')
);
