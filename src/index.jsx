import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Machine, State, Transition } from './machine/';
import Container from './components/Container';
import Checkout from './components/Checkout';
import Error from './components/Error';
import Estimate from './components/Estimate';
import Loader from './components/Loader';
import Lookup from './components/Lookup';
import NoResults from './components/NoResults';
import Submitting from './components/Submitting';

const events = {
    REJECT: 'REJECT',
    RESOLVE: 'RESOLVE',
    RETRY: 'RETRY',
    SUBMIT: 'SUBMIT'
}

ReactDOM.render(
    <Container>
        <Machine name='checkout' url='/checkout/:stockNumber'>
            <State component={Loader} initial state='loading'>
                <Transition event={events.RESOLVE} target='hub'/>
                <Transition event={events.REJECT} target='error'/>
            </State>
            <State component={Checkout} state='hub'>
                <State state='trade-in' url='/trade-in'>
                    <State component={Loader} initial state='loading'>
                        <Transition event={events.RESOLVE} target='lookup'/>
                        <Transition event={events.ERROR} target='error'/>
                    </State>
                    <State component={Lookup} state='lookup'>
                        <Transition event={events.SUBMIT} target='submitting'/>
                    </State>
                    <State component={Submitting} state='submitting'>
                        <Transition event={events.RESOLVE} target='estimate'/>
                        <Transition event={events.ERROR} target='no-results'/>
                    </State>
                    <State component={Estimate} state='estimate' url='/estimate'/>
                    <State component={NoResults} state='no-results' url='/no-results'/>
                </State>
            </State>
            <State component={Error} state='error' url='error'>
                <Transition event={events.RETRY} target='loading'/>
            </State>
        </Machine>
    </Container>
, document.getElementById('root'));
