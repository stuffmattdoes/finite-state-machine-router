/*
    TODO
    Derive stack path from URL with dynamic parameter
*/

import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
// import { log } from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

export function Machine ({ children: machineChildren, history, id: machineId, path: machinePath }) {
    const [ state, setState ] = useState({ current: `#${machineId}` });

    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: machinePath });
    }

    function matchUrlToPath(url, routeMap) {
        if (routeMap[url]) {
            return url;
        }

        const dynamicPaths = Object.keys(routeMap).filter(route => route.match(/\/:/g));

        if (dynamicPaths.length) {
            console.log(dynamicPaths);
        }
    }
    function resolveStack(stack) {
        console.log('resolveStack', stack);
        setState({ ...state, current: stack });
    }
    function resolvePath(path) {
        if (path !== history.location.pathname) {
            console.log('resolvePath', history.location.pathname, 'to', path);
            history.push(path, { stack: state.current });
        }
    }
    function transition(event, target) {
        console.log('transition', event, target);
        setState({ ...state, current: target })
    }

    // useEffect(() => history.listen((location, action) => {
    //     // console.log('history listen', location, action);
    //     // const nextPath = routeMap[location.pathname] || routeMap['*'] || null;
    //     const nextPath = matchUrlToPath(location.pathname);

    //     if (nextPath) {
    //         resolveStack(`#${machineId}${nextPath}`);
    //     } else {
    //         console.log(routeMap);
    //     }
    // }));

    function generateRouteMap({ states, parentPath, parentStack }) {
        return states.reduce((acc, child, i) => {
            const { children, id, path } = child.props;
            const grandChildStates = React.Children.toArray(children).filter(c => c.type.name === 'State');
            const stackPath = parentPath ? parentPath + path : path;
            const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;

            if (path) {
                acc[stackPath] = stack;
            }
            if (grandChildStates.length) {
                acc = { ...acc, ...generateRouteMap({
                    states: grandChildStates,
                    parentPath: stackPath,
                    parentStack: stack }) }
            }

            return acc;
        }, {});
    }

    // Determine initial child StateNode (if undefined, which is likely)
    const newChildren = useMemo(() => {
        let childStates = React.Children.toArray(machineChildren).filter(c => c.type.name === 'State');
        const initialChild = childStates.find(c => c.props.initial) || childStates[0];
        const routeMap = generateRouteMap({ states: childStates });
        const { pathname: url } = history.location;

        // Derive state from URL
        if (url.slice(1)) {
            // if (routeMap.hasOwnProperty(url)) {
            if (matchUrlToPath(url, routeMap)) {
                resolveStack(`#${machineId}${routeMap[url]}`);
            } else {
                // Resolve to 404
                resolveStack(`#${machineId}.*`);
                // console.error(`Route ${url} was not found!`);
            }
        } else {
            // Resolve to default URL
            resolveStack(`#${machineId}.${initialChild.props.id}`);
        }

        return childStates;
    }, [ machineChildren ]);

    const providerValue = {
        ...state,
        current: state.current,
        history,
        id: machineId,
        // match: {
        //     exact: false,
        //     params: {},
        //     path: '/path',
        //     url: '/path'
        // },
        resolvePath,
        resolveStack,
        transition
    }

    return <MachineContext.Provider value={providerValue}>
        {newChildren}
    </MachineContext.Provider>;
}
