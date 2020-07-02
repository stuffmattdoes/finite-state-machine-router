/*
    TRANSITION log
    source: { state: "stateId", : path: "/path" }
    event: { event: "event-name", : date: { ...data }}
    target: { state: "stateId", : path: "/path" }
        if not atomic:
    resolved: { state: "stateId", : path: "/path" }

    HISTORY PUSH/POP/REPLAC
    source: { state: "stateId", : path: "/path" }
    url: "/path",
    target: { state: "stateId", : path: "/path" }
        if not atomic:
    resolved: { state: "stateId", : path: "/path" }
*/


export const logger = ({ action, event, data, reason, source, target }) => {
    const date = new Date();
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
    const log = (msg) => {
        console.group(`%cFSM-Router: %c${action} %c@ ${time}`, 'color: grey; font-weight: normal', 'font-weight: bold;', 'color: grey; font-weight: normal');
        console.log('%csource:', 'color: grey; font-weight: bold;', source);
        console.log('%cevent:', 'color: blue; font-weight: bold;', { event, data });
        msg();
        console.groupEnd();
    };
    switch(action) {
        case 'TRANSITION':
            return log(() => console.log('%ctarget', 'color: green; font-weight: bold;', target));
        case 'EVENT_DISCARDED':
            if (reason === 'NO_MATCHING_TRANSITION') {
                return log(() => console.log(`%creason: %cNo matching %c<Transition id="${event}"/> %cfrom within source state or any of its ancestors.`,
                    'color: red; font-weight: bold;', null, 'font-weight: bold; font-family: monospace;', null));
            } else if ('NO_MATCHING_STATE') {
                return log(() => console.log(`%creason: %cNo matching %c<State id="${target.state}"/> %cfound.`,
                    'color: red; font-weight: bold;', null, 'font-weight: bold; font-family: monospace;', null));
            }
        case 'HISTORY_CHANGE':
            return log(() => console.log('%ctarget', 'color: green; font-weight: bold;', target));
    }

    log();
}
