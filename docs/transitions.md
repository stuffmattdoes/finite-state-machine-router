A transition T is enabled by named event E in atomic state S if:
* T's source state is S or an ancestor of S
* AND T matches E's name (see 3.12.1 Event Descriptors)
* AND T lacks a 'cond' attribute or its 'cond' attribute evaluates to "true".

Example A:
<State id='S'> // dispatches event 'E'
    <Transition event='E' id='T' target='S2'/>
</State>

Example B:
<State id='S1'>
    <Transition event='E' id='T' target='S2'/>
    <State id='S'/> // dispatches event 'E'
</State>

A transition is enabled by NULL in atomic state S if:
* T lacks an 'event' attribute,
* AND T's source state is S or an ancestor of S
* AND T lacks an 'cond' attribute or its 'cond' attribute evaluates to "true".
* * (Note that such a transition can never be enabled by any named event.)

<State id='S'>  // Dispatch event NULL
    <Transition target='S2'/>
</State>

<State id='S1'>
    <State id='S'/> // dispatch event NULL
    <Transition target='S2'/>
</State>

Any state can transition to any other state. In the example below, suppose that `great-grand-child` dispatches event `e` targeting state `great-grand-child-2`. Even though the target state is not closely related to the source state, it can be transitioned to. This is due to every state node having a unique ID attribute.
<State id='app'>
    <State id='child'>
        <State id='grand-child'>
            <Transition event='e' target='great-grand-child-2'/>
            <State id='great-grand-child'/>     // Dispatches event 'e'
        </State>
    </State>
    <State id='child-2'>
        <State id='grand-child-2'>
            <State id='great-grand-child-2'/>
        </State>
    </State>
</State>