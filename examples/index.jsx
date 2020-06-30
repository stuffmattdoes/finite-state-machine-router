import React from 'react';
import ReactDOM from 'react-dom';
import { Link, Machine, State, Transition } from '../src';

const App = ({ children, machine }) => <main>
    <header>Example | Finite State Machine Router</header>
    <nav>
        <Link href='/parent/child-1'>URL: Child 1</Link><br/>
        <Link href='/parent/child-2'>URL: Child 2</Link><br/>
        <Link href='/parent/child-3'>URL: Child 3</Link><br/>
        <Link href='/parent/child-4'>URL: Child 4</Link>
    </nav>
    {/* <ul>
        <li onClick={event => machine.send('test-event-1')}>EVENT: Child 1</li>
        <li onClick={event => machine.send('test-event-2')}>EVENT: Grand Child 2</li>
    </ul> */}
    {children}
</main>;

const generic = (name) => ({ children }) => <div>
    <p>{name}</p>
    {children}
</div>

ReactDOM.render(
    <Machine id='home'>
        <State id='parent' component={App} path='/parent'>
            <Transition event='test-event-1' target='grand-child-1-2'/>
            <Transition event='test-event-2' target='grand-child-2-2'/>
            <Transition event='test-event-3' target='grand-child-3-2'/>
            <Transition event='test-event-4' target='grand-child-4-2'/>
            <State id='child-1' path='/child-1'>
                <State id='grand-child-1' component={generic('Grand Child 1')}/>
            </State>
            <State id='child-2' path='/child-2'>
                <State id='Grand Child 2-1' component={generic('Grand Child 2-1')}/>
                <State id='grand-child-2-2' component={generic('Grand Child 2-2')}/>
            </State>
            <State id='child-3' path='/child-3' component={generic('Grand Child 3')}>
                <State id='Grand Child 3-1' component={generic('Grand Child 3-1')}/>
                <State id='grand-child-3-2' initial component={generic('Grand Child 3-2')}/>
            </State>
            <State id='child-4' path='/child-4' component={generic('Grand Child 4')}/>
        </State>
        <State id='*' component={generic('Not Found')}/>
        <State id='error' component={generic('Error')}/>
    </Machine>,
    document.getElementById('root')
);
