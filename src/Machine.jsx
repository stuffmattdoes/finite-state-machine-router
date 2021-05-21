import React, { useContext, useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import useLogger from './logger';
import {
    getChildStateNodes,
    injectUrlParams,
    normalizeChildStateProps,
    resolveUrlToAtomic,
    getAtomic,
    selectTransition
} from './util';

export const MachineContext = React.createContext({});
MachineContext.displayName = 'Machine';

// TODO: ignore hash option - doesn't resolve if only URL hash changes
export const createMachine = (options) => (props) => Machine({ ...props, ...options });

export const useMachine = () => {
    const { current, history, id, params, send } = useContext(MachineContext);
    return [{ current, history, id, params }, send ];
}

function Machine ({ children: machineChildren, history: machineHistory, id: machineId = 'machine', ignoreHash = false, logging = false }) {
    const history = useMemo(() => machineHistory || createBrowserHistory(), []);

    const [ childStates, normalizedChildStates ] = useMemo(() => {
        const _childStates = getChildStateNodes(React.Children.toArray(machineChildren));

        if (_childStates.length === 0) {
            throw new Error('<Machine/> has no children <State/> nodes! At least one is required to be considered a valid state machine.');
        }

        const _normalizedChildStates = normalizeChildStateProps(_childStates, machineId);
        
        return [ _childStates, _normalizedChildStates ];
    }, [ machineChildren ]);

    const [ initialStack, params ] = useMemo(() => {
        const { params, path, stack, url } = resolveUrlToAtomic(history.location.pathname, normalizedChildStates, machineId);

        if (history.location.pathname !== url) {
            history.replace(url);
        }

        return [ stack, params ];
    }, []);

    const [ state, setState ] = useState({
        current: initialStack,
        location: history.location,
        params
    });
    const [ logs, log ] = useLogger(state, logging);

    const send = (event, data = null) => {
        const targetState = selectTransition(event, state.current, normalizedChildStates);

        if (targetState) {
            const params = data && data.params || state.params;
            const { event: transitionEvent, target: targetId } = targetState;
            const targetNode = normalizedChildStates.find(norm => norm.id === targetId);

            if (targetNode) {
                const { path, stack } = getAtomic(targetNode.stack, normalizedChildStates);
                const url = injectUrlParams(path, params);

                if (url !== history.location.pathname) {
                    history.push(url, { target: stack });
                } else {
                    setState((prevState) => ({ current: stack, location: history.location, params }));
                }

                log({
                    type: 'TRANSITION',
                    payload: {
                        event,
                        target: { params, location: history.location, state: stack }
                    }
                });
            } else {
                log({
                    type: 'NO_MATCHING_STATE',
                    payload: { 
                        event,
                        target: { params, state: targetId }
                    }
                });
            }
        } else {
            log({
                type: 'NO_MATCHING_TRANSITION',
                payload: { event }
            });
        }
    }

    useEffect(() => history.listen(({ action, location }) => {
        const { params, path, stack, url } = resolveUrlToAtomic(location.pathname, normalizedChildStates, machineId);
        let target = stack;

        if (ignoreHash && state.location.hash !== location.hash) {
            setState((prevState) => ({ ...state, location: history.location, params }));
            return;
        }

        // TODO - check to see if URL update changes lineage, or if is exact match. If so, update stack
        // Could compare match.isExact also

        if (location.state && location.state.target) {
            target = location.state.target;
        } 

        if (action === 'POP' || (!location.state || !location.state.target)) {
            log({
                type: `HISTORY_${action}`,
                payload: {
                    target: { target, params, location: history.location, state: stack }
                }
            });
        }

        setState((prevState) => ({ current: target, location: history.location, params }));
    }));

    const providerValue = {
        ...state,
        history,
        id: machineId,
        send
    };

    return <MachineContext.Provider value={providerValue}>
        {childStates}
    </MachineContext.Provider>;
}

Machine.displayName = 'Machine';

export default Machine;
