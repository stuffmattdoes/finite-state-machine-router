import React from 'react';
import { createMemoryHistory } from 'history';
import { Link, Machine, MemoryMachine, State, Transition } from '..';
import { act, fireEvent, render, screen } from '@testing-library/react';

describe('<Machine/>', () => {
    let _console = {
        // group: console.group,
        // groupEnd: console.groupEnd,
        log: console.log,
        warn: console.warn
    };

    beforeEach(() => {
        // global.console.group = jest.fn();
        // global.console.groupEnd = jest.fn();
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
    const genericWithLinks = name => ({ children, history, match }) => <div><h1>{name}</h1>
        <Link href='/child-2'>URL Push 1</Link>
        <Link href='/child-3'>URL Push 2</Link>
        <p>URL: {history.location.pathname}</p>
        {match.params && Object.keys(match.params).map(p => <span key={p}>{p}: {match.params[p]}</span>)}
        {children}
    </div>;
    const renderWithNavigation = (initialEntries, element) =>
        <Machine initialEntries={initialEntries} id='home'>{element}</Machine>;

    test('<Machine/> Build verification', () => {
        render(<Machine id='home'>
            <State id='child' component={generic('Child 1')}/>
        </Machine>);

        expect(screen.queryByText('Child 1')).toBeTruthy();
    });

    test('<MemoryMachine/> Build verification', () => {
        render(<MemoryMachine id='home'>
            <State id='child' component={generic('Child 1')}/>
        </MemoryMachine>);

        expect(screen.queryByText('Child 1')).toBeTruthy();
    });

    test('Renders <Machine/> content that does not contain any URLs', () => {
        render(<Machine id='home'>
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

        expect(screen.queryByText('Child 1')).toBeTruthy;
    });

    test('Resolves initial <State/> node lineage in a simple tree', () => {
        const { container } = render(renderWithNavigation(null,
            <State id='parent'>
                <State id='child-1' component={generic('Child 1')}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                </State>
                <State id='child-2' initial component={generic('Child 2')}/>
            </State>
        ));

        expect(screen.queryByText('Child 2')).toBeTruthy();
    });
    
    test('Resolves initial <State/> node lineage in a complex tree', () => {
        const { container } = render(renderWithNavigation(null,
            <State id='parent'>
                <State id='child-1' component={generic('Child 1')}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                </State>
                <State id='child-2' initial>
                    <State id='grand-child-2' component={generic('Grand Child 2')}>
                        <State id='great-grand-child-2' component={generic('Great Grand Child 2')}/>
                        <State id='great-grand-child-2-2' initial component={generic('Great Grand Child 2-2')}/>
                    </State>
                </State>
            </State>));

        expect(screen.queryByText('Grand Child 2')).toBeTruthy();
        expect(screen.queryByText('Great Grand Child 2-2')).toBeTruthy();
    });

    test('Resolves to an atomic <State/> & updates URL from root URL "/"', () => {
        const { container } = render(renderWithNavigation(null,
            <State id='parent'>
                <State id='child-1' path='/child-1' component={generic('Child 1')}>
                    <State id='grand-child-1' component={generic('Grand Child 1')}>
                        <State id='great-grand-child-1' path='/great-grand-child-1' component={genericWithLinks('Great Grand Child 1')}>
                        </State>
                    </State>
                </State>
            </State>));

        expect(container).toMatchSnapshot();
        expect(screen.queryByText('/child-1/great-grand-child-1')).toBeTruthy();
    });

    test.skip('Resolves to an atomic <State/> & updates URL from non-root URL', () => {
        const [ history, machine ] = renderWithNavigation('/child-2',
            <State id='parent'>
                <State id='child-1' path='/child-1' component={generic('Child 1')}>
                    <State id='grand-child-1' component={generic('Grand Child 1')}/>
                </State>
                <State id='child-2' component={generic('Child 2')} path='/child-2'>
                    <State id='grand-child-2' component={generic('Grand Child 2')} path='/grand-child-2'>
                        <State id='great-grand-child-2' component={generic('Great Grand Child 2')}/>
                    </State>
                </State>
            </State>);
        const { queryByText } = render(machine);

        expect(history.location.pathname).toBe('/child-2/grand-child-2');
        expect(queryByText('Great Grand Child 2')).toBeTruthy();
    });

    test.skip('Resolves to wildcard route when no <State/> matches URL', () => {
        const [ history, machine ] = renderWithNavigation('/no-route-found', [
                <State key='1' id='parent' path='/parent'/>,
                <State key='2' id='*' component={generic('Wildcard Route')}/>
        ]);
        const { queryByText } = render(machine);

        expect(queryByText('Wildcard Route')).toBeTruthy();
    });

    test.skip('renders nothing instead of crashing when no <State/> matches URL', () => {
        const [ history, machine ] = renderWithNavigation('/no-route-found', <State id='parent' path='/parent'/>);
        const { queryByText} = render(machine);
        expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/No <State\/> configuration matches URL/));
    });

    test.skip('Transitions state & resolves URL upon event emission', () => {
        const [ history, machine ] = renderWithNavigation(null, 
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
        const { queryByText } = render(machine);

        expect(history.location.pathname).toBe('/child-1');
        expect(queryByText('Child 1')).toBeTruthy();
        expect(queryByText('Fire event')).toBeTruthy();

        fireEvent.click(queryByText(/Fire event/i));
        // expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Machine Event Sent/), expect.any(Object));
        expect(history.location.pathname).toBe('/child-2');
        expect(queryByText('Child 2')).toBeTruthy();
    });

    test.skip('Transitions state & resolves URL upon event emission, even if the <Transition/> is an ancestor', () => {
        const [ history, machine ] = renderWithNavigation(null, 
            <State id='parent'>
                <Transition event='test-event-1' target='child-2'/>
                <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}/>
                <State id='child-2' path='/child-2' component={generic('Child 2')}/>
            </State>);
        const { queryByText } = render(machine);

        expect(history.location.pathname).toBe('/child-1');
        expect(queryByText('Child 1')).toBeTruthy();
        expect(queryByText('Fire event')).toBeTruthy();

        fireEvent.click(queryByText(/Fire event/i));
        expect(queryByText('Child 2')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-2');
    });

    test.skip('Selects proper transition when multiple transitions exist', () => {
        const [ history, machine ] = renderWithNavigation(null,
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
        const { queryByText } = render(machine);

        expect(queryByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(queryByText(/Fire event/i));
        expect(queryByText('Child 3')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-3');
    });

    test.skip('Transitions state & resolves URL when target state is descendant, while "path" attribute is in ascestor', () => {
        const [ history, machine ] = renderWithNavigation(null,
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
        const { queryByText } = render(machine);

        expect(queryByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(queryByText(/Fire event/i));
        expect(queryByText('Grand Child 2')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-2');
    });

    test.skip('Transitions state & resolves URL when target state is descendant & NOT initial state, while "path" attribute is in ascestor', () => {
        const [ history, machine ] = renderWithNavigation(null,
            <State id='parent'>
                <State id='child-1' path='/child-1'>
                    <Transition event='test-event-1' target='grand-child-2-2'/>
                    <State id='grand-child-1' path='/grand-child-1' component={({ machine }) => <div>
                    Child 1
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}/>
                </State>
                <State id='child-2' path='/child-2'>
                    <State id='grand-child-2' component={generic('Grand Child 2')}/>
                    <State id='grand-child-2-2' component={generic('Grand Child 2-2')}/>
                </State>
            </State>);
        const { queryByText } = render(machine);

        expect(queryByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1/grand-child-1');
        fireEvent.click(queryByText(/Fire event/i));
        expect(queryByText('Grand Child 2-2')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-2');
    });

    test.skip('Resolves to proper state on native browser navigation', () => {
        const [ history, machine ] = renderWithNavigation([ '/child-1/grand-child-1', '/child-2', '/child-3', '/child-4'],
            <State id='parent'>
                <State id='child-1' path='/child-1'>
                    <State id='grand-child-1' path='/grand-child-1' component={genericWithLinks('Grand Child 1')}/>
                </State>
                <State id='child-2' path='/child-2' component={genericWithLinks('Child 2')}/>
                <State id='child-3' path='/child-3'>
                    <State id='grand-child-3' component={generic('Grand Child 3')}/>
                </State>
                <State id='child-4' path='/child-4'>
                    <State id='grand-child-4-1' component={generic('Grand Child 4-1')}/>
                    <State id='grand-child-4-2' component={generic('Grand Child 4-2')}/>
                </State>
            </State>);
        const { queryByText } = render(machine);

        expect(history.location.pathname).toBe('/child-4');
        expect(queryByText('Grand Child 4-1')).toBeTruthy();

        act(() => history.back());
        expect(history.location.pathname).toBe('/child-3');
        expect(queryByText('Grand Child 3')).toBeTruthy();

        act(() => history.back());
        expect(history.location.pathname).toBe('/child-2');
        expect(queryByText('Child 2')).toBeTruthy();

        act(() => history.back());
        expect(history.location.pathname).toBe('/child-1/grand-child-1');
        expect(queryByText('Grand Child 1')).toBeTruthy();

        act(() => history.forward());
        expect(history.location.pathname).toBe('/child-2');
        expect(queryByText('Child 2')).toBeTruthy();

        act(() => history.forward());
        expect(history.location.pathname).toBe('/child-3');
        expect(queryByText('Grand Child 3')).toBeTruthy();

        act(() => history.forward());
        expect(history.location.pathname).toBe('/child-4');
        expect(queryByText('Grand Child 4-1')).toBeTruthy();
    });

    test.skip('Ignores changes in URL hash', () => {
        const testHistory = createMemoryHistory({ initialEntries: [ '/parent?search=true#hash=true' ] });
        const { queryByText } = render(<Machine history={testHistory} id='home' ignoreHash>
            <State id='parent' path='/parent'>
                <State id='child-1' component={({ machine }) => <div>
                    <h1>Child 1</h1>
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                    <Transition event='test-event-1' target='child-2'/>
                </State>
                <State id='child-2' component={genericWithLinks('Child 2')}/>
            </State>
        </Machine>);

        expect(testHistory.location.pathname).toBe('/parent');
        expect(testHistory.location.hash).toBe('#hash=true');
        
        fireEvent.click(queryByText(/Fire event/i));
        expect(testHistory.location.pathname).toBe('/parent');
        expect(testHistory.location.hash).toBe('#hash=true');
        expect(queryByText('Child 2')).toBeTruthy();
        
        act(() => testHistory.push({ hash: null }));
        expect(testHistory.location.pathname).toBe('/parent');
        expect(testHistory.location.hash).toBeNull();
        expect(queryByText('Child 2')).toBeTruthy();
    });

    test.skip('Preserves query parameters when resolving url', () => {

    });

    test.skip('Translates the URL into dynamic segment when applicable', () => {
        const [ history, machine ] = renderWithNavigation('/parent/marlin/grand-child/nemo',
            <State id='parent' path='/parent' component={generic('Parent')}>
                <State id='child' path='/:parent'>
                    <State id='grand-child' path='/child'>
                        <State id='great-grand-child' path='/:child' component={genericWithParams('Child')}/>
                    </State>
                </State>
            </State>);
        const { container, queryByText } = render(machine);

        expect(queryByText('parent: marlin')).toBeTruthy();
        expect(queryByText(/child\n:\nnemo/)).toBeTruthy();
        expect(container.firstChild).toMatchSnapshot();
    });

    test.skip('Discards events that result in mo matching transition', () => {

    });

    test.skip('Throws error when two <State/>s have the same "id" attribute', () => {

    });

    test.skip('Rejects usage of "." or "#" in <State/> "id" attribute', () => {

    });
});
