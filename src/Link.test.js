import React from 'react';
import { Link, Machine, State, Transition } from '.';

describe('<Link/>', () => {
    const Child = (props) => <div>
        <Link event='link-event'>Link Event</Link>
        <Link href='/home'>Link Event</Link>
    </div>
    const machine = <Machine id='home' path='/'>
        <State id='child' component={Child}>
            <Transition event='link-event' target='child-2'/>
        </State>
        <State id='child-2'/>
    </Machine>;

    test('Pushes URL to history if href attribute is specified and clicked', () => {
        
    });

    // test('Emits event if event attribute is specified and clicked', () => {

    // });

    // test('Pushes URL to history when clicked -- even if navigated before', () => {
        
    // });

    // test('calls history.replaceState when link for current path is clicked without state', () => {
        
    // });

    // test('calls history.replaceState when link for current path is clicked with the same state', () => {

    // });

    // test('calls history.pushState when link for current path is clicked with different state', () => {

    // });
});