import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
// import { log } from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

export function Machine ({ children, history, id, path }) {
    const [ state, setState ] = useState({ current: `#${id}` });

    // Default history
    // useMemo(() => {
        if (!history) {
            // console.log('history');
            history = createBrowserHistory({ basename: path });
        }
    // }, []);
    
    // const isExact = (stateId) => state.current === stateId;
    const matches = (stateId) => {
        // console.log('matches', stateId, state.current);
        return state.current.split('.').includes(stateId);
    }
    const resolveStack = (stack) => {
        // console.log('resolveStack', stack);
        setState({ ...state, current: stack });
    }
    const resolvePath = (path) => {
        if (path !== history.location.pathname) {
            // console.log('resolvePath', history.location.pathname, 'to', path);
            history.push(path, { stack: state.current });
        }
    }
    const transition = (event, target) => {
        // console.log('transition', event, target);
        // log(state, event, target);
        setState({ ...state, current: target })
    }

    useEffect(() => history.listen((location, action) => {
        // console.log('history listen', location, action);
        resolveStack(`#${id}${_routeMap[location.pathname]}`);
    }));

    const routeMap = (childStates, parentPath, parentStack) => {
        return childStates.reduce((acc, { props }, i) => {
            const { children, id, path } = props;
            const _childStates = React.Children.toArray(children).filter(c => c.type.name === 'State');
            const _url = parentPath ? parentPath + path : path;
            const _parentStack = parentStack ? `${parentStack}.${id}` : `.${id}`;
    
            if (path) {
                acc[_url] = _parentStack;
            }
            if (_childStates.length) {
                acc = { ...acc, ...routeMap(_childStates, _url, _parentStack) }
            }
    
            return acc;
        }, {});
    }

    // Determine initial child StateNode (if undefined, which is likely)
    const { _initialChild, _children, _routeMap } = useMemo(() => {
        let _childStates = React.Children.toArray(children).filter(c => c.type.name === 'State');
        const _initialChild = _childStates.find(c => c.props.initial) || _childStates[0];
        const _pathname = history.location.pathname;
        const _routeMap = routeMap(_childStates);

        // Derive state from URL
        if (_pathname.slice(1)) {
            if (_routeMap.hasOwnProperty(_pathname)) {
                resolveStack(`#${id}${_routeMap[_pathname]}`);
            } else {
                // TODO:
                // Resolve to 404
                console.error(`Route ${_pathname} was not found!`);
            }
        }

        return {
            _children: _childStates,
            _initialChild,
            _routeMap
        };
    }, [ children ]);

    const providerValue = {
        ...state,
        history,
        id,
        matches,
        resolvePath,
        resolveStack,
        transition
    }
    
    return <MachineContext.Provider value={providerValue}>
        {_children}
        {/* { children.filter(c => matches(c.props.id))} */}
    </MachineContext.Provider>;
}

