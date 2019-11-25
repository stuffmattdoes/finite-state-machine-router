/*
    TODO
    Derive stack path from URL with dynamic parameter

    1. Generate route map - Parse children state nodes, find 'path' property
    2. Parse URL and find a match in the route map
        - If exact match, return corresponding state
        - If inexact match, determine if dynamic
        - Otherwise, return 404

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
        // Exact match, no dynamic URL found
        if (match.stack) {
            return match;
        }

        // No exact match, check for dynamic URL match
        const dynamicPaths = Object.keys(routeMap).filter(route => route.match(/\/:/g));

        if (dynamicPaths.length) {
            // Split url into arrays of paths
            const urlSegments = segmentize(url);
            let params;
            const path = dynamicPaths.find(p => {
                const pathSegments = segmentize(p);
                params = {};
                
                if (pathSegments.length !== urlSegments.length) {
                    return false;
                }

                return !pathSegments.map((pathSegment, i) => {
                    if (isDynamic(pathSegment)) {
                        params[pathSegment.slice(1)] = urlSegments[i];
                        return true;
                    } else if (pathSegment === pathSegment[i]) {
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
    function resolveStack(stack) {
        // console.log('resolveStack', stack);
        setState({ ...state, current: stack });
    }
    function resolvePath(path) {
        if (path !== history.location.pathname) {
            // console.log('resolvePath', history.location.pathname, 'to', path);
            history.push(path, { stack: state.current });
        }
    }
    function transition(event, target) {
        // console.log('transition', event, target);
        setState({ ...state, current: target })
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
        // let params;

        // Derive state from URL
        if (!isRootSemgent(url)) {
            const match = deriveStateFromUrl(url);
            const { params, path, stack } = match;
            console.log(match);

            if (stack) {
                resolveStack(`#${machineId}${stack}`);
            } else {
                // Resolve to 404
                resolveStack(`#${machineId}.*`);
                // console.error(`Route ${url} was not found!`);
            }
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
        // params: routeParams,
        resolvePath,
        resolveStack,
        transition
    }

    return <MachineContext.Provider value={providerValue}>
        {newChildren}
    </MachineContext.Provider>;
}
