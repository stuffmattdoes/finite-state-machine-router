# <Transition/>
`<Transition/>` component denotes the rules by which our state machine will allow changing of state. `<Transition/>` is a renderless component.

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
        <td><code>event</code>*</td>
        <td><code>String</code></td>
        <td></td>
        <td>The machine event that will activate this `transition`.</td>
    </tr>
    <tr>
        <td><code>target</code></td>
        <td><code>String</code></td>
        <td></td>
        <td>The target `<State/>` to transition into when active. This corresponds with the `<State/>` component's `id` property.</td>
    </tr>
</table>

## Reference
[SCXML W3C Specification - SCXML](https://www.w3.org/TR/scxml/#transition)
>Transitions between states are triggered by events and conditionalized via guard conditions. They may contain executable content, which is executed when the transition is taken.
