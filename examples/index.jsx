import React from 'react';
import ReactDOM from 'react-dom';
import { Link, Machine, State, Transition } from '../src';

const App = ({ children }) => <main>
    <header>Example | Finite State Machine Router</header>
    {children}
    <Link className='custom-class'>Link</Link>
</main>;

const Child = (props) => <div>Child</div>;
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
