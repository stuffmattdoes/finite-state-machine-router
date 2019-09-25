# Finite State Machine
A finite state machine (FSM) router for React

Made with [Create React App](./CRA.md)

Reference:
- [WC4 SCXML Specification](https://www.w3.org/TR/scxml/)
- [David Harel's "Statecharts: A Visual Formalism for Complex Systems](http://www.inf.ed.ac.uk/teaching/courses/seoc/2005_2006/resources/statecharts.pdf)

## Getting Started
1. Run `npm install`
2. Run `npm start`
3. Navigate to `localhost:3000` in browser

Example use:
```jsx
import { Checkout, Error, Estimate, Loader, Lookup, NoResults, Submitting } from 'components';

<Machine id='checkout' url='/checkout/:stockNumber'>
    <State component={Loader} initial id='loading'>
        <Transition event={events.RESOLVE} target='hub'/>
        <Transition event={events.REJECT} target='error'/>
    </State>
    <State component={Checkout} id='hub'>
        <State id='trade-in' url='/trade-in'>
            <State component={Loader} initial id='loading'>
                <Transition event={events.RESOLVE} target='lookup'/>
                <Transition event={events.ERROR} target='error'/>
            </State>
            <State component={Lookup} id='lookup'>
                <Transition event={events.SUBMIT} target='submitting'/>
            </State>
            <State component={Submitting} id='submitting'>
                <Transition event={events.RESOLVE} target='estimate'/>
                <Transition event={events.ERROR} target='no-results'/>
            </State>
            <State component={Estimate} id='estimate' url='/estimate'/>
            <State component={NoResults} id='no-results' url='/no-results'/>
        </State>
    </State>
    <State component={Error} id='error' url='error'>
        <Transition event={events.RELOAD} target='loading'/>
    </State>
</Machine>
```

## Todo:
Check out [proposals](./proposals.md).
- [ ] Update browser URL from state (if `url` prop exists on `<State/>` component)
- [ ] Derive application state from browser URL (for when user navigates directly to URL)
- [ ] Enable browser navigation (previous, next)
- [ ] Render all sub `<State/>`
