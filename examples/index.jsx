import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createMachine, Link, Machine, State, Transition, useMachine } from '../src';

const App = ({ children, history, machine }) =>
    <main>
        <header>Example | Finite State Machine Router</header>
        <nav>
            <Link href='/parent/child-1'>URL: Child 1</Link><br/>
            <Link href='/parent/child-2'>URL: Child 2</Link><br/>
            <Link href='/parent/child-3'>URL: Child 3</Link><br/>
            <Link href='/parent/child-4' replace>URL: Child 4</Link>
        </nav>
        <ul>
            <li onClick={event => machine.send('child-1')}>EVENT: Child 1</li>
            <li onClick={event => machine.send('grand-child-2-1')}>EVENT: Grand Child 2-1</li>
            <li onClick={event => machine.send('grand-child-3-2')}>EVENT: Grand Child 3-2</li>
            <li onClick={event => machine.send('grand-child-3-3')}>EVENT: Grand Child 3-3</li>
            <li onClick={event => machine.send('child-4')}>EVENT: Child 4</li>
        </ul>
        {children}
    </main>;

const generic = (name) => ({ children, match: { params }}) => {
    const [ machine, send ] = useMachine();

    return <div>
        <p>{name}</p>
        {children}
    </div>
}

const transitionOnMount = (name) => ({ children, match: { params }}) => {
    const [ machine, send ] = useMachine();
    useEffect(() => {
        send('mount');
    }, []);

    return <div>
        <p>{name}</p>
        {children}
    </div>
}

ReactDOM.render(
    <Machine logging>
        <State id='parent' component={App} path='/parent'>
            <Transition event='child-1' target='child-1'/>
            <Transition event='grand-child-2-1' target='grand-child-2-1'/>
            <Transition event='grand-child-3-2' target='grand-child-3-2'/>
            <Transition event='grand-child-3-3' target='grand-child-3-3'/>
            <Transition event='child-4' target='child-4'/>
            <Transition event='grand-child-4' target='grand-child-4'/>
            <State id='child-1' path='/child-1'>
                <State id='grand-child-1' component={generic('Grand Child 1')}>
                    <State id='great-grand-child-1' path='/great-grand-child-1' component={generic('Great Grand Child 1')}/>
                </State>
            </State>
            <State id='child-2' path='/child-2'>
                <State id='grand-child-2-1' component={generic('Grand Child 2-1')}/>
                <State id='grand-child-2-2' component={generic('Grand Child 2-2')}/>
            </State>
            <State id='child-3' path='/child-3' component={generic('Grand Child 3')}>
                <State id='grand-child-3-1' component={generic('Grand Child 3-1')}/>
                <State id='grand-child-3-2' initial component={generic('Grand Child 3-2')}/>
                <State id='grand-child-3-3' component={generic('Grand Child 3-3')}/>
            </State>
            <State id='child-4' path='/child-4' component={generic('Child 4')}/>
            <State id='transition' path='/transition' component={transitionOnMount('Transition!')}>
                <Transition event='mount' target='child-4'/>
            </State>
        </State>
        <State id='*' component={generic('Not Found')}/>
        <State id='error' component={generic('Error')}/>
    </Machine>,
    document.getElementById('root')
);
