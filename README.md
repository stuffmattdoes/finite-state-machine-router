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

Now, let's write some components.
```jsx
// `history`, `machine`, & `match` are fsm-router-specific
const Home = ({ children, history, machine: { send }, match }) =>
    <div>
        <h1>Intro Page!</h1>
        <button onClick={event => send('browse')}>Browse Wood Selection</button>
    </div>

const Browse = ({ children, history, machine, match }) => {
    const selection = [
        {
            summary: 'Northern red oak is a hardwood with a pleasing aesthetic, making it ideal for sturdy home furniture.',
            id: 100,
            species: 'Northern Red Oak'
        },
        {
            summary: 'Pine is a common softwood, often characterized as having many knots.',
            id: 101,
            species: 'Pine'
        },
        {
            summary: 'Poplar wood is a lightweight, softwood and straight-grained, making it ideal for small kit projects.',
            id: 102,
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

const Species = ({ childre, history, machine, match }) => {
    const [ species, set ] = useCustomStoreHook();

    return <div>
        <h1>Wood species: {species.name}</h1>
        <h2>Id: {match.params.speciesId}</h2>
        <p>Description: {species.description}</p>
    </div>
}
```

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
