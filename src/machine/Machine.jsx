import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import {
    deriveStateFromUrl, getChildStateNodes,
    getInitialChildStateNode, isRootSemgent,
    normalizeChildStateProps, resolveInitial
} from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

export function Machine ({ children: machineChildren, history, id: machineId, path: machinePath }) {
    const [ event, setEvent ] = useState(null);

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

    const { childStates, initialStack, params, stacks } = useMemo(() => {
        let childStates = getChildStateNodes(machineChildren);
        let initialStack = '#' + machineId + '.' + getInitialChildStateNode(childStates).props.id;
        const normalized = normalizeChildStateProps(childStates, machineId);
        const { pathname } = history.location;
        let urlParams = {};

        //  // Derive state from URL
        if (!isRootSemgent(pathname)) {
            const { params, route, stack } = deriveStateFromUrl(pathname, normalized);
            urlParams = params;

            if (stack) {
                initialStack = stack;
            } else {
                // Resolve to 404
                initialStack = `#${machineId}.*`;
            }
        } else {
            const { route, stack } = resolveInitial(initialStack, normalized);
            // resolvePath(route);
            initialStack = stack;
        }

        return {
            childStates,
            initialStack,
            params: urlParams
        }
    }, [ machineChildren ]);

    const [ state, setState ] = useState(initialStack);
    const providerValue = {
        current: state,
        history,
        id: machineId,
        params,
        resolveState,
        send
    }

    useEffect(() => history.listen((location, action) => {
        console.log('history change');
        // const { params, route, stack } = deriveStateFromUrl(location.pathname, normalized);

        // if (stack) {
        //     resolveByStack(stack);
        // }
    }));

    // useEffect(() => {
    //     console.log('useEffect', state);
    // });

    console.log('render');

    return <MachineContext.Provider value={providerValue}>
        {childStates}
    </MachineContext.Provider>;
}
