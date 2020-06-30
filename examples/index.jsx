import React from 'react';
import ReactDOM from 'react-dom';
import { Link, Machine, State, Transition } from '../src';
import { App, generic } from './components';

ReactDOM.render(
    <Machine id='home' path='/home'>
        <State id='parent' component={App} path='/parent'>
            <State id='child-1' path='/child-1'>
                <Transition event='test-event-2' target='grand-child-2-2'/>
                <State id='grand-child-1' component={generic('Grand Child 1')}/>
            </State>
            <State id='child-2' path='/child-2'>
                <Transition event='test-event-1' target='child-1'/>
                <State id='grand-child-2' component={generic('Grand Child 2')}/>
                <State id='grand-child-2-2' component={generic('Grand Child 2-2')}/>
            </State>
        </State>
        <State id='*' component={generic('Not Found')}/>
        <State id='error' component={generic('Error')}/>
    </Machine>,
    document.getElementById('root')
);
