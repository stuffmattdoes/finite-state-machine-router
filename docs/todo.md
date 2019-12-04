Machine flow:
[ ] Derive target state node from URL (including dynamic paths)
    1. Parse child tree on init and generate state node -> URL map
    2. If match, resolve to corresponding state
    3. If no match, begin to parse dynamic state node paths (prefixed with :) for match
    4. If still no match, 404
        *  If attemtping to resolve to a dynamic path without proper url param meta, throw error
[ ] Resolve all initial children from target/active state node to atomic state node
    1. Resolve to target state node from URL (steps listed above)
    2. If target node is not atomic, resolve to every child marked "initial"
    3. If no child is marked initial, resolve to first in document order
[ ] Update URL from atomic node
[ ] Resolve to target state upon event
    1. First check most deeply-nested active atomic state for matching transition.
    2. If no match, parse ancestors for matching target
    3. If match, transition to target state node (& update URL). Otherwise, discard event
        * If attemtping to resolve to a dynamic path without proper url param meta, throw error
        * There are no limitations on transition targets. Any state can transition to any other state.

Thought: If all the above steps were events:
1. resolve.state_from_url
2. resolve.initial_child
3. resolve.url
4. resolve.target_state