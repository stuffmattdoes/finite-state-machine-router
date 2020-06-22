import React from 'react';
import ReactDOM from 'react-dom';
import { Link, Machine, State, Transition } from '../src';
import { App, Child, Error, NotFound } from './components';

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
