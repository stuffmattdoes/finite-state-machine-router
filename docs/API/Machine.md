# `<Machine/>`
`<Machine/>` component is the top-lever wrapper compnoent. It contains unique naming and routing information for the rest of the state machine. The `<Machine/>` component can only ever have one child active at a time.

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
        <td><code>history</code>*</td>
        <td><code>Object</code></td>
        <td></td>
        <td><code>History</code> package instance that will handle history navigation. This can be either <code>createBrowserHistory</code> or <code>createMemoryHistory</code>. Check out the [History package documentation](ttps://github.com/ReactTraining/history/blob/master/docs/api-reference.md).</td>
    </tr>
    <tr>
        <td><code>id</code>*</td>
        <td><code>String</code></td>
        <td></td>
        <td>Unique identifier for this machine. This must be different than all ancestors and siblings.</td>
    </tr>
    <tr>
        <td><code>logger</code>*</td>
        <td><code>Boolean</code></td>
        <td><code>false</code></td>
        <td>Enables console logging for easier debugging. Enabled for <code>transitions</code> and <code>history</code> changes.</td>
    </tr>
    <tr>
        <td><code>path</code></td>
        <td><code>String</code></td>
        <td></td>
        <td>The URL that the browser will resolve to upon entry of this machine. It is relative to all ancestor urls.</td>
    </tr>
</table>

## Reference
[SCXML W3C Specification - SCXML](https://www.w3.org/TR/scxml/#scxml)
>The top-level wrapper element, which carries version information. The actual state machine consists of its children. Note that only one of the children is active at any one time.