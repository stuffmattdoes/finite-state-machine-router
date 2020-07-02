# Machine flow:
[x] Derive target state node from URL (including dynamic paths)
    [x] 1. Normalize child tree
        [x] * Generate state node -> URL map
        [x] * Generate stack for all state nodes
        [x] * Derive initial stack
    [x] 2. If match, resolve to corresponding state
    [x] 3. If no match, begin to parse dynamic state node paths (prefixed with :) for match
    [x] 4. If still no match, 404
        [x] *  If attemtping to resolve to a dynamic path without proper url param meta, throw error
[x] Resolve all initial children from target/active state node to atomic state node
    [x] 1. Resolve to target state node from URL (steps listed above)
    [x] 2. If target node is not atomic, resolve to every child marked "initial"
    [x] 3. If no child is marked initial, resolve to first in document order
[x] Update URL from atomic node
[x] Resolve to target state upon event
    [x] 1. First check most deeply-nested active atomic state for matching transition.
    [x] 2. If no match, parse ancestors for matching target
    [x] 3. If match, transition to target state node (& update URL). Otherwise, discard event
        [x] * If attemtping to resolve to a dynamic path without proper url param meta, throw error
        [x] * There are no limitations on transition targets. Any state can transition to any other state.
[ ] Emit event when Machine does stuff, like resolving to state from URL or resolving to atomic state

Thought: If all the above steps were events:
1. resolve.state_from_url
2. resolve.initial_child
3. resolve.url
4. resolve.target_state

## Todo:
Check out [proposals](./docs/Proposals.md).
- [x] ~~Recursively render all sub `<State/>`~~
- [x] ~~Resolve all `initial` states on first render. What to do if `initial` state is not also `atomic`?~~
    * ~~Resolve all states until `atomic` is reached, as per SCXML W3C spec.~~
- [x] ~~Update browser URL from state (if `path` prop exists on `<State/>` component)~~
- [x] ~~Derive initial state from URL (direct nav, prev/next)~~
- [ ] Figure out parallel states
- [ ] Typescript
- [ ] `Final` state types?
- [ ] `History` state types?
- [ ] `onEntry` & `onExit`
- [x] Simplify `type` to `parallel` since all other types are derived automatically
- [x] Unit tests!
- [x] Arguments passed into `util.js` should already be formatted with `React.Children.toArray`
- [ ] ~Implement `microStep` (the executin of a single transition) and `macroStep` (execution of multiple microSteps after which Machien is in a stable state i.e. depleted internal event queue).~
- [ ] Implement `History` attribute, which will resolve to last active state when entered. As it is now, initial lineage is resolved when entered.