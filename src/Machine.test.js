import React from 'react';
import { createMemoryHistory } from 'history';
import { Machine, State, Transition } from '.';
import { render, fireEvent } from '@testing-library/react'
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
    const renderWithNavigation = (path, element) => {
        const testHistory = createMemoryHistory({ initialEntries: [ path ] });
        const machine = <Machine history={testHistory} id='home' path={path}>{element}</Machine>;
        return [ testHistory, machine ];
    }

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
        const [ history, machine ] = renderWithNavigation('/',
            <State id='parent'>
                <State id='child-1' path='/child-1' component={generic('Child 1')}>
                    <State id='grand-child'>
                        <State id='great-grand-child'/>
                    </State>
                </State>
                <State id='child-2' component={generic('Child 2')} path='/child-2'/>
            </State>);
        const { getByText } = render(machine);

        expect(getByText('Child 1')).toBeTruthy;
    });

    test('Resolves nitial <State/> node lineage', () => {
        const [ history, machine ] = renderWithNavigation('/',
            <State id='parent'>
                <State id='child-1' component={generic('Child 1')}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                </State>
                <State id='child-2' initial component={generic('Child 2')}/>
            </State>
        );
        const { getByText } = render(machine);

        expect(getByText('Child 2')).toBeTruthy();

        const [ history2, machine2 ] = renderWithNavigation('/',
            <State id='parent'>
                <State id='child-1' component={generic('Child 1')}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                </State>
                <State id='child-2' initial>
                    <State id='gren-child-2' component={generic('Grand Child 2')}/>
                </State>
            </State>);
        const { getByText: getByText2 } = render(machine2);

        expect(getByText2('Grand Child 2')).toBeTruthy();
    });

    test('Resolves to an atomic <State/> from a URL', () => {
        const [ history, machine ] = renderWithNavigation('/child-2',
            <State id='parent'>
                <State id='child-1' path='/child-1' component={generic('Child 1')}>
                    <State id='grand-child-1' component={generic('Grand Child 1')}/>
                </State>
                <State id='child-2' component={generic('Child 2')} path='/child-2'>
                    <State id='grand-child-2' component={generic('Grand Child 2')}/>
                </State>
            </State>);
        const { getByText } = render(machine);

        expect(getByText('Grand Child 2')).toBeTruthy();
    });

    test('Resolves to wildcard route when no <State/> matches URL', () => {
        const [ history, machine ] = renderWithNavigation('/no-route-found', [
                <State key='1' id='parent' path='/parent'/>,
                <State key='2' id='*' component={generic('Wildcard Route')}/>
        ]);
        const { getByText } = render(machine);

        expect(getByText('Wildcard Route')).toBeTruthy();
    });

    test('renders nothing instead of crashing when no <State/> matches URL', () => {
        const [ history, machine ] = renderWithNavigation('/no-route-found', <State id='parent' path='/parent'/>);
        const { getByText} = render(machine);
        expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/No <State\/> configuration matches URL/));
    });

    test('Transitions state & resolves URL upon even emission', () => {
        const [ history, machine ] = renderWithNavigation('/', 
            <State id='parent'>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                        <h1>Child 1</h1>
                        <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                    </div>}>
                    <Transition event='test-event-1' target='child-2'/>
                </State>
                <State id='child-2' path='/child-2' component={generic('Child 2')}/>
            </State>
        );
        const { getByText } = render(machine);

        expect(history.location.pathname).toBe('/child-1');
        expect(getByText('Child 1')).toBeTruthy();
        expect(getByText('Fire event')).toBeTruthy();
        fireEvent.click(getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(history.location.pathname).toBe('/child-2');
        expect(getByText('Child 2')).toBeTruthy();
    });

    test('Transitions state & resolves URL upon event emission, even if the <Transition/> is an ancestor', () => {
        const [ history, machine ] = renderWithNavigation('/', 
            <State id='parent'>
                <Transition event='test-event-1' target='child-2'/>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}/>
                <State id='child-2' path='/child-2' component={generic('Child 2')}/>
            </State>);
        const { getByText } = render(machine);

        expect(getByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(getByText('Child 2')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-2');
    });

    test('Selects proper transition when multiple transitions exist', () => {
        const [ history, machine ] = renderWithNavigation('/',
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
            </State>);
        const { getByText } = render(machine);

        expect(getByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(getByText('Child 3')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-3');
    });

    test('Transitions state & resolves URL when target state is descendant, while "path" attribute is in ascestor', () => {
        const [ history, machine ] = renderWithNavigation('/',
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
            </State>);
        const { getByText } = render(machine);

        expect(getByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(getByText('Grand Child 2')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-2');
    });

    test.skip('Transitions state & resolves URL when target state is descendant & NOT initial state, while "path" attribute is in ascestor', () => {
        const [ history, machine ] = renderWithNavigation('/',
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
            </State>);
        const { getByText } = render(machine);

        expect(getByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(getByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(getByText('Grand Child 2-2')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-2');
    });

    // test.skip('Discards events that result in mo matching transition', () => {

    // });
});