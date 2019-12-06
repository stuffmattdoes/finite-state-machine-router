import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import { deriveStateFromUrl, normalizeChildStates, getChildStateNodes, generateStackMaps, isRootSemgent } from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

export function Machine ({ children: machineChildren, history, id: machineId, path: machinePath }) {
    const [ event, setEvent ] = useState(null);
    // const [ state, setState ] = useState(`#${machineId}`);

    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: machinePath });
    }

    // function resolvePath(path) {
    //     const url = injectUrlParameters(path, urlParams);

    //     if (url !== history.location.pathname) {
    //         console.log('resolvePath', history.location.pathname, 'to', url);
    //         history.push(url, { stack: state });
    //     }
    // }

    function resolveState(stateId) {
        const stack = stacks.find(s => s.split('.').pop() === stateId);
        console.log('resolveState', state, '->', stack);
        setState(stack);
    }

    function send(event, data = null) {
        console.log('send', event, data);
        setEvent({ name: event, ...data });
    }

    const { childStates, initialStack, routes, stacks } = useMemo(() => {
        let childStates = getChildStateNodes(machineChildren);
        // const initialChild = childStates.find(c => c.props.initial) || childStates[0];
        const { routes, stacks } = generateStackMaps(childStates, machineId, machinePath);
        // const { pathname: url } = history.location;
        // let initialStack;

        //  // Derive state from URL
        // if (!isRootSemgent(url)) {
        //     const { params, path, stack } = deriveStateFromUrl(url, routes);
        //     // urlParams = params;

        //     if (stack) {
        //         initialStack = stack;
        //     } else {
        //         // Resolve to 404
        //         initialStack = `#${machineId}.*`;
        //     }
        // } else {
        //     // Resolve to default URL
        //     initialStack = `#${machineId}.${initialChild.props.id}`;
        // }

        return {
            childStates,
            // initialStack,
            routes,
            stacks
        }
    }, [ machineChildren ]);

    console.log(stacks, routes);

    const [ state, setState ] = useState(`#${machineId}.${initialStack}`);

    const providerValue = {
        current: state,
        history,
        id: machineId,
        resolveState,
        send
    }

    // console.log('render', state);

    // useEffect(() => {
    //     console.log('useEffect', state);
    // });

    return <MachineContext.Provider value={providerValue}>
        {childStates}
    </MachineContext.Provider>;
}
