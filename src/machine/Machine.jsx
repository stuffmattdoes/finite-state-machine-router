import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import {
    getChildStateNodes,
    getInitialChildStateNode,
    injectUrlParams,
    normalizeChildStateProps,
    resolveInitial,
    resolveToAtomic,
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
        const childStates = getChildStateNodes(machineChildren);
        const normalized = normalizeChildStateProps(childStates, machineId);

        return {
            childStates,
            normalized
        }
    }, [ machineChildren ]);

    const { initialStack, params } = useMemo(() => {        
        let initialStack = '#' + machineId + '.' + getInitialChildStateNode(childStates).props.id;
        const { params, path, stack, url } = resolveInitial(history.location.pathname, normalized, machineId);

        return {
            initialStack: stack || initialStack,
            params
        }
    }, []);

    const [ state, setState ] = useState({
        current: initialStack,
        params
    });

    function resolvePath(path) {
        const url = injectUrlParams(path, state.params);

        if (url !== history.location.pathname) {
            // console.log('resolvePath', history.location.pathname, 'to', url);
            history.push(url, { stack: state.current });
        }
    }

    function send(event, data = null) {
        const targetState = selectTransition(event, state.current, normalized);

        if (targetState) {
            const params = data && data.params || state.params;
            const { cond, event: transitionEvent, target: stateId } = targetState;
            const { path, stack } = resolveToAtomic(
                normalized.find(norm => norm.id === stateId).stack,
                normalized
            );
                
            // console.log('send', event, data, stateId, path);
            setState({ current: stack, params });    
            // resolveState(target);
        }
    }

    useEffect(() => history.listen((location, action) => {
        const { params, path, stack, url } = resolveInitial(location.pathname, normalized, machineId);

        if (stack !== state.current) {
            setState({ current: stack, params });
        }
    }));

    const providerValue = {
        ...state,
        history,
        id: machineId,
        resolvePath,
        send
    }

    return <MachineContext.Provider value={providerValue}>
        {childStates}
    </MachineContext.Provider>;
}
