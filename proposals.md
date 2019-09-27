# Proposals

```jsx

// This is NOT an implementation example. This is just a quick detail of how you'd conceptually structure a state machine.
const states = {        // state = traffic
    id: 'traffic',
    url: '/traffic',
    states: {
        green: {                                // state =  traffic.green
            url: '/green',
            on: { TIMER: 'yellow' } },
        yellow: {                               // state = traffic.yellow
            url: '/yellow',
            on: { TIMER: 'red' }
        },
        red: {                                  // state = traffic.red
            url: '/red',
            type: 'parallel',
            states: {
                // URL prop on paralell sub states will resolve to first/query params?
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

### URL Resolution
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
