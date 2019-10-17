# Proposals

```jsx
// This is NOT an implementation example.
// This is just a detail of how you'd conceptually structure a state machine.
// Actual implementation would be in JSX

const states = {        // state = traffic
    id: 'traffic',
    path: '/traffic',
    states: {
        green: {                                // state =  traffic.green
            path: '/green',
            on: { TIMER: 'yellow' } },
        yellow: {                               // state = traffic.yellow
            path: '/yellow',
            on: { TIMER: 'red' }
        },
        red: {                                  // state = traffic.red
            path: '/red',
            type: 'parallel',
            states: {
                // path prop on paralell sub states will resolve to first/query params?
                walkSign: {                     // state = traffic.red.walkSign
                    initial: 'solid',
                    states: {
                        solid: { on: { COUNTDOWN: 'flashing' }},        // state = traffic.red.walkSign.solid
                        flashing: { on: { STOP_COUNTDOWN: 'solid' }}    // state = traffic.red.walkSign.flashing
                    }
                },
                pedestrian: {                   // state = traffic.red.pedestrian
                    initial: 'walk',
                    states: {   
                        walk: { on: { COUNTDOWN: 'wait' }},             // state = traffic.red.pedestrian.walk
                        wait: { on: { STOP_COUNTDOWN: 'stop' }},        // state = traffic.red.pedestrian.wait
                        stop: { type: 'final' }                         // state = traffic.red.pedestrian.stop
                    }
                }
            }
        }
    }
}
```

### URL resolution
As per the code above, URL `/traffic/red` would resolve to state `traffic.red[walksign.solid, pedestrian.walk]`

### State matching
Implement a `matches(state)` function to determine if a value matches the current state

```jsx
const state = traffic.red[walksign.solid, pedestrian.walk];
matches('traffic.red');     // = true
matches('traffic.red.walkSign');    // = true
matches('traffic.red.pedestrian.walk');     // = true
matches({ 
    traffic: {
        red: {
            walkSign: 'solid',
            pedestrian: 'walk'
        }
    }
);      // = true
```

### Render props
```jsx
<State id='loading' path='/loading'>
    { (props) => <Loader>
        <Transition event={events.RESOLVE} target='hub'/>
        <Transition event={events.REJECT} target='error'/>
        <State id='intermediary' path='/intermediary'>
            <State component={SubLoader2} id='sub-loading-2' path='/sub-loading-2'/>
            <State component={SubLoader} id='sub-loading' initial url='/sub-loading'>
                <Transition event={'SUBLOADER'} target='sub-loading-2'/>
            </State>
        </State>
    </Loader>}
</State>
```