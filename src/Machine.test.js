import React from 'react';
import { createMemoryHistory } from 'history';
import { Link, Machine, State, Transition } from '.';
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
// import '@testing-library/jest-dom';

describe('<Machine/>', () => {
    let _console = {
        log: console.log,
        warn: console.warn
    };

    beforeEach(() => {
        global.console.log = jest.fn();
        global.console.warn = jest.fn();
    });
    
    afterEach(() => {
        global.console = {
            ...global.console,
            ..._console
        }
    });

    const generic = name => ({ children }) => <div><h1>{name}</h1>{children}</div>;

    test('Renders the minimum necessary components for a valid <Machine/>', () => {
        const { getByText } = render(<Machine id='home'>
            <State id='child' component={generic('Child 1')}/>
        </Machine>);

        expect(getByText('Child 1')).toBeTruthy();
    });

    test('Renders <Machine/> content that does not contain any URLs', () => {
        const { getByText } = render(<Machine id='home'>
            <State id='parent'>
                <State id='child-1' component={generic('Child 1')}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child' component={generic('Grand Child 1')}/>
                </State>
                <State id='child-2' component={generic('Child 2')}/>
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
            <State id='child-1' path='/child-1' component={generic('Child 1')}>
                <State id='grand-child'>
                    <State id='great-grand-child'/>
                </State>
            </State>
            <State id='child-2' component={generic('Child 2')} path='/child-2'/>
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
                <State id='child-1' component={generic('Child 1')}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                </State>
                <State id='child-2' initial>
                    <State id='gren-child-2' component={generic('Grand Child 2')}/>
                </State>
            </State>
        </Machine>);

        expect(getByText('Grand Child 2')).toBeTruthy();
    });

    test('Resolves to an atomic <State/> from a URL', () => {
        const initialUrl = '/child-2';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { getByText } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='child-1' path='/child-1' component={generic('Child 1')}>
                <State id='grand-child-1' component={generic('Grand Child 1')}/>
            </State>
            <State id='child-2' component={generic('Child 2')} path='/child-2'>
                <State id='grand-child-2' component={generic('Grand Child 2')}/>
            </State>
        </Machine>);

        expect(getByText('Grand Child 2')).toBeTruthy();
    });

    test('Resolves to wildcard route when no <State/> matches URL', () => {
        const initialUrl = '/no-route-found';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { getByText } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent' path='/parent'/>
            <State id='*' component={generic('Wildcard Route')}/>
        </Machine>);

        expect(getByText('Wildcard Route')).toBeTruthy();
    });

    test('renders nothing instead of crashing when no <State/> matches URL', () => {
        const initialUrl = '/no-route-found';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent' path='/parent'/>
        </Machine>);

        expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/No <State\/> configuration matches URL/));
    });

    test('Transitions state & resolves URL upon even emission', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { getByText } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    <h1>Child 1</h1>
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                <Transition event='test-event-1' target='child-2'/>
            </State>
            <State id='child-2' path='/child-2' component={generic('Child 2')}/>
        </Machine>);

        expect(testHistory.location.pathname).toBe('/child-1');
        expect(getByText('Child 1')).toBeTruthy();
        expect(getByText('Fire event')).toBeTruthy();
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(testHistory.location.pathname).toBe('/child-2');
        expect(getByText('Child 2')).toBeTruthy();
    });

    test('Transitions state & resolves URL upon event emission, even if the <Transition/> is an ancestor', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { getByText } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent'>
                <Transition event='test-event-1' target='child-2'/>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}/>
                <State id='child-2' path='/child-2' component={generic('Child 2')}/>
            </State>
        </Machine>);

        expect(getByText('Child 1')).toBeTruthy();
        expect(testHistory.location.pathname).toBe('/child-1');
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(getByText('Child 2')).toBeTruthy();
        expect(testHistory.location.pathname).toBe('/child-2');
    });

    test('Selects proper transition when multiple transitions exist', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { getByText } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent'>
                <Transition event='test-event-1' target='child-2'/>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                    <Transition event='test-event-1' target='child-3'/>
                </State>
                <State id='child-2' path='/child-2' component={generic('Child 2')}/>
                <State id='child-3' path='/child-3' component={generic('Child 3')}/>
            </State>
        </Machine>);

        expect(getByText('Child 1')).toBeTruthy();
        expect(testHistory.location.pathname).toBe('/child-1');
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(getByText('Child 3')).toBeTruthy();
        expect(testHistory.location.pathname).toBe('/child-3');
    });

    test('Transitions state & resolves URL when target state is descendant, while "path" attribute is in ascestor', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { getByText } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent'>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                    <Transition event='test-event-1' target='grand-child-2'/>
                </State>
                <State id='child-2' path='/child-2'>
                    <State id='grand-child-2' component={generic('Grand Child 2')}/>
                </State>
            </State>
        </Machine>);

        expect(getByText('Child 1')).toBeTruthy();
        expect(testHistory.location.pathname).toBe('/child-1');
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(getByText('Grand Child 2')).toBeTruthy();
        expect(testHistory.location.pathname).toBe('/child-2');
    });

    test.skip('Transitions state & resolves URL when target state is descendant & NOT initial state, while "path" attribute is in ascestor', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const { getByText } = render(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent'>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                    <Transition event='test-event-1' target='grand-child-2-2'/>
                </State>
                <State id='child-2' path='/child-2'>
                    <State id='grand-child-2' component={generic('Grand Child 2')}/>
                    <State id='grand-child-2-2' component={generic('Grand Child 2-2')}/>
                </State>
            </State>
        </Machine>);

        expect(getByText('Child 1')).toBeTruthy();
        expect(testHistory.location.pathname).toBe('/child-1');
        fireEvent.click(screen.getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(getByText('Grand Child 2-2')).toBeTruthy();
        expect(testHistory.location.pathname).toBe('/child-2');
    });

    // test.skip('Discards events that result in mo matching transition', () => {

    // });
});