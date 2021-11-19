import React, { useContext } from 'react';
import { MachineContext } from './Machine';
import { isCurrentStack, isExactStack } from './util';

type StateNodeContextProps = {
    id: string,
    path: string,
    stack: string,
    send: (event: string) => void,
}

export const StateNodeContext = React.createContext<Partial<StateNodeContextProps>>({});
StateNodeContext.displayName = 'StateNode';

type StateProps = {
    component: React.ElementType,
    id: string,
    initial: boolean,
    path: string
}

type Match = {
    exact: boolean,
    params?: { [key: string]: string },
    path: string,
    url: string
} | boolean;

type ComponentProps = {
    children: React.ReactNode,
    history: any,
    machine: {
        current: string,
        send: (id: string) => void
    },
    match: Match
}

const State: React.FC<StateProps> = ({ children, component: Component, id, initial, path }) => {
    const { current, history, id: machineId, params, send: machineSend } = useContext(MachineContext);
    const { id: parentId, path: parentPath, stack: parentStack } = useContext(StateNodeContext);
    const stack = parentStack ? `${parentStack}.${id}` : `#${machineId}.${id}`;
    const stackPath = path ? parentPath ? parentPath + path : path : parentPath || '';
    const match: Match = isCurrentStack(id, current!) ? {
        exact: isExactStack(id, current!),
        params,
        path: stackPath,
        url: history!.location.pathname
    } : false;

    const initialContext: StateNodeContextProps = {
        id,
        path: stackPath,
        stack,
        send: machineSend!,
    }
    const componentProps: ComponentProps = {
        children,
        history,
        machine: {
            current: current!,
            send: machineSend!
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
