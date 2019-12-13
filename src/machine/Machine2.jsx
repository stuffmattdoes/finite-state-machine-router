import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import { deriveStateFromUrl, injectUrlParams, isRootSemgent } from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

export function Machine ({ children: machineChildren, history, id: machineId, path: machinePath }) {
    const [ state, setState ] = useState({
        _event: null,
        current: `#${machineId}`
    });

    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: machinePath });
    }

    function resolveByStack(stack) {
        console.log('resolveByStack', stack);
        setState({ ...state, _event: null, current: stack });
    }

    function resolveByState(stateId) {
        // console.log('resolveByState', stateId);
        const stack = stacks.find(s =>  s.split('.').pop() === stateId);
        resolveByStack(stack);
    }

    function resolvePath(path) {
        const url = injectUrlParams(path, urlParams);

        if (url !== history.location.pathname) {
            console.log('resolvePath', history.location.pathname, 'to', url);
            history.push(url, { stack: state.current });
        }
    }

    function send(event, data = null) {
        // console.log('send', event, data);
        setState({ ...state, _event: { name: event, ...data } });
    }

    // For deriving effective state from URL
    function generateStackMaps(states, parentPath, parentStack) {
        return states.reduce((acc, child) => {
            const { children, id, path } = child.props;
            const grandChildStates = React.Children.toArray(children).filter(c => c.type.name === 'State');
            const stackPath = parentPath ? parentPath + path : path;
            const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;

            if (id) {
                if (acc.stacks.includes(id)) {
                    console.error(`State Machine already includes StateNode with an id of "${id}". All Id properties must be unique!`);
                } else {
                    acc.stacks.push(stack);
                }
            }
            if (path) {
                acc.routeMap[stackPath] = stack;
            }
            if (grandChildStates.length) {
                const nextAcc = generateStackMaps(grandChildStates, stackPath, stack);
                acc.routeMap = { ...acc.routeMap, ...nextAcc.routeMap };
                acc.stacks = [ ...acc.stacks, ...nextAcc.stacks ];
            }

            return acc;
        }, { routeMap: {}, stacks: [] });
    }

    const { childStates, urlParams, routeMap, stacks } = useMemo(() => {
        let childStates = React.Children.toArray(machineChildren).filter(c => c.type.name === 'State');
        const { routeMap, stacks } = generateStackMaps(childStates);
        const initialChild = childStates.find(c => c.props.initial) || childStates[0];
        const { pathname: url } = history.location;
        let urlParams = {};

        // Derive state from URL
        if (!isRootSemgent(url)) {
            const match = deriveStateFromUrl(url, routeMap);
            const { params, path, stack } = match;
            urlParams = params;

            if (match) {
                resolveByStack(stack);
            } else {
                // Resolve to 404
                resolveByStack(`#${machineId}.*`);
            }
        } else {
            // Resolve to default URL
            resolveByStack(`#${machineId}.${initialChild.props.id}`);
        }

        return {
            childStates,
            urlParams,
            routeMap,
            stacks
        };
    }, [ machineChildren ]);

    useEffect(() => history.listen((location, action) => {
        const { params, path, stack } = deriveStateFromUrl(location.pathname, routeMap);

        if (stack) {
            resolveByStack(stack);
        }
    }));

    const providerValue = {
        ...state,
        history,
        id: machineId,
        params: urlParams,
        resolvePath,
        resolveByStack,
        resolveByState,
        send
    }

    return <MachineContext.Provider value={providerValue}>
        {childStates}
    </MachineContext.Provider>;
}
