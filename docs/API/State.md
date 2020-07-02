# `<State/>`
`<State/>` components are the building block of our application. Everything our user will see is a combination of states, with most supplied with React Components to render. `<State/>` components contain unique naming and routing information for the entire state machine to follow when applicable.

## Properties
&ast; = Required property
<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>component</code></td>
        <td><code>React component</code></td>
        <td></td>
        <td>React component to be rendered in this state.</td>
    </tr>
    <tr>
        <td><code>id</code>*</td>
        <td><code>String</code></td>
        <td></td>
        <td>Unique identifier for this state. This must be different than all ancestors and siblings.</td>
    </tr>
    <tr>
        <td><code>initial</code></td>
        <td><code>Boolean</code></td>
        <td><code>false</code></td>
        <td>Denotes the state to be resolved to upon state machine initiation. If no children states are marked as initial, the first child state will be rendered. Doesn't apply if the parent state is a parallel type, because all children of parallel type are simultaneously active.</td>
    </tr>
    <tr>
        <td><code>path</code></td>
        <td><code>String</code></td>
        <td></td>
        <td>The URL that the browser will resolve to upon entry of this state. It is relative to all ancestor urls.</td>
    </tr>
</table>

## Reference
[SCXML W3C Specification - State](https://www.w3.org/TR/scxml/#state)
>Holds the representation of a state.