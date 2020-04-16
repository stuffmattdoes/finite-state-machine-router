export const logger = (state, event, target) => {
    const { current, id } = state;
    const date = new Date();
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;

    console.group(`%cFSM Router transition: %c${event} %c@ ${time}`, 'color: grey; font-weight: normal', 'font-weight: bold;', 'color: grey; font-weight: normal');
    console.log(`%cprev state: %c${current}\n`, 'color: grey; font-weight: bold;', 'color: black;');
    console.log(`%cevent: %c${event}\n`, 'color: blue; font-weight: bold;', 'color: black;');
    console.log(`%cnext state: %c#${id}.${target}\n`, 'color: green; font-weight: bold;', 'color: black;');
    console.groupEnd();
}

export const fakeUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 | 0;
    let v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});