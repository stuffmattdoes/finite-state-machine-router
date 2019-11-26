A transition T is enabled by named event E in atomic state S if
    a) T's source state is S or an ancestor of S
    b) AND T matches E's name (see 3.12.1 Event Descriptors)
    c) AND T lacks a 'cond' attribute or its 'cond' attribute evaluates to "true".

<State id='s'>  // Dispatch event 'e'
    <Transition event='e' target='s2'/>
</State>;

<State id='s1'> // processes event 'e'
    <State id='s'/> // dispatch event 'e'
    <Transition event='e' target='s2'/>
</State>;

A transition is enabled by NULL in atomic state S if
    a) T lacks an 'event' attribute,
    b) AND T's source state is S or an ancestor of S
    c) AND T lacks an 'cond' attribute or its 'cond' attribute evaluates to "true". (Note that such a transition can never be enabled by any named event.)

<State id='s'>  // Dispatch NULL event
    <Transition target='s2'/>
</State>;

<State id='s1'> // processes event 'e'
    <State id='s'/> // dispatch event 'e'
    <Transition target='s2'/>
</State>;