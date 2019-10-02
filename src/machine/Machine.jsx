import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import { log } from './util';

export const StateMachineContext = React.createContext();
StateMachineContext.displayName = 'Machine';

export function Machine ({ children, history, id, url }) {
    const [ state, setState ] = useState({ current: `#${id}` });

    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: url });
    }

    useEffect(() => history.listen(console.log), []);
    
    const matches = (stateId) => state.current.split('.').includes(stateId);
    const resolveStack = (stack) => {
        console.log('resolveStack', stack);
        setState({ ...state, current: `#${id}${stack}` });
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

    const routeMap = (childStates, parentUrl, parentStack) => {
        return childStates.reduce((acc, { props }, i) => {
            const { children, id, url } = props;
            const _childStates = React.Children.toArray(children).filter(c => c.type.name === 'State');
            const _fullUrl = parentUrl ? parentUrl + url : url;
            const _parentStack = parentStack ? `${parentStack}.${id}` : `.${id}`;
    
            if (url) {
                acc[_fullUrl] = _parentStack;
            }
            if (_childStates.length) {
                acc = { ...acc, ...routeMap(_childStates, _fullUrl, _parentStack) }
            }
    
            return acc;
        }, {});
    }

    // useEffect(() => {
    //     const nextUrl = Object.keys(_routeMap).find(key => state.current === '#' + id + _routeMap[key]);
    //     resolveUrl(nextUrl);
    // }, [ state.current ]);

    // Determine initial child StateNode (if undefined, which is likely)
    const { _children, _routeMap } = useMemo(() => {
        let _childStates = React.Children.toArray(children).filter(c => c.type.name === 'State');
        const _hasInitialChild = _childStates.filter(c => c.props.initial).length > 0;

        // 1. Derive state from URL
        const _pathname = history.location.pathname;
        const _routeMap = routeMap(_childStates);

        // 1. Derive state from URL
        if (_pathname.slice(1)) {
            if (_routeMap.hasOwnProperty(_pathname)) {
                resolveStack(_routeMap[_pathname]);
            } else {
                // TODO:
                // Resolve to 404
            }
        }
        // 2. Resolve initial children
        else {
            if (!_hasInitialChild) {
                _childStates[0] = React.cloneElement(_childStates[0], {
                    ..._childStates[0].props,
                    initial: true
                });
            }
        }

        return {
            _children: _childStates,
            _routeMap
        };
    }, [ children ]);

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

