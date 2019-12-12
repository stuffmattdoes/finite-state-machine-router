import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import {
    deriveStateFromUrl,
    getChildStateNodes,
    getInitialChildStateNode,
    injectUrlParameters,
    normalizeChildStateProps,
    resolveInitialStack,
    selectTransition
} from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

export function Machine ({ children: machineChildren, history, id: machineId, path: machinePath }) {
    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: machinePath });
    }

    // Resolve from URL -> input URL -> get stack -> resolve to initial atomic
    // Resolve from state -> input state ID -> get stack -> resolve to initial atomic

    const { childStates, normalized } = useMemo(() => {
        let childStates = getChildStateNodes(machineChildren);
        const normalized = normalizeChildStateProps(childStates, machineId);

        return {
            childStates,
            normalized,
        }
    }, [ machineChildren ]);

    const { initialStack, params } = useMemo(() => {        
        let initialStack = '#' + machineId + '.' + getInitialChildStateNode(childStates).props.id;
        let { pathname } = history.location;
        const { params, path: currentPath, stack: currentStack } = deriveStateFromUrl(pathname, normalized, machineId);
        const { route, stack } = resolveInitialStack(currentStack, normalized);
        const initialRoute = injectUrlParameters(route, params);
        // history.push(initialRoute);

        return {
            initialStack: stack || initialStack,
            params
        }
    }, [ ]);

    const [ state, setState ] = useState(initialStack);

    function resolvePath(path) {
        console.log('resolvePath', path);
        const url = injectUrlParameters(path, params);

        if (url !== history.location.pathname) {
            // console.log('resolvePath', history.location.pathname, 'to', url);
            history.push(url, { stack: state });
        }
    }

    function resolveState(stateId) {
        const { route, stack } = resolveInitialStack(
            normalized.find(norm => norm.id === stateId).stack,
            normalized
        );
        // console.log('resolveState', state, '->', stack);
        setState(stack);
    }

    function send(event, data = null) {
        const targetState = selectTransition(event, state, normalized);

        if (targetState) {
            const { cond, event: transitionEvent, target } = targetState;
            console.log('send', event, data, target);
            resolveState(target);
        }
    }

    useEffect(() => history.listen((location, action) => {
        const { pathname } = location;
        const { params, path: currentPath, stack: currentStack } = deriveStateFromUrl(pathname, normalized, machineId);
        const { route, stack } = resolveInitialStack(currentStack, normalized);

        if (stack !== state) {
            setState(stack);
        }

        resolvePath(route);
    }));

    // useEffect(() => {
    //     console.log('useEffect', state);
    // });
    
    // console.log('render', machineId);

    const providerValue = {
        current: state,
        // event,
        history,
        id: machineId,
        params,
        resolvePath,
        // resolveState,
        send
    }

    return <MachineContext.Provider value={providerValue}>
        {childStates}
    </MachineContext.Provider>;
}
