# Guarding URLs
### Question
How do I guard URLs and ensure you can't access a page if you navigate directly to it but conditions aren't yet met for that state? For example, attempting to access `step 3` of a multi-step application without having first completed `step 1` or `step 2`.

### Answer
State Nodes have the ability to execute code (including sending events) before their render is complete - meaning we can effectively redirect away from an inaccessible route derived from a URL if conditions are not met.

### Example
Consider the example below, which includes both user-auth and conditional accessibility.

1. Auth logic contained in `Auth` component. Upon failing authorization, send `unauthorized` state machine event. Matching child `Transition` component handles the rest.
2. Pending successful auth check, render `Finance` component.
3. Finance component dispatches `fetch` event, transitioning to Loading component (we've successfully guarded 'step-n' URL here)
4. Pending successful `fetch` event, dispatch 'resolve' event with additional `step` data payload, dericed from API response
5. State machine event data is accessible via 'cond' attribute of transition. So although 3 transitions match the 'resolve' event, only one will be selected based on `cond === true`

Could further simplify State tree if finance steps were not accessible via URLs (meaning no `path` attribute). The hashed URL scheme I implemented in V1 was mainyl due to how complex the stepped progression logic became. Since that logic is no longer valid here, we can do without urls per step if we would like.

The benefit here is that none of our components have to know anything about any of the other components, nor about any URL routing & redirects. They simply dispatch events, which are managed by the state node tree.

```jsx
<State id='auth' component={Auth}>
    <Transition event='unauthorized' target='login'/>
    ...rest of sub apps
    <State id='finance' component={Finance} path='/finance'>
        <Transition event='fetch' target='finance-loading'/>
        <Transition cond={data => data.step === 1} event='resolve' target='finance-step-1'/>
        <Transition cond={data => data.step === 2} event='resolve' target='finance-step-2'/>
        <Transition cond={data => data.step === 3} event='resolve' target='finance-step-3'/>
        <Transition event='success' target='finance-done'/>
        <State id='finance-loading' component={Loading}/>
        <State id='finance-step-1' component={FinanceStep1} path='#step-1'>
            <Transition event='continue' target='finance-step-2'/>
        </State>
        <State id='finance-step-2' component={FinanceStep2} path='#step-2'>
            <Transition event='back' target='finance-step-1'/>
            <Transition event='continue' target='finance-step-3'/>
        </State>
        <State id='finance-step-3' component={FinanceStep3} path='#step-3'>
            <Transition event='submit' target='finance-loader'/>
        </State>
        <Final id='finance-done' component={FinanceDone} path='/finance-done'/>
    </State>
</State>
<State id='login' component={Login}>
    ...login states
</State>
```