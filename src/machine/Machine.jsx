import React, { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import { getChildStateNodes, generateStackMaps } from './util';

export const MachineContext = React.createContext();
MachineContext.displayName = 'Machine';

export function Machine ({ children: machineChildren, history, id: machineId, path: machinePath }) {
    const [ state, setState ] = useState({
        _event: null,
        current: `#${machineId}`
    });

    // Default history
    if (!history) {
        history = createBrowserHistory({ basename: machinePath });
    }

    // function resolvePath(path) {
    //     const url = injectUrlParameters(path, urlParams);

    //     if (url !== history.location.pathname) {
    //         console.log('resolvePath', history.location.pathname, 'to', url);
    //         history.push(url, { stack: state.current });
    //     }
    // }

    function resolveState(stateId) {
        const stack = stacks.find(s => s.split('.').pop() === stateId);
        console.log('resolveState', state.current, '->', stack);
        setState({ ...state, current: stack });
    }

    function send(event, data = null) {
        console.log('semd', event, data);
        setState({ ...state, _event: { name: event, ...data } });
    }

    const { childStates, routes, stacks } = useMemo(() => {
        let childStates = getChildStateNodes(machineChildren);
        const { routes, stacks } = generateStackMaps(childStates, machineId);

        return {
            childStates,
            // routes,
            stacks
        }
    }, [ machineChildren ]);

    useMemo(() => {
        const initialChild = childStates.find(c => c.props.initial) || childStates[0];
        resolveState(initialChild.props.id);
    }, []);

    const providerValue = {
        current: state.current,
        history,
        id: machineId,
        resolveState,
        send
    }

    return <MachineContext.Provider value={providerValue}>
        {childStates}
    </MachineContext.Provider>;
}
