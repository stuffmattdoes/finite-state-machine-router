import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import { deriveStateFromUrl, getChildStateNodes, isRootSemgent, normalizeChildStates } from './util';

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

    // Resolve from URL -> input URL -> get stack -> resolve to initial atomic
    // Resolve from state -> input state ID -> get stack -> resolve to initial atomic

    const { childStates, initialStack, routes, stacks } = useMemo(() => {
        let childStates = getChildStateNodes(machineChildren);
        const normalized = normalizeChildStates(childStates, machineId, machinePath);
        const { pathname: url } = history.location;
        let initialStack;

        //  // Derive state from URL
        if (!isRootSemgent(url)) {
            const { params, route, stack } = deriveStateFromUrl(url, normalized);
            // urlParams = params;
            // console.log(params, route, stack);
            console.log(normalized);

            if (stack) {
                initialStack = stack;
            } else {
                // Resolve to 404
                initialStack = `#${machineId}.*`;
            }
        } else {
            // Resolve to default URL
            // initialStack = initialStack;
        }

        return {
            childStates,
            initialStack,
            // routes,
            // stacks
        }
    }, [ machineChildren ]);

    const [ state, setState ] = useState(initialStack);
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
