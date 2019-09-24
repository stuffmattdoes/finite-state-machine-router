# Finite State Machine
A finite state machine (FSM) router for React
Made with [Create React App](./CRA.md)

## Getting Started

Example use:
```jsx
import { Checkout, Error, Estimate, Loader, Lookup, NoResults, Submitting } from 'components';

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
```

## Todo:
- [] Update browser URL from state (if `url` prop exists on <State/> component)
- [] Derive application state from browser URL
- [] Render all sub <State/>