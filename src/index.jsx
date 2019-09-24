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

const actionTypes = {
    REJECT: 'REJECT',
    RESOLVE: 'RESOLVE',
    RETRY: 'RETRY',
    SUBMIT: 'SUBMIT'
}

// In memory for URL -> state resolution
// const routeTree = {
//     '/checkout': {
//         '/': 'checkout',
//         '/trade-in': {
//             '/': 'trade-in',
//             '/estimate': 'checkout.trade-in.estimate',
//             '/no-results': 'checkout.trade-in.no-results',
//         },
//         '/error': 'checkout.error'
//     }
// };

ReactDOM.render(
    <Container>
        <Machine name='checkout' url='/checkout/:stockNumber'>
            <State component={Loader} initial state='loading'>
                <Transition action={actionTypes.RESOLVE} target='hub'/>
                <Transition action={actionTypes.REJECT} target='error'/>
            </State>
            <State component={Checkout} state='hub'>
                <State state='trade-in' url='/trade-in'>
                    <State component={Loader} initial state='loading'>
                        <Transition action={actionTypes.RESOLVE} target='lookup'/>
                        <Transition action={actionTypes.ERROR} target='error'/>
                    </State>
                    <State component={Lookup} state='lookup'>
                        <Transition action={actionTypes.SUBMIT} target='submitting'/>
                    </State>
                    <State component={Submitting} state='submitting'>
                        <Transition action={actionTypes.RESOLVE} target='estimate'/>
                        <Transition action={actionTypes.ERROR} target='no-results'/>
                    </State>
                    <State component={Estimate} state='estimate' url='/estimate'/>
                    <State component={NoResults} state='no-results' url='/no-results'/>
                </State>
            </State>
            <State component={Error} state='error' url='error'>
                <Transition action={actionTypes.RETRY} target='loading'/>
            </State>
        </Machine>
    </Container>
, document.getElementById('root'));
