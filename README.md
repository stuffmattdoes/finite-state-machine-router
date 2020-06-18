# Finite State Machine Router (for React)
A finite state machine + declarative URL routing (for React).

## Summary
A **finite state machine (FSM)** is mathematical concept used to describe a flow of information from one layout (or *state*) to another according to a set of rules (or *transitions*). FSMs are described as "a limited number of states and corresponding transitions from these states into other states."

In front-end web development we'll use FSMs to render the proper user interface. Furthermore, we'll integrate our FSM with a routing mechanism so our URLs and state resolution can be handled automatically - hence **Finite State Machine Router**!

## Rules:
1. **Always Atomic** - State machine always resolves to an *atomic node* (states that have no child states).
2. **No Conditions** - State machine assumes all data is present to render a state it and its entire lineage (down to an *atomic node*, as per rule #1). Having no conditional rendering logic within components lends itself well to determinism, making our app more predictable.
3. **Events Rule** - Favor even emission instead of URL pushes in order to change states. Deriving an atomic state lineage from a URL is achievable, but not favorable.
4. **Order Matters** - When no `initial` state is declared, the first state in document order is rendered. Similarly, when multiple transitions may apply to an emitted event, the first one in document order is selected while discarding the rest.

## Examples:
### Basic

First, let's compose our app in our standard `index.jsx`
```jsx
import { Link, Machine, State, Transition } from 'fsm-router';

<Machine id='wood' path='/wood'>
    <Transition event='error' target='error'/>
    <Transition event='not-found' target='not-found'/>
    <State id='home' component={Home}>
        <Transition event='browse' target='browse'/>
    </State>
    <State id='browse-wrapper' path='/browse'>
        <State id='browse' component={Browse}/>
        <State id='species' component={Species} path='/:speciesId'/>
    </State>
    <State id='error' component={Error}/>
    <State id='not-found' component={NotFound}/>
</Machine>
```

What's going on here?
- `<Machine/>` is our wrapper that contains unique naming & URL base pathing for our app.
- `<State/>` conveys the UI components in a familiar tree hierarchy. Most of the time, you'll supply a `component` attribute which accepts a React component.
- `<Transition/>` outline the rules on how we get from one `<State/>` to another. They are activated by emitting `events`, and are only valid when inside an active `<State/>` lineage.

Now, let's write some components.
```jsx
// `history`, `machine`, & `match` are fsm-router-specific
const Home = ({ children, history, machine: { send }, match }) =>
    <div>
        <h1>Intro Page!</h1>
        <button onClick={event => send('browse')}>Browse Wood Selection</button>
    </div>
```
Notice the components props. You should be familiar with `children`, React's default argument for allowing hierarchy. What's new are `history`, `machine`, and `match`, which are all populated automatically when supplied to `<State component={thisComponent}/>`.

Pay special attention to `machine.send()`. This is how we dispatch events to our state machine in order to activate transitions. In this particular example, `send('browse')` would cause out state machine to exit the `home` state and enter the `browse` state. The URL would update automatically according to our `path` attributes.

Let's keep going.
```jsx
const Browse = ({ children, history, machine, match }) => {
    const selection = [
        {
            summary: 'Northern red oak is a hardwood with a pleasing aesthetic, making it ideal for sturdy home furniture.',
            id: 'northern-red-oak',
            species: 'Northern Red Oak'
        },
        {
            summary: 'Pine is a common softwood, often characterized as having many knots.',
            id: 'pine,
            species: 'Pine'
        },
        {
            summary: 'Poplar wood is a lightweight, softwood and straight-grained, making it ideal for small kit projects.',
            id: 'poplar,
            species: 'Poplar'
        }
    ];

    return <div>
        <h1>Wood selection</h1>
        <ul>
            {selection.map(({ summary, id, species }) => <li key={id}>
                <h2>Wood species: {species}</h2>
                <p>Summary: {summary}</p>
                <Link href={`/browse/${id}`}>Read More</Link>
            </li>)}
        </ul>
    </div>
}
```
Although we want to favor emitting events instead of pushign URLs, we can still push URLs. To do this, we'll use the `<Link/>` component. This is utlimately a wrapper for the native `<a/>` browser anchor tag, but uses `history.push` to update URls instead of replace. This is to prevent page reloads on URL changes.

```jsx
const Species = ({ childre, history, machine, match }) => {
    const [ species, set ] = useCustomStoreHook();

    const {
        exact,  // true
        params, // { 'speciedId': 'northern-red-oak' }
        path,   // '/:speciesId'
        url     // '/browse/northern-red-oak'
    } = match;

    return <div>
        <h1>Wood species: {species.name}</h1>
        <h2>Id: {match.params.speciesId}</h2>
        <p>Description: {species.description}</p>
    </div>
}
```
Finally, we have access to all the various routing parameters with `match`. This is most useful for when you need to obtain a dynamic URL variable - for example, we've declared `path='/:speciesId'` which may look like `/northern-red-oak` in the URL.

### With API fetching
Here's how we're going to organize our API requests:
1. `App.jsx` container component makes API request to get some data.
2. To re-dispatch the API request in `App.jsx`, we can click the "refresh" button.
3. Once the user lands on `/browse`, we're going to make another API request in our `BrowseFetch` component.

Because we don't want to include conditional render logic in our component (upholding **No Conditions** rule), we'll want to initially render loaders within each component that we're fetching data. Once resolved, we'll simply `send` machine events to transition from our loader components into our data-rich components.

```jsx
<Machine id='wood' path='/wood'>
    <State id='app' component={App}>
        <Transition event='fetch' target='app-loader'/>
        <State id='app-loader' component={Loader}>
            <Transition event='resolve' target='home'/>
            <Transition event='reject' target='error'/>
        </State>
        <State id='home' component={Home}>
            <Transition event='browse' target='browse'/>
        </State>
        <State id='browse-wrapper' path='/browse' component={BrowseFetch}>
            <State id='browse-loader' component={Loader}>
                <Transition event='resolve' target='browse'/>
                <Transition event='reject' target='error'/>
            </State>
            <State id='browse' component={Browse}/>
            <State id='species' component={Species} path='/:speciesId'/>
        </State>
    </State>
    <State id='error' component={Error}/>
    <State id='not-found' component={NotFound}/>
</Machine>

const App = ({ children, history, machine: { send }, match }) => {
    const _fetch = () => {
        fetchSomeData()
            .then(res => {
                setState(res.data);
                send('resolve');
            }).catch(err => send('reject'));
    }

    useEffect(() => {
        _fetch();
    });

    return <div>
        <button onClick={event => {
            send('fetch');
            _fetch();
        }}>Refresh</button>
        {children}
    </div>
}

const BrowseFetch = ({ children, history, machine: { send }, match }) => {
    useEffect(() => {
        fetchSomeMoreData()
            .then(res => {
                setState(res.data);
                send('resolve'));
            }.catch(err => send('reject'));
    });

    return children;
}
```

## `useMachine` hook
If you need access to the state machine outside of a standard React component, you can use the `useMachine` hook.
```jsx
import { useMachine } from 'fsm-router';

const [ machine: { current, history, id, params }, send ] = useMachine();
```

## API
- [`<Machine/>`](./docs/API/Machine.md)
- [`<State/>`](./docs/API/State.md)
- [`<Transition/>`](./docs/API/Transition.md)
- [`<Link/>`](./docs/API/Link.md)

## References:
- [WC4 SCXML Specification](https://www.w3.org/TR/scxml/)
- [David Harel's "Statecharts: A Visual Formalism for Complex Systems](http://www.inf.ed.ac.uk/teaching/courses/seoc/2005_2006/resources/statecharts.pdf)

## License
MIT License Copyright (c) 2020-present, Matthew Morrison
