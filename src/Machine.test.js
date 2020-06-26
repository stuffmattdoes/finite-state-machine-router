import React from 'react';
import { createMemoryHistory } from 'history';
import { Link, Machine, State, Transition } from '.';
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
// import '@testing-library/jest-dom';

describe('<Machine/>', () => {
    // let _console = {
    //     log: console.log,
    //     warn: console.warn
    // };

    // beforeEach(() => {
    //     global.console.log = jest.fn();
    //     global.console.warn = jest.fn();
    // });
    
    // afterEach(() => {
    //     global.console = {
    //         ...global.console,
    //         ..._console
    //     }
    // });

    test('Renders the minimum necessary components for a valid <Machine/>', () => {
        const { getByText } = render(<Machine id='home'>
            <State id='child' component={(props) => <div>Child 1</div>}/>
        </Machine>);

        expect(getByText('Child 1')).toBeTruthy();
        // expect(screen.getByText('Child 1')).toMatchSnapshot();
    });

    test('Renders <Machine/> content that does not contain any URLs', () => {
        const { getByText } = render(<Machine id='home'>
            <State id='parent'>
                <State id='child-1' component={(props) => <div>Child 1</div>}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                </State>
                <State id='child-2' component={(props) => <div>Child 2</div>}/>
            </State>
            <State id='parent-2'>
                <State id='child-3'/>
            </State>
        </Machine>);

        expect(getByText('Child 1')).toBeTruthy;
    });

    test('Renders <Machine/> content at \'/\'', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { getByText } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='child-1' path='/child-1' component={(props) => <div>Child 1</div>}>
                <State id='grand-child'>
                    <State id='great-grand-child'/>
                </State>
            </State>
            <State id='child-2' component={(props) => <div>Child 2</div>} path='/child-2'/>
        </Machine>);

        expect(getByText('Child 1')).toBeTruthy;
    });

    test('Resolves nitial <State/> node lineage', () => {
        // render(<Machine id='home'>
        //     <State id='parent'>
        //         <State id='child-1' component={(props) => <div>Child 1</div>}>
        //             <Transition event='test-event' target='child-2'/>
        //             <State id='grand-child'/>
        //         </State>
        //         <State id='child-2' initial component={(props) => <div>Child 2</div>}/>
        //     </State>
        //     <State id='parent-2'>
        //         <State id='child-3'/>
        //     </State>
        // </Machine>);

        // expect(screen.getByText('Child 2')).toBeTruthy();

        const { getByText } = render(<Machine id='home'>
            <State id='parent'>
                <State id='child-1' component={(props) => <div>Child 1</div>}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                </State>
                <State id='child-2' initial>
                    <State id='gren-child-2' component={(props) => <div>Grand Child 2</div>}/>
                </State>
            </State>
        </Machine>);

        expect(getByText('Grand Child 2')).toBeTruthy();
    });

    test.skip('Resolves to an atomic <State/> from a URL', () => {
        const initialUrl = '/child-2';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { container } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='child-1' path='/child-1' component={(props) => <div>Child 1</div>}>
                <State id='grand-child'>
                    <State id='great-grand-child-1'/>
                </State>
            </State>
            <State id='child-2' component={(props) => <div>Child 2</div>} path='/child-2'>
                <State id='grand-child-2' component={(props) => <div>Grand Child 2</div>}/>
            </State>
        </Machine>);

        expect(container).toMatchSnapshot();
    });

    test.skip('Resolves to wildcard route when no <State/> matches URL', () => {
        const initialUrl = '/no-route-found';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { container } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent' path='/parent'/>
            <State id='*' component={(props) => <div>Wildcard Route</div>}/>
        </Machine>);

        expect(container).toMatchSnapshot();
    });

    test.skip('renders nothing instead of crashing when no <State/> matches URL', () => {
        const initialUrl = '/no-route-found';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { container } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent' path='/parent'/>
        </Machine>);

        expect(container).toMatchSnapshot();
        expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/No <State\/> configuration matches URL/));
    });

    test.skip('Transitions state & resolves URL upon even emission', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { container } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                <Transition event='test-event-1' target='child-2'/>
            </State>
            <State id='child-2' path='/child-2' component={(props) => <div>Child 2</div>}/>
        </Machine>);

        expect(testHistory.location.pathname).toBe('/child-1');
        expect(container).toMatchSnapshot();
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(testHistory.location.pathname).toBe('/child-2');
        expect(container).toMatchSnapshot();
    });

    test.skip('Transitions state & resolves URL upon event emission, even if the <Transition/> is an ancestor', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { container } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent'>
                <Transition event='test-event-1' target='child-2'/>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}/>
                <State id='child-2' path='/child-2' component={(props) => <div>Child 2</div>}/>
            </State>
        </Machine>);

        expect(container).toMatchSnapshot();
        expect(testHistory.location.pathname).toBe('/child-1');
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(container).toMatchSnapshot();
        expect(testHistory.location.pathname).toBe('/child-2');
    });

    test.skip('Selects proper transition when multiple transitions exist', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { container } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent'>
                <Transition event='test-event-1' target='child-2'/>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                    <Transition event='test-event-1' target='child-3'/>
                </State>
                <State id='child-2' path='/child-2' component={(props) => <div>Child 2</div>}/>
                <State id='child-3' path='/child-3' component={(props) => <div>Child 3</div>}/>
            </State>
        </Machine>);

        expect(container).toMatchSnapshot();
        expect(testHistory.location.pathname).toBe('/child-1');
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(container).toMatchSnapshot();
        expect(testHistory.location.pathname).toBe('/child-3');
    });

    test.skip('Transitions state & resolves URL when target state is descendant, while "path" attribute is in ascestor', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { container } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent'>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                    <Transition event='test-event-1' target='grand-child-2'/>
                </State>
                <State id='child-2' path='/child-2'>
                    <State id='grand-child-2' component={(props) => <div>Child 2</div>}/>
                </State>
            </State>
        </Machine>);

        expect(container).toMatchSnapshot();
        expect(testHistory.location.pathname).toBe('/child-1');
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(container).toMatchSnapshot();
        expect(testHistory.location.pathname).toBe('/child-2');
    });

    test.skip('Transitions state & resolves URL when target state is descendant & NOT initial state, while "path" attribute is in ascestor', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { container } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent'>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                    <Transition event='test-event-1' target='grand-child-2-2'/>
                </State>
                <State id='child-2' path='/child-2'>
                    <State id='grand-child-2'/>
                    <State id='grand-child-2-2' component={(props) => <div>Child 2</div>}/>
                </State>
            </State>
        </Machine>);

        expect(container).toMatchSnapshot();
        expect(testHistory.location.pathname).toBe('/child-1');
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(container).toMatchSnapshot();
        expect(testHistory.location.pathname).toBe('/child-2');
    });

    // test.skip('Discards events that result in mo matching transition', () => {

    // });
});