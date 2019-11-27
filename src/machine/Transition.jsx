import { useContext, useEffect } from 'react';
import { MachineContext } from './Machine';

function Transition({ event, target }) {
    const machineContext = useContext(MachineContext);
    const { current, event: machineEvent, history, id: machineId, params, resolvePath, resolveStack, resolveState, send: machineSend } = machineContext;

    // get state node stack, send as target in "machienSend"
    // what are the limitations on "target" prop? sibling? ancestor? descendent?
    
    useEffect(() => {
        // console.log('transition', event, machineEvent.name);
        if (machineEvent && machineEvent.name === event) {
            console.log(machineEvent, target);
            // resolveState(target);
        }
    }, [ machineEvent ]);

    return null;
}

export default Transition;