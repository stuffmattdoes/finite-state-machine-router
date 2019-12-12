import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import {
    deriveStateFromUrl,
    getChildStateNodes,
    getInitialChildStateNode,
    injectUrlParameters,
    normalizeChildStateProps,
    resolveInitialStack
} from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

export function Machine ({ children: machineChildren, history, id: machineId, path: machinePath }) {
    const [ event, setEvent ] = useState(null);

    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: machinePath });
    }

        // Resolve from URL -> input URL -> get stack -> resolve to initial atomic
    // Resolve from state -> input state ID -> get stack -> resolve to initial atomic

    const { childStates, initialStack, normalized, params } = useMemo(() => {
        let childStates = getChildStateNodes(machineChildren);
        let { pathname } = history.location;
        let initialStack = '#' + machineId + '.' + getInitialChildStateNode(childStates).props.id;
        const normalized = normalizeChildStateProps(childStates, machineId);
        const { params, path: currentPath, stack: currentStack } = deriveStateFromUrl(pathname, normalized, machineId);
        const { route, stack } = resolveInitialStack(currentStack, normalized);

        const initialRoute = injectUrlParameters(route, params);
        history.push(initialRoute);

        return {
            childStates,
            initialStack: stack || initialStack,
            normalized,
            params
        }
    }, [ machineChildren ]);

    const [ state, setState ] = useState(initialStack);

    function resolvePath(path) {
        const url = injectUrlParameters(path, params);

        if (url !== history.location.pathname) {
            console.log('resolvePath', history.location.pathname, 'to', url);
            history.push(url, { stack: state });
        }
    }

    function resolveState(stateId) {
        const stack = resolveInitialStack(
            normalized.find(norm => norm.id === stateId && norm.stack),
            normalized
        );
        console.log('resolveState', state, '->', stack);
        setState(stack);
    }

    function send(event, data = null) {
        console.log('send', event, data);
        setEvent({ name: event, ...data });
    }

    const providerValue = {
        current: state,
        history,
        id: machineId,
        params,
        resolveState,
        send
    }

    useEffect(() => history.listen((location, action) => {
        const { pathname } = location;
        const { params, path: currentPath, stack: currentStack } = deriveStateFromUrl(pathname, normalized, machineId);
        const { route, stack } = resolveInitialStack(currentStack, normalized);

        setState(stack);

        // TODO
        // Maybe this should happen in atomic state?
        resolvePath(route);
    }));
    
    // useEffect(() => {
    //     console.log('useEffect', state);
    // });
    
    console.log('render');

    return <MachineContext.Provider value={providerValue}>
        {childStates}
    </MachineContext.Provider>;
}
