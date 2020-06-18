# `<Link/>`
`<Link/>` component is a state machine replacement for the traditional `<a/>` anchor tag. Instead of the traditional `replace` behavior, `<Link/>` will `push` URLs by default and not cause page reloads.

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
        <td><code>className</code>*</td>
        <td><code>String</code></td>
        <td></td>
        <td>Class to be applied to this component in the DOM.</td>
    </tr>
    <tr>
        <td><code>disabled</code></td>
        <td><code>Boolean</code></td>
        <td>false</td>
        <td>When disabled, the `<Link/>` does not respond to click events, and will not make any URL pushes.</td>
    </tr>
    <tr>
        <td><code>event</code></td>
        <td><code>string</code></td>
        <td></td>
        <td>The machine event that the `<Link/>` will emit when clicked. If `event` and `href` are both present, the `event` will take precedence and ignore the `href`, causing no URL push.</td>
    </tr>
    <tr>
        <td><code>href</code></td>
        <td><code>string</code></td>
        <td></td>
        <td>The URL that the `<Link/>` will push when clicked. If `href` and `event` are both present, the `event` will take precedence and ignore the `href`, causing no URL push.</td>
    </tr>
    <tr>
        <td><code>onClick</code></td>
        <td><code>function</code></td>
        <td></td>
        <td>callback function for when the `<Link/>` is clicked.</td>
    </tr>
    <tr>
        <td><code>replace</code></td>
        <td><code>boolean</code></td>
        <td>`false`</td>
        <td>If `true`, `<Link/>` will resort to the default `<a/>` anchor tag click behavior, replacing the URL and causing a page reload.</td>
    </tr>
</table>
