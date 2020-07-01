import React, { useContext, useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import {
    getChildStateNodes,
    getInitialChildStateNode,
    injectUrlParams,
    normalizeChildStateProps,
    resolveSeedToAtomic,
    getAtomic,
    selectTransition
} from './util';

export const MachineContext = React.createContext({});
MachineContext.displayName = 'Machine';

// export const createMachine = (id, path) => (props) => Machine({ ...props, id, path });

export const useMachine = () => {
    const { current, history, id, params, send } = useContext(MachineContext);
    return [{ current, history, id, params }, send ];
}

function Machine ({ children: machineChildren, history: machineHistory, id: machineId, path: machinePath }) {
    const history = useMemo(() => machineHistory || createBrowserHistory({ basename: machinePath }));
    // const history = machineHistory || createBrowserHistory({ basename: machinePath });

    const [ childStates, normalized ] = useMemo(() => {
        const _childStates = getChildStateNodes(React.Children.toArray(machineChildren));

        if (_childStates.length === 0) {
            throw new Error('<Machine/> has no children <State/> nodes! At least one is required to be considered a valid state machine.');
        }

        const _normalized = normalizeChildStateProps(_childStates, machineId);

        return [ _childStates, _normalized ];
    }, [ machineChildren ]);

    const [ initialStack, params ] = useMemo(() => {
        let initialStack = '#' + machineId + '.' + getInitialChildStateNode(childStates).props.id;
        const { params, path, stack, url } = resolveSeedToAtomic(history.location.pathname, normalized, machineId);

        if (history.location.pathname !== url) {
            history.replace(url);
        }

        return [ stack || initialStack, params ];
    }, []);

    const [ state, setState ] = useState({
        current: initialStack,
        event: null,
        params
    });

    const resolvePath = (path) => {
        const url = injectUrlParams(path, state.params);

        if (url !== history.location.pathname) {
            history.push(url, {
                sourceState: state.current,
                // targetState: null,
                shouldgetAtomic: false
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

                // if (process.env.NODE_ENV === 'development') {
                    console.log('Machine Event Sent:', {
                        event: event,
                        data,
                        targetId,
                        path
                    });
                // }

                resolvePath(path);
                setState({ current: stack, event: event, params });
            } else {
                console.error(`Invalid transition target: No target State Node of id "${targetId}" exists. event ${event} will be discarded.`);
            }
        }
    }

    useEffect(() => {
        const unlisten = history.listen(({ action, location }) => {
            const { shouldgetAtomic } = location.state || true;
            const { params, path, stack, url } = resolveSeedToAtomic(location.pathname, normalized, machineId);

            if (shouldgetAtomic || action === 'POP') {
                // console.log('history listen', 1, action, location);
                setState({ current: stack, params });
            }
        });

        return () => {
            // console.log('unlisten');
            unlisten();
        }
    });

    // Alternative history listener?
    // useEffect(() => {
    //     const { action, location } = history;
    //     const { shouldgetAtomic } = location.state || true;
    //     const { params, path, stack, url } = resolveSeedToAtomic(location.pathname, normalized, machineId);

    //     console.log('history', action, location, state.current);

    //     if (shouldgetAtomic || action === 'POP') {
    //         setState({ current: stack, params });
    //     }
    // }, [ history.location.pathname ]);

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

export const createMachine = (props) => Machine(props);
export default Machine;
