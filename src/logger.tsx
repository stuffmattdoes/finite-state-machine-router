import React, { useState } from 'react';

// type TransitionLog = {
//     source: { state: "stateId", : path: "/path" }
//     event: { event: "event-name", : data: { ...data }}
//     matched: { state: "stateId", oath: "/path" } // if transition isn't child:
//     target: { state: "stateId", : path: "/path" }
//     resolved: { state: "stateId", : path: "/path" } // if not atomic:
// }

// type EventDiscardedLog = {
//     source: { state: "stateId", : path: "/path" },
//     target: { state: "stateId", : path: "/path" }
// }

// type HistoryLog = {
//     source: { state: "stateId", : path: "/path" },
//     url: "/path",
//     target: { state: "stateId", : path: "/path" },
//     resolved: { state: "stateId", : path: "/path" } //if not atomic:
// }

type TransitionAction = {
    type: ActionTypes.transition,
    payload: {
        event: string,
        target: {
            params: { [name: string]: string },
            location: Location,
            state: string
        }
    }
}

type HistoryAction = {
    type: ActionTypes.historyPop | ActionTypes.historyPush | ActionTypes.historyReplace,
    payload: {
        target: {
            target: string,
            params: { [name: string]: string },
            location: Location,
            state: string
        }
    }
}

type NoMatchinStateAction = {
    type: ActionTypes.noMatchingState,
    payload: { 
        event: string,
        target: {
            params: { [name: string]: string },
            state: string
        }
    }
}

type NoMatchingTransitionAction = {
    type: ActionTypes.noMatchingTransition,
    payload: {
        event: string
    }
}

enum ActionTypes {
    historyReplace = 'history/REPLACE',
    historyPush = 'history/PUSH',
    historyPop = 'history/POP',
    transition = 'machine/TRANSITION',
    noMatchingState = 'machine/NO_MATCHING_STATE',
    noMatchingTransition = 'machine/NO_MATCHING_TRANSITION'
}

type Action = TransitionAction | HistoryAction | NoMatchinStateAction | NoMatchingTransitionAction;

type Log = ({ type, payload }: Action | any) => void;

type UseLogger = (source: { current: string, location: Location }, enabled: boolean) => [ Action[], Log ];

const useLogger: UseLogger = (source, enabled) => {
    if (!enabled) {
        return [ [], () => {} ];
    }

    const [ logs, setLogs ] = useState<Action[]>([]);
    const log: Log = ({ type, payload }) => {
        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
        const { event, target } = payload;

        const logTitle = (actionType = type.replace(/_/g, ' ')) => 
            console.group(`%cFSM-Router action: %c${actionType} %c@ ${time}`,
                'color: grey; font-weight: normal', 'font-weight: bold;', 'color: grey; font-weight: normal');
        const logEvent = () => console.log('%cevent:', 'color: blue; font-weight: bold;', event);
        const logSource = () => console.log('%csource:', 'color: grey; font-weight: bold;', { state: source.current, location: source.location });
        const logTarget = () => {
            if (target.exact) {
                console.log('%ctarget', 'color: green; font-weight: bold;', {
                    location: target.location,
                    matched: target.exact,
                    state: target.state
                    // resolved: { state: target.state, path: target.path }
                    // search: target.location.search
                });
            } else {
                console.log('%ctarget', 'color: green; font-weight: bold;', { state: target.state, location: target.location });
            }
        }

        switch(type) {
            case ActionTypes.transition:
                logTitle();
                logEvent();
                logSource();
                logTarget();
                break;
            case ActionTypes.noMatchingState:
                logTitle('EVENT DISCARDED');
                console.log(`%cdetails: %cNo matching <State id="%c${target.state}%c"/> found.`,
                    'color: red; font-weight: bold;', null, 'font-weight: bold; font-family: monospace;', null);
                logEvent();
                logSource();
                console.log('%ctarget', 'color: green; font-weight: bold;', { state: target.state });
                break;
            case ActionTypes.noMatchingTransition:
                logTitle('EVENT DISCARDED');
                console.log(`%cdetails: %cNo matching <Transition id="%c${event}%c"/> found within source state or any of its ancestors.`,
                    'color: red; font-weight: bold;', null, 'font-weight: bold; font-family: monospace;', null);
                logEvent();
                logSource();
                break;
            case ActionTypes.historyReplace:
            case ActionTypes.historyPush:
            case ActionTypes.historyPop:
                logTitle();
                console.log('%cpath', 'color: blue; font-weight: bold;', target.location.pathname);
                logSource();
                logTarget();
                break;
        }

        console.groupEnd();
        setLogs(logs.concat({ type, payload }));
    }

    return [ logs, log ];
}

export default useLogger;