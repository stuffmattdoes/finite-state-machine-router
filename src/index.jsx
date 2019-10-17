import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// State machine
import { Machine, State, Transition } from './machine';

// Components
import Container from './components/Container';
import Checkout from './components/Checkout';
import Error from './components/Error';
import Estimate from './components/Estimate';
import Loader from './components/Loader';
import Lookup from './components/Lookup';
import NoResults from './components/NoResults';
import SubError from './components/SubError';
import SubLoader from './components/SubLoader';
import SubLoader2 from './components/SubLoader2';
import Submitting from './components/Submitting';

const events = {
    REJECT: 'REJECT',
    RESOLVE: 'RESOLVE',
    RELOAD: 'RELOAD',
    SUBMIT: 'SUBMIT',
    SUBLOADER: 'SUBLOADER'
}

// Initial state should be:
// #checkout.loading.sub-loading

ReactDOM.render(
    <Container>
        <Machine id='checkout' url='/checkout'>
            <State component={Loader} id='loading' url='/loading' onEntry={() => console.log('onEntry')} onExit={() => console.log('onExit')}>
                <Transition event={events.RESOLVE} target='hub'/>
                <Transition event={events.REJECT} target='error'/>
                <State id='intermediary' url='/intermediary'>
                    <State component={SubLoader2} id='sub-loading-2' url='/sub-loading-2'/>
                    <State component={SubLoader} id='sub-loading' initial url='/sub-loading'>
                        <Transition event={events.SUBLOADER} target='sub-loading-2'/>
                    </State>
                </State>
            </State>
            <State component={Checkout} id='hub'>
                <State id='trade-in' url='/trade-in'>
                    <State component={Lookup} id='lookup'>
                        <Transition event={events.SUBMIT} target='submitting'/>
                    </State>
                    <State component={Submitting} id='submitting'>
                        <Transition event={events.RESOLVE} target='estimate'/>
                        <Transition event={events.REJECT} target='no-results'/>
                    </State>
                    <State component={Estimate} id='estimate' url='/estimate'/>
                    <State component={NoResults} id='no-results' url='/no-results'/>
                </State>
                <Transition event={events.RELOAD} target='loading'/>
            </State>
            <State component={Error} id='error' url='/error'>
                <Transition event={events.RELOAD} target='loading'/>
                <State component={SubError} id='sub-error'/>
            </State>
        </Machine>
    </Container>
, document.getElementById('root'));
