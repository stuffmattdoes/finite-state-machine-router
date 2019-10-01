# States
**Reference:** [SCXML W3C Specification - State](https://www.w3.org/TR/scxml/#state)

"Holds the representation of a state."

States are the building block of our application. Everything our user will see is a combination of states supplied with React Components to render. As a departure from the W3C SCXML Specification, our states can accept a URL which will handle browser history synchhronization automatically.

## Signature
`<State {...props} />`

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
        <td><code>url</code></td>
        <td><code>String</code></td>
        <td></td>
        <td>The URL that the browser will resolve to upon entry of this state. It is relative to all ancestor urls.</td>
    </tr>
    <tr>
        <td><code>onEntry</code></td>
        <td><code>Function</code></td>
        <td></td>
        <td>Function that is called when the upon entry to this state. Occurs before the first render.<br><br>
            <strong>Signature</strong><br>
            <code>function() => void<code><br>
        </td>
    </tr>
    <tr>
        <td><code>onExit</code></td>
        <td><code>Function</code></td>
        <td></td>
        <td>Function that is called upon exiting this state. Occurs after the last render.<br><br>
            <strong>Signature</strong><br>
            <code>function() => void<code><br>
        </td>
    </tr>
    <tr>
        <td><code>type</code></td>
        <td><code>String: [ "atomic", "compound", "default", "final", "parallel" ]</code></td>
        <td><code>default</code></tc>
        <td>Determines state behavior:<br><br>
            <ul>
                <li><strong>atomic</strong> - has no children states.</li>
                <li><strong>compound</strong> - has multiple children states, of which only one can be active.</li>
                <li><strong>default</strong> - has a sinle child state.</li>
                <li><strong>final</strong> - has no children states or transitions. Upon entry to this state, a <code>done</code> event is generated.</li>
                <li><strong>parallel</strong> - all children states are simultaneously active.</li>
            </ul>
        </td>
    </tr>
</table>

## Children
- [<State ... />](./State.md)
- [<Transition ... />](./Transition.md)