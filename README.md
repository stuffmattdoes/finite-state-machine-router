# React Finite State Machine Router
A finite state machine (FSM) router for React

### Reference:
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

### Inspirations:
- I want declarative URL routing with a finite state machine to make my app simple and deterministic
- I do NOT want to resort to `deriving state from props`, aka `prop-checking`
- I like David Khourshid's [XState](https://xstate.js.org/docs/) and Ryan Florence's [React Router](https://reacttraining.com/react-router/web/guides/quick-start), so basically putting those two together
- I don't want to constantly push to new URLs. I'd rather dispatch state transitions and have the URL resolve itself.

## Todo:
Check out [proposals](./docs/Proposals.md).
- [x] ~~Recursively render all sub `<State/>`~~
- [x] ~~Resolve all `initial` states on first render. What to do if `initial` state is not also `atomic`?~~
    * ~~Resolve all states until `atomic` is reached, as per SCXML W3C spec.~~
- [x] ~~Update browser URL from state (if `url` prop exists on `<State/>` component)~~
- [x] ~~Derive initial state from URL (direct nav, prev/next)~~
- [ ] Figure out parallel states
- [ ] Typescript
- [ ] Deriving state from URL resolves to all states with matching `url` prop *except* for `atomic` state, which resolve to `initial`.
