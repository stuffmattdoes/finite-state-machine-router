import React, { useContext, useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import {
    getChildStateNodes,
    // getInitialChildStateNode,
    injectUrlParams,
    normalizeChildStateProps,
    resolveUrlToAtomic,
    getAtomic,
    selectTransition
} from './util';
import { logger } from './logger';

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
        const { params, path, stack, url } = resolveUrlToAtomic(history.location.pathname, normalized, machineId);

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

                logging && logger({
                    action: 'TRANSITION',
                    data,
                    event,
                    source: {
                        state: state.current,
                        path: state.path
                    },
                    target: {
                        state: stack,
                        path
                    }
                });

                setState({ current: stack, params, path });
                resolvePath(path, params, state.current, stack);
            } else {
                // console.error(`Invalid transition target: No target State Node of id "${targetId}" exists. event ${event} will be discarded.`);
                logging && logger({
                    action: 'EVENT_DISCARDED',
                    data,
                    event,
                    reason: 'NO_MATCHING_STATE',
                    source: {
                        state: state.current,
                        path: state.path
                    },
                    target: {
                        state: targetId   
                    }
                });
            }
        } else {
            logging && logger({
                action: 'EVENT_DISCARDED',
                data,
                event,
                reason: 'NO_MATCHING_TRANSITION',
                source: {
                    state: state.current,
                    path: state.path
                },
            });
        }
    }

    useEffect(() => history.listen(({ action, location }) => {
        if ((!location.state || !location.state.target) || action === 'POP') {
            const { params, path, stack, url } = resolveUrlToAtomic(location.pathname, normalized, machineId);

            logging && logger({
                action: 'HISTORY_CHANGE',
                data: location.pathname,
                source: {
                    state: state.current,
                    path: state.path
                },
                target: {
                    state: stack,
                    path
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
