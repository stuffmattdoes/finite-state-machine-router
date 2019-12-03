/*
    Reqs:
    [x] Derive target state node from URL (including dynamic paths)
        1. Parse tree on init and generate state node -> URL map
        2. If match, resolve to corresponding state
        3. If no match, begin to parse dynamic state node paths (prefixed with :) for match
        4. If still no match, 404
            *  If attemtping to resolve to a dynamic path without proper url param meta, throw error
    [ ] Resolve all initial children from target/active state node to atomic state node
        1. Resolve to target state node from URL (steps listed above)
        2. If target node is not atomic, resolve to every child marked "initial"
        3. If no child is marked initial, resolve to first in document order
    [ ] Update URL from atomic node
    [ ] Resolve to target state upon event
        1. First check most deeply-nested active atomic state for matching transition.
        2. If no match, parse ancestors for matching target
        3. If match, transition to target state node (& update URL). Otherwise, discard event
            * If attemtping to resolve to a dynamic path without proper url param meta, throw error
            * There are no limitations on transition targets. Any state can transition to any other state.

    if all the above steps were events:
    1. resolve.state_from_url
    2. resolve.initial_child
    3. resolve.url
    4. resolve.target_state
*/

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// State machine
import { Link, Machine, State, Transition } from './machine';

const Generic = (title) => ({ children, machine, match }) => (
    <div className={title && title.toLowerCase().replace(/\s/g, '')}>
        <h1>{title}</h1>
        {children}
    </div>
);
const GenericWithLinks = (title) => ({ children, machine }) => (
    <div className={title && title.toLowerCase().replace(/\s/g, '')}>
        <h1>{title}</h1>
        <Link event='reload'>Reload (State event)</Link>
        <br/>
        <Link href='/'>Reload (URL push - WIP)</Link>
    </div>
);
const App = Generic();
const Checkout = GenericWithLinks('Checkout');
const Error = GenericWithLinks('Error');
const Loading = Generic('Loading');
const NotFound = GenericWithLinks('Not Found');
const Step1 = ({ children, machine }) => <div className='step-1'>
    <h1>Step 1</h1>
    <Link event='continue'>Continue</Link>
</div>
const Step2 = () => Generic('Step2')(<Link event='continue'>Continue</Link>);
const Step3 = () => Generic('Step3')(<Link event='submit'>Submit</Link>);
const Submitting = Generic('Submitting');

const fetchData = ({ send }) => new Promise((resolve, reject) => {
    const rng = Math.random() >= 0.5 ? true : false;
    setTimeout(() => rng ? resolve(8675309) : reject(), 1500);
}).then(res => send('resolve', { params: { stockNumber: res }}))
.catch(err => send('reject'));

ReactDOM.render(
    <div className='container'>
        <Machine id='checkout' path='/checkout'>
            <State component={App} id='app' invoke={fetchData}>
                <Transition event='resolve' target='stockNumber'/>
                <Transition event='reject' target='error'/>
                <State component={Loading} id='loading'/>
                <State component={Checkout} id='stockNumber' path='/:stockNumber'>
                    <State component={Step1} id='step-1' path='/#step-1'>
                        <Transition event='continue' target='step-2'/>
                    </State>
                    <State component={Step2} id='step-2' path='/#step-2'>
                        <Transition event='continue' target='step-3'/>
                    </State>
                    <State component={Step3} id='step-3' path='/#step-3'>
                        <Transition event='submit' target='submit'/>
                    </State>
                    <State component={Submitting} id='submitting'>
                        <Transition event='resolve' target='done'/>
                        <Transition event='reject' target='error'/>
                    </State>
                </State>
            </State>
            <State component={Error} id='error'>
                <Transition event='reload' target='app'/>
            </State>
            <State component={NotFound} id='*' path='/404'>
                <Transition event='reload' target='app'/>
            </State>
        </Machine>
    </div>
, document.getElementById('root'));
