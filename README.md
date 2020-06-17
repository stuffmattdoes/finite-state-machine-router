# Finite State Machine Router (for React)
A finite state machine router for React.

A **finite state machine (FSM)** is mathematical concept used to describe a flow of information from one layout (or *state*) to another according to a set of rules (or *transitions*). FSMs are described as a limited number of states and corresponding transitions from these states into other states. FSMs are widely popular in many domains of computer science and beyond - such as electrical engineering, aircraft autopilot systems, and so on. FSMs are very useful in mission-critical applications where unpredictable states can lead to catastrophic failure.

In front-end web development we'll use FSMs to render the proper user interface. Furthermore, we'll integrate our FSM with a routing mechanism so our URLs and state resolution can be handled automatically - hence **Finite State Machine Router (FSMR)**! Gone are the days of wrangling your bloated implementation of `history.push`.

## Getting Started
1. Run `npm install react-finite-state-machine-router`
2. Run `npm start`
3. Navigate to `localhost:3000` in browser

## Implementation:
First - a *state* is a user interface view within the context of our application.

Now, Commit these three rules to memory:
1. *Atomic Nodes Rule* - State machines always resolve to an *atomic node* - which are states that have no further child states. In FSMR, these are child-less React components.
2. *No Conditional Renders* - upon entering a state, our state machine assumes all the data is present to render it and its entire lineage down to an *atomic node* (see rule #1). This lends itself well to determinism, making our app more predictable.
    * *Note* - You can still fetch data and show loading screens. Not to worry! We'll cover this shortly.
3. *Events > URLs* - Exiting a current state & entering a new state is achieved by emitting *events*, instead of pushing a new URL like we may be used to.
4. *Document Order Matters*

Let's see how these rules are exemplified. Here's what a *State Machine* might look like:
```jsx
import { Checkout, Error, Estimate, Loader, Lookup, NoResults, Submitting } from 'components';

<Machine id='checkout' path='/checkout/:stockNumber'>
    <State component={Loader} initial id='loading'>
        <Transition event='resolve' target='hub'/>
        <Transition event='reject' target='error'/>
    </State>
    <State component={Checkout} id='hub'>
        <State id='trade-in' path='/trade-in'>
            <State component={Loader} initial id='loading'>
                <Transition event='resolve' target='lookup'/>
                <Transition event='reject' target='error'/>
            </State>
            <State component={Lookup} id='lookup'>
                <Transition event='submit' target='submitting'/>
            </State>
            <State component={Submitting} id='submitting'>
                <Transition event='resolve' target='estimate'/>
                <Transition event='reject' target='no-results'/>
            </State>
            <State component={Estimate} id='estimate' path='/estimate'/>
            <State component={NoResults} id='no-results' path='/no-results'/>
        </State>
    </State>
    <State component={Error} id='error' path='error'>
        <Transition event='reload' target='loading'/>
    </State>
</Machine>
```

*Let's break this down:*
* `<Machine>` is the top-level wrapper component. You give it a unique `id` and a `path` for your base URL. In our example above, our `machine` is called "checkout", and it is available at `localhost:3000/checkout/<stockNumber>`
* `<State>` is our *state node*. They are the building blocks of our app. You give it a unique `id`. Optionally, you can supply a React `component` and `path` to map our your URL scheme. If a `component` attribute is supplied, it will be rendered as expected.
* `<Transition>` is how you get from one state to the next. They are nested within `<State>` nodes and are triggered when `events` are fired. They are renderless components, and exist solely to aid our application state machine index.

*What would happen if you navigate to `/checkout/1000/trade-in` in browser?*
1. Our state machine determines which `path` attribute hierarchy we've supplied best matches this URL. This would be `/checkout/:stockNumber/trade-in`.
    * Since this path includes a dynamic URL (indicated by the `:`), this can be accessed as `{ stockNumber: 1000 }`. We'll explore this more in-detail shortly.
2. Our state machine now determines which lineage of components to render according to our path, `/checkout/:stockNumber/trade-in`. 
3. We're done! Right? NOPE. Remeber *Rule #1 - Atomic Nodes Rule*. `trade-in` is not an atomic node, therefore we'll need to keep going! How? *Rule #4 - Document Order Matters*. The 

*What if we need some data from an API before we can even access `.../trade-in` at all?*

### Routing
Simply add a `path` attribute to your `<State>` node, and access it in the web!
`<State id='example-state' path='/example-url'>`

#### Dynamic Routes
Simply prefix a semicolon onto your `path` attribute `:` like so:
`<State id='example-state' path='/:dynamic-url'>`

### Inspirations:
- I want declarative URL routing with a finite state machine to make my app simple and deterministic
- I do NOT want to resort to `deriving state from props`, aka `prop-checking`
- I like David Khourshid's [XState](https://xstate.js.org/docs/) and Ryan Florence's [React Router](https://reacttraining.com/react-router/web/guides/quick-start), so basically putting those two together
- I don't want to constantly push to new URLs. I'd rather dispatch state transitions and have the URL resolve itself.

### Reference:
- [WC4 SCXML Specification](https://www.w3.org/TR/scxml/)
- [David Harel's "Statecharts: A Visual Formalism for Complex Systems](http://www.inf.ed.ac.uk/teaching/courses/seoc/2005_2006/resources/statecharts.pdf)
