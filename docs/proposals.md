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

### Comprehensive App
```jsx
<Machine id='checkout' path='/checkout'>
    <State id='hub' path='/:stockNumber' invoke={fetchProgression} onEnter={isAuth}>
        <Transition event={progress.RESOLVE} target='hub'/>
        <Transition event={progress.REJECT} target='error'/>
        <ProgressHub>
            <Transition event={progressHub.RESOLVE} target='progress-hub'/>
            <Transition event={progressHub.REJECT} target='not-found'/>
            <State id='loading'/>
            <State id='finance' path='/finance' onEnter={finance.fetchApp}>
                { ctx => (
                    <Finance>
                        <Transition event={ctx.events.REJECT} target='no-finance-app'/>
                        <Transition event={ctx.events.RESOLVE} target='finance-app'/>
                        <State id='loading' initial>
                            <Transition event={'REJECT'} target='no-finance-app'/>
                            <Transition event={'RESOLVE'} target='finance-app'/>
                        </State>
                        <State id='finance-app' path='/app'>
                            <State id='finance-app-step-1' path='#step-1'/>
                            <State id='finance-app-step-2' path='#step-2'/>
                            <State id='finance-app-step-3' path='#step-3'/>
                            <State type='final' id='finance-app-step-4'/>
                        </State>
                        <State id='no-finance-app' >
                            <h1>No finance app found!</h1>
                        </State>
                    </Finance>
                )}
            </State>
            <State path='/maxcare' invoke={fetchMaxCare}>
                <State id='maxcare-loading'/>
            </State>
            <State path='/trade-in' invoke={FetchTradeIn}>
                <State id='trade-in-loading'/>
            </State>
        </ProgressHub>
    </State>
</Machine>
```