import React, { useContext, useEffect, useMemo, useState } from 'react';
import { History, createBrowserHistory } from 'history';
import useLogger from './logger';
import {
    getAtomic,
    getChildStateNodes,
    injectUrlParams,
    normalizeChildStateProps,
    resolveUrlToAtomic,
    selectTransition,
    urlMatchesPathname
} from './util';

type MachineContextType = {
    current: string,
    history: History,
    id: string,
    params: { [name: string]: string },
    send: (event: string) => void
}

export const MachineContext = React.createContext<Partial<MachineContextType>>({});
MachineContext.displayName = 'Machine';

// TODO: ignore hash option - doesn't resolve if only URL hash changes
export const createMachine = (options: any) => (props: any) => Machine({ ...props, ...options });

export const useMachine = () => {
    const { current, history, id, params, send } = useContext(MachineContext);
    return [{ current, history, id, params }, send ];
}

type State = {
    current: string | null;
    location: Location;
    params: {
        [name: string]: string;
    };
}

type MachineProps = {
    history: History,
    id: string,
    ignoreHash: boolean,
    logging: boolean
}

const Machine: React.FC<MachineProps> = ({ children: machineChildren, history: machineHistory, id: machineId = 'machine', ignoreHash = false, logging = false }) => {
    const history = useMemo(() => machineHistory || createBrowserHistory(), []);

    const [ childStates, normalizedChildStates ] = useMemo(() => {
        const _childStates = getChildStateNodes(machineChildren as React.ReactElement);

        if (_childStates.length === 0) {
            throw new Error('<Machine/> has no children <State/> nodes! At least one is required to be considered a valid state machine.');
        }

        const _normalizedChildStates = normalizeChildStateProps(_childStates, machineId);
        
        return [ _childStates, _normalizedChildStates ];
    }, [ machineChildren ]);

    const [ initialStack, params ] = useMemo(() => {
        const { params, path, stack, url } = resolveUrlToAtomic(history.location.pathname, normalizedChildStates, machineId);
        
        // For mount
        if (urlMatchesPathname(history.location.pathname, url)) {
            history.replace(url);
        }

        return [ stack, params ];
    }, []);

    const [ state, setState ] = useState<State>({
        current: initialStack,
        location: history.location,
        params
    });
    const [ logs, log ] = useLogger(state, logging);

    const send = (event: string, data: any = null) => {
        const targetState = selectTransition(event, state.current!, normalizedChildStates);

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

    /*
        useMemo ensures history listener is invoked prior to render.
        This is vital to ensure any "send" events in child "useEffects" are captured
    */

    useEffect(() => history.listen(({ action, location }) => {
        const { params, path, stack, url } = resolveUrlToAtomic(location.pathname, normalizedChildStates, machineId);
        let target = stack;

        // After mount
        if (urlMatchesPathname(history.location.pathname, url)) {
            history.replace(url);
        }

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
