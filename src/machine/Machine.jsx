/*
    TODO
    Derive stack path from URL with dynamic parameter

    1. Generate route map - Parse children state nodes, find 'path' property
    2. Parse URL and find a match in the route map
        - If exact match, return corresponding state
        - If inexact match, determine if dynamic
        - Otherwise, return 404
    3. If attemtping to resolve to a dynamic path without proper url param meta, throw error

*/

import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import { isDynamic, isRootSemgent, /* logger, */ segmentize } from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

export function Machine ({ children: machineChildren, history, id: machineId, path: machinePath }) {
    const [ state, setState ] = useState({
        current: `#${machineId}`,
        _event: null
    });

    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: machinePath });
    }

    function deriveStateFromUrl(url) {
        let match = {
            params: {},
            path: url,
            stack: routeMap[url]
        }

        // 1. Exact match, no dynamic URL needed
        if (match.stack) {
            return match;
        }

        // 2. No exact match, check for dynamic URL match
        const dynamicPaths = Object.keys(routeMap).filter(route => route.match(/\/:/g));

        if (dynamicPaths.length) {
            // 2.1 Split url && route map into arrays, compare 1 by 1
            const urlSegments = segmentize(url);
            let params;
            const path = dynamicPaths.find(p => {
                const pathSegments = segmentize(p);
                params = {};

                if (pathSegments.length !== urlSegments.length) {
                    return false;
                }

                // 2.2 infer parameter from URL from first segment array that matches in length
                return !pathSegments.map((pathSegment, i) => {
                    if (isDynamic(pathSegment)) {
                        params[pathSegment.slice(1)] = urlSegments[i];
                        return true;
                    } else if (pathSegment === urlSegments[i]) {
                        return true;
                    }

                    return false;
                }).includes(false);
            });

            return {
                params,
                path,
                stack: routeMap[path]
            }
        } else {
            return null;
        }
    }
    function injectUrlParameters(path, params) {
        const url = segmentize(path).map(seg => {
            if (isDynamic(seg)) {
                const segParam = seg.replace(':', '');

                if (Object.keys(params).includes(segParam)) {
                    return params[segParam];
                }

                // throw error
                console.error(`Cannot push to a dynamic URL without supplying the proper parameters: ${seg} url segment is missing.`);
            }

            return seg;
        });

        return '/' + url.join('/');
    }
    function resolveStack(stack) {
        // console.log('resolveStack', stack);
        setState({ ...state, _event: null, current: stack });
    }
    function resolveState(stateId) {
        const stack = stacks.find(s =>  s.split('.').pop() === stateId);
        resolveStack(stack);
    }
    function resolvePath(path, params) {
        const url = injectUrlParameters(path, params);

        if (url !== history.location.pathname) {
            // console.log('resolvePath', history.location.pathname, 'to', url);
            history.push(url, { stack: state.current });
        }
    }
    function send(event, data = null) {
        console.log('send', event, data);
        setState({ ...state, _event: { name: event, ...data } });
    }

    useEffect(() => history.listen((location, action) => {
        const { params, path, stack } = deriveStateFromUrl(location.pathname);

        if (stack) {
            resolveStack(stack);
        }
    }));

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

    // Determine initial child StateNode (if undefined, which is likely)
    const { childStates, routeMap, stacks } = useMemo(() => {
        let childStates = React.Children.toArray(machineChildren).filter(c => c.type.name === 'State');
        const { routeMap, stacks } = generateStackMaps(childStates);

        return {
            childStates,
            routeMap,
            stacks
        };
    }, [ machineChildren ]);

    const routeParams = useMemo(() => {
        const initialChild = childStates.find(c => c.props.initial) || childStates[0];
        const { pathname: url } = history.location;
        let routeParams = {};

        // Derive state from URL
        if (!isRootSemgent(url)) {
            const match = deriveStateFromUrl(url);
            const { params, path, stack } = match;

            if (match) {
                resolveStack(stack);
            } else {
                // Resolve to 404
                resolveStack(`#${machineId}.*`);
                // console.error(`Route ${url} was not found!`);
            }

            routeParams = params;
        } else {
            // Resolve to default URL
            resolveStack(`#${machineId}.${initialChild.props.id}`);
        }

        return routeParams;
    }, [ machineChildren ]);

    const providerValue = {
        ...state,
        current: state.current,
        _event: state._event,
        history,
        id: machineId,
        params: routeParams,
        resolvePath,
        resolveStack,
        resolveState,
        send
    }

    return <MachineContext.Provider value={providerValue}>
        {childStates}
    </MachineContext.Provider>;
}
