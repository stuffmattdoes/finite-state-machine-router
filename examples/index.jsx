import React from 'react';
import ReactDOM from 'react-dom';
import { Link, Machine, State, Transition } from '../src';

const App = ({ children }) => <main>
    <header>Example | Finite State Machine Router</header>
    {children}
    <nav>
        <Link className='custom-class' href='/parent/child'>Link</Link>
        <Link className='custom-class' href='/parent/child-2'>Link</Link>
    </nav>
</main>;

const Child = (props) => <div><h1>Child</h1></div>;
const Error = (props) => <div><h1>Error</h1></div>
const NotFound = (props) => <div><h1>Not Found</h1></div>

ReactDOM.render(
    <Machine id='home' path='/home'>
        <State id='parent' component={App} path='/parent'>
            <State id='child' component={Child} path='/child'/>
        </State>
        <State id='*' component={NotFound}/>
        <State id='error' component={Error}/>
    </Machine>,
    document.getElementById('root')
);
