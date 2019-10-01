# Machine
**Reference:** [SCXML W3C Specification - SCXML](https://www.w3.org/TR/scxml/#state)

"The top-level wrapper element, which carries version information. The actual state machine consists of its children. Note that only one of the children is active at any one time."

## State resolution
Upon initialization of our `Machine` wrapper component, the active child state is determined in this order:
- If the URL pathname (such as `//localhost:3000/example/pathname)` is present (obtained from (History)[https://github.com/ReactTraining/history/blob/master/docs/GettingStarted.md#properties] package's `history.location.pathname`), the children states with matching `url` properties will be resolve until the URL pathname tree is depleted. If the resultant state is not of type `atomic`, then each `initial` child state is resolved.
- If a URL pathname is not present or does not apply, each `initial` child state is resolved until a state of type `atomic` is reached.

## Signature
`<Machine {...props} />`

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
        <td><code>id</code>*</td>
        <td><code>String</code></td>
        <td></td>
        <td>Unique identifier for this machine. This must be different than all ancestors and siblings.</td>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td><code>String</code></td>
        <td></td>
        <td>The URL that the browser will resolve to upon entry of this machine. It is relative to all ancestor urls.</td>
    </tr>
</table>

## Children
- [<State ... />](./State.md)