import React, { useContext } from 'react';
import { MachineContext } from './Machine';
import { isCurrentStack, isExactStack } from './util';

export const StateNodeContext = React.createContext({});
StateNodeContext.displayName = 'StateNode';

type StateProps = {
    component: React.ReactNode,
    id: string,
    initial: boolean,
    path: string
}

type ComponentProps = {
    children: React.ReactNode,
    history: any,
    machine: {
        current: string,
        send: (id: string) => void
    },
    match: {
        exact: boolean,
        params: { [key: string]: string },
        path?: string,
        url: string
    } | boolean
}

const State: React.FC<StateProps> = ({ children, component: Component, id, initial, path }) => {
    const { event: machineEvent, current, history, id: machineId, params, send: machineSend } = useContext(MachineContext);
    const { id: parentId, path: parentPath, stack: parentStack } = useContext(StateNodeContext);
    const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;
    const stackPath = path ? parentPath ? parentPath + path : path : parentPath;
    const match = isCurrentStack(id, current) ? {
        exact: isExactStack(id, current),
        params,
        path: stackPath,
        url: history.location.pathname
    } : false;

    const initialContext = {
        id,
        path: stackPath,
        stack,
        send: machineSend,
    }
    const componentProps: ComponentProps = {
        children,
        history,
        machine: {
            current,
            send: machineSend
        },
        match
    }

    return match ?
        <StateNodeContext.Provider value={initialContext}>
            { Component ?
                <Component {...componentProps}/>
            : children }
        </StateNodeContext.Provider>
    : null;
}

State.displayName = 'State';

export default State;
