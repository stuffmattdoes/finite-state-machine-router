import React, { useContext, useEffect, useMemo, useState, useReducer } from 'react';
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

export const createMachine = (options) => (props) => Machine({ ...props, ...options });

export const useMachine = () => {
    const { current, history, id, params, send } = useContext(MachineContext);
    return [{ current, history, id, params }, send ];
}

function Machine ({ children: machineChildren, history: machineHistory, id: machineId = 'machine', logging = false, path: machinePath }) {
    const history = useMemo(() => machineHistory || createBrowserHistory({ basename: machinePath }), []);

    const [ childStates, normalized ] = useMemo(() => {
        const _childStates = getChildStateNodes(React.Children.toArray(machineChildren));

        if (_childStates.length === 0) {
            throw new Error('<Machine/> has no children <State/> nodes! At least one is required to be considered a valid state machine.');
        }

        const _normalized = normalizeChildStateProps(_childStates, machineId);

        return [ _childStates, _normalized ];
    }, [ machineChildren ]);

    const [ initialStack, params, path ] = useMemo(() => {
        const { exact, params, path, stack, url } = resolveUrlToAtomic(history.location.pathname, normalized, machineId);

        if (history.location.pathname !== url) {
            history.replace(url);
        }

        return [ stack, params, path ];
    }, []);

    const [ state, setState ] = useState({
        current: initialStack,
        params,
        path
    });
    const [ logs, log ] = useLogger(state, logging);

    const resolvePath = (path, params, source, target) => {
        const url = injectUrlParams(path, params);

        if (url !== history.location.pathname) {
            history.push(url, {
                source,
                target
            });
        }
    }

    const send = (event, data = null) => {
        const targetState = selectTransition(event, state.current, normalized);

        if (targetState) {
            const params = data && data.params || state.params;
            const { cond, event: transitionEvent, target: targetId } = targetState;
            const targetNode = normalized.find(norm => norm.id === targetId);

            if (targetNode) {
                const { path, stack } = getAtomic(targetNode.stack, normalized);

                logging && log({
                    type: 'TRANSITION',
                    payload: {
                        event,
                        target: { params, path, state: stack }
                    }
                });
                setState({ current: stack, params, path });
                resolvePath(path, params, state.current, stack);
            } else {
                logging && log({
                    type: 'NO_MATCHING_STATE',
                    payload: { 
                        event,
                        target: { params, state: targetId }
                    }
                });
            }
        } else {
            logging && log({
                type: 'NO_MATCHING_TRANSITION',
                payload: { event }
            });
        }
    }

    useEffect(() => history.listen(({ action, location }) => {
        if ((!location.state || !location.state.target) || action === 'POP') {
            const { exact, params, path, stack, url } = resolveUrlToAtomic(location.pathname, normalized, machineId);

            logging && log({
                type: `HISTORY_${action}`,
                payload: {
                    target: { exact, params, path, state: stack }
                }
            });
            setState({ current: stack, params, path });
        }
    }), [ history.location.pathname ]);

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

// export const createMachine = (props) => Machine(props);
export default Machine;
