import { useContext, useEffect } from 'react';
import { MachineContext } from './Machine';

function Transition({ event, target }) {
    const machineContext = useContext(MachineContext);
    const { _event: machineEvent, resolveState } = machineContext;

    // get state node stack, send as target in "machienSend"
    // what are the limitations on "target" prop? sibling? ancestor? descendent?

    useEffect(() => {
        // console.log('transition');

        if (machineEvent && machineEvent.name === event) {
            console.log('transition', machineEvent, target);
            resolveState(target);
        }
    }, [ machineEvent ]);

    return null;
}

export default Transition;