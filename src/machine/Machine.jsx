import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import { log } from './util';

export const StateMachineContext = React.createContext();
StateMachineContext.displayName = 'Machine';

export function Machine ({ children, history, id, url }) {
    const [ state, setState ] = useState({
        current: `#${id}`,
        id
    });

    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: url });
    }

    // Determine initial child StateNode (if undefined, which is likely)
    const _children = useMemo(() => {
        let _childStates = React.Children.toArray(children).filter(c => c.type.name === 'State');
        const _hasInitialChild = _childStates.filter(c => c.props.initial).length > 0;

        if (!_hasInitialChild) {
            _childStates[0] = React.cloneElement(_childStates[0], {
                ..._childStates[0].props,
                initial: true
            });
        }

        return _childStates;
    }, [ children ]);

    useEffect(() => history.listen(console.log), []);
    
    const matches = (stateId) => state.current.split('.').includes(stateId);
    const resolveStack = (stack) => {
        console.log('resolveStack', stack);
        setState({ ...state, current: `#${id}.${stack}` });
    }
    const resolveUrl = (url) => {
        console.log('resolveUrl', url);
        history.push(url, { state: state.current });
    }
    const transition = (event, target) => {
        console.log('transition', event, target);
        // log(state, event, target);
        setState({ ...state, current: `#${id}.${target}` })
    }

    const providerValue = {
        ...state,
        history,
        matches,
        resolveStack,
        resolveUrl,
        transition
    }
    
    return <StateMachineContext.Provider value={providerValue}>
        {_children}
    </StateMachineContext.Provider>;
}

