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
// import { log } from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

const paramRegExp = /^:(.+)/;
const isDynamic = segment => paramRegExp.test(segment);
const isRootSemgent = url => url.slice(1) === '';
const segmentize = url => url.replace(/(^\/+|\/+$)/g, '').split('/');

export function Machine ({ children: machineChildren, history, id: machineId, path: machinePath }) {
    const [ state, setState ] = useState({ current: `#${machineId}` });

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
            // console.log(url, urlSegments);
            let params;
            const path = dynamicPaths.find(p => {
                const pathSegments = segmentize(p);
                params = {};

                if (pathSegments.length !== urlSegments.length) {
                    return false;
                }

                // 2.2 infer parameter from URL from first path that matches in length
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
        console.log('resolveStack', stack);
        setState({ ...state, current: stack });
    }
    function resolvePath(path, params) {
        const url = injectUrlParameters(path, params);
        console.log(url, history.location.pathname);

        if (url !== history.location.pathname) {
            console.log('resolvePath', history.location.pathname, 'to', url);
            history.push(url, { stack: state.current });
        }
    }
    function send(event, meta) {
        console.log(event, meta);
        setState({ ...state, current: meta.target, _event: { event, meta } });
    }

    // useEffect(() => history.listen((location, action) => {
    //     // console.log('history listen', location, action);
    //     // const nextStack = routeMap[location.pathname] || routeMap['*'] || null;
    //     const { stack: nextStack } = deriveStateFromUrl(location.pathname);

    //     if (nextStack) {
    //         resolveStack(`#${machineId}${nextStack}`);
    //     } else {
    //         console.log(routeMap);
    //     }
    // }));

    function generateRouteMap(states, parentPath, parentStack) {
        return states.reduce((acc, child, i) => {
            const { children, id, path } = child.props;
            const grandChildStates = React.Children.toArray(children).filter(c => c.type.name === 'State');
            const stackPath = parentPath ? parentPath + path : path;
            const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;

            if (path) {
                acc[stackPath] = stack;
            }
            if (grandChildStates.length) {
                acc = { ...acc, ...generateRouteMap(grandChildStates, stackPath, stack) }
            }

            return acc;
        }, {});
    }
    
    // Determine initial child StateNode (if undefined, which is likely)
    const { newChildren, routeMap } = useMemo(() => {
        let childStates = React.Children.toArray(machineChildren).filter(c => c.type.name === 'State');

        return {
            newChildren: childStates,
            routeMap: generateRouteMap(childStates)
        };
    }, [ machineChildren ]);

    const routeParams = useMemo(() => {
        const initialChild = newChildren.find(c => c.props.initial) || newChildren[0];
        const { pathname: url } = history.location;

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

            return params;
        } else {
            // Resolve to default URL
            resolveStack(`#${machineId}.${initialChild.props.id}`);
        }

        // return params;
    }, [ machineChildren ]);

    const providerValue = {
        ...state,
        current: state.current,
        history,
        id: machineId,
        params: routeParams,
        resolvePath,
        resolveStack,
        send
    }

    return <MachineContext.Provider value={providerValue}>
        {newChildren}
    </MachineContext.Provider>;
}
