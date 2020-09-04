import React, { useState } from 'react';
/*
    TRANSITION log
    source: { state: "stateId", : path: "/path" }
    event: { event: "event-name", : data: { ...data }}
        if transition isn't child:
        matched: { state: "stateId", oath: "/path" }
    target: { state: "stateId", : path: "/path" }
        if not atomic:
        resolved: { state: "stateId", : path: "/path" }

    EVENT DISCARDED
    source: { state: "stateId", : path: "/path" }
    target: { state: "stateId", : path: "/path" }

    HISTORY PUSH/POP/REPLACE
    source: { state: "stateId", : path: "/path" }
    url: "/path",
    target: { state: "stateId", : path: "/path" }
        if not atomic:
        resolved: { state: "stateId", : path: "/path" }
*/

const useLogger = (source, enabled) => {
    if (!enabled) {
        return;
    }

    const [ logs, setLogs ] = useState([]);
    const log = ({ type, payload }) => {
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
            case 'TRANSITION':
                logTitle();
                logEvent();
                logSource();
                logTarget();
                break;
            case 'NO_MATCHING_STATE':
                logTitle('EVENT DISCARDED');
                console.log(`%cdetails: %cNo matching <State id="%c${target.state}%c"/> found.`,
                    'color: red; font-weight: bold;', null, 'font-weight: bold; font-family: monospace;', null);
                logEvent();
                logSource();
                console.log('%ctarget', 'color: green; font-weight: bold;', { state: target.state });
                break;
            case 'NO_MATCHING_TRANSITION':
                logTitle('EVENT DISCARDED');
                console.log(`%cdetails: %cNo matching <Transition id="%c${event}%c"/> found within source state or any of its ancestors.`,
                    'color: red; font-weight: bold;', null, 'font-weight: bold; font-family: monospace;', null);
                logEvent();
                logSource();
                break;
            case 'HISTORY_REPLACE':
            case 'HISTORY_PUSH':
            case 'HISTORY_POP':
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