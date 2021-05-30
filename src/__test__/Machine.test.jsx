import React, { useEffect } from 'react';
import { createMemoryHistory } from 'history';
import { Link, Machine, State, Transition } from '..';
import { act, fireEvent, render, screen } from '@testing-library/react';

describe('<Machine/>', () => {
    let _console = {
        error: console.error,
        log: console.log,
        warn: console.warn
    };

    beforeAll(() => {
        global.console.error = jest.fn();
        global.console.log = jest.fn();
        global.console.warn = jest.fn();
    });
    
    afterAll(() => {
        global.console = {
            ...global.console,
            ..._console
        }
    });

    const generic = name => ({ children }) => <div><h1>{name}</h1>{children}</div>;
    const genericWithLinks = name => ({ children }) => <div><h1>{name}</h1>
        <Link href='/child-2'>URL Push 1</Link>
        <Link href='/child-3'>URL Push 2</Link>
        {children}
    </div>;
    const renderWithNavigation = (states, initialEntries = [ null ], props) => {
        const testHistory = createMemoryHistory({ initialEntries });
        const _render = render(<Machine history={testHistory} {...props}>{states}</Machine>);
        return [ testHistory, _render ];
    }

    test('Build verification', () => {
        render(<Machine id='home'>
            <State id='child' component={generic('Child 1')}/>
        </Machine>);

        expect(screen.queryByText('Child 1')).toBeTruthy();
    });

    test('Throws error when <Machine/> has no children', () => {
        expect(() => render(<Machine id='home'/>))
            .toThrow('<Machine/> has no children <State/> nodes! At least one is required to be considered a valid state machine.');
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

    test('Renders <Machine/> content when no "path" attribute is supplied', () => {
        renderWithNavigation(<State id='parent'>
            <State id='child-1' path='/child-1' component={generic('Child 1')}>
                <State id='grand-child'>
                    <State id='great-grand-child'/>
                </State>
            </State>
            <State id='child-2' component={generic('Child 2')} path='/child-2'/>
        </State>);

        expect(screen.queryByText('Child 1')).toBeTruthy;
    });

    test('Resolves initial <State/> node lineage', () => {
        renderWithNavigation(<State id='parent'>
            <State id='child-1' component={generic('Child 1')}>
                <Transition event='test-event' target='child-2'/>
                <State id='grand-child'/>
            </State>
            <State id='child-2' initial component={generic('Child 2')}/>
        </State>);

        expect(screen.queryByText('Child 2')).toBeTruthy();

        renderWithNavigation(<State id='parent'>
            <State id='child-1' component={generic('Child 1')}>
                <Transition event='test-event' target='child-2'/>
                <State id='grand-child'/>
            </State>
            <State id='child-2' initial>
                <State id='grand-child-2' component={generic('Grand Child 2')}>
                    <State id='great-grand-child-2' component={generic('Great Grand Child 2')}/>
                </State>
            </State>
        </State>);

        expect(screen.queryByText('Grand Child 2')).toBeTruthy();
        expect(screen.queryByText('Great Grand Child 2')).toBeTruthy();
    });

    test('Resolves to an atomic <State/> & updates URL from root URL "/"', () => {
        const [ history ] = renderWithNavigation(<State id='parent'>
            <State id='child-1' path='/child-1' component={generic('Child 1')}>
                <State id='grand-child-1' component={generic('Grand Child 1')}>
                    <State id='great-grand-child-1' path='/great-grand-child-1' component={generic('Great Grand Child 1')}>
                    </State>
                </State>
            </State>
        </State>);

        expect(history.location.pathname).toBe('/child-1/great-grand-child-1');
        expect(screen.queryByText('Great Grand Child 1')).toBeTruthy();
    });

    test('Resolves to an atomic <State/> & updates URL from non-root URL', () => {
        const [ history ] = renderWithNavigation(<State id='parent'>
            <State id='child-1' path='/child-1' component={generic('Child 1')}>
                <State id='grand-child-1' component={generic('Grand Child 1')}/>
            </State>
            <State id='child-2' component={generic('Child 2')} path='/child-2'>
                <State id='grand-child-2' component={generic('Grand Child 2')} path='/grand-child-2'>
                    <State id='great-grand-child-2' component={generic('Great Grand Child 2')}/>
                </State>
            </State>
        </State>,
        [ '/child-2' ]);

        expect(history.location.pathname).toBe('/child-2/grand-child-2');
        expect(screen.queryByText('Great Grand Child 2')).toBeTruthy();
    });

    test('Resolves to wildcard route when no <State/> matches URL', () => {
        renderWithNavigation([
            <State key='1' id='parent' path='/parent'/>,
            <State key='2' id='*' component={generic('Wildcard Route')}/>
        ],
        [ '/no-route-found' ]);

        expect(screen.queryByText('Wildcard Route')).toBeTruthy();
    });

    test('renders nothing instead of crashing when no <State/> matches URL', () => {
        renderWithNavigation(<State id='parent' path='/parent'/>, [ '/no-route-found' ]);
        expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/No <State\/> configuration matches URL/));
    });

    test('Transitions state & resolves URL upon event emission', () => {
        const [ history ] = renderWithNavigation(<State id='parent'>
            <State id='child-1' path='/child-1' component={({ machine }) => <div>
                    <h1>Child 1</h1>
                    <button onClick={event => machine.send('test-event-1')}>Fire event</button>
                </div>}>
                <Transition event='test-event-1' target='child-2'/>
            </State>
            <State id='child-2' path='/child-2' component={generic('Child 2')}/>
        </State>);

        expect(history.location.pathname).toBe('/child-1');
        expect(screen.queryByText('Child 1')).toBeTruthy();
        expect(screen.queryByText('Fire event')).toBeTruthy();

        fireEvent.click(screen.queryByText(/Fire event/i));
        expect(history.location.pathname).toBe('/child-2');
        expect(screen.queryByText('Child 2')).toBeTruthy();
    });

    test('Transitions state & resolves URL upon event emission, even if the <Transition/> is an ancestor', () => {
        const [ history ] = renderWithNavigation(<State id='parent'>
            <Transition event='test-event-1' target='child-2'/>
            <State id='child-1' path='/child-1' component={({ machine }) => <div>
                Child 1
                <button onClick={event => machine.send('test-event-1')}>Fire event</button>
            </div>}/>
            <State id='child-2' path='/child-2' component={generic('Child 2')}/>
        </State>);

        expect(history.location.pathname).toBe('/child-1');
        expect(screen.queryByText('Child 1')).toBeTruthy();
        expect(screen.queryByText('Fire event')).toBeTruthy();

        fireEvent.click(screen.queryByText(/Fire event/i));
        expect(screen.queryByText('Child 2')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-2');
    });

    test('Selects proper transition when multiple transitions exist', () => {
        const [ history ] = renderWithNavigation(<State id='parent'>
            <Transition event='test-event-1' target='child-2'/>
            <Transition event='test-event-1' target='child-3'/>
            <State id='child-1' path='/child-1' component={({ machine }) => <div>
                Child 1
                <button onClick={event => machine.send('test-event-1')}>Fire event</button>
            </div>}>
                <Transition event='test-event-1' target='child-3'/>
                <Transition event='test-event-1' target='child-2'/>
            </State>
            <State id='child-2' path='/child-2' component={generic('Child 2')}/>
            <State id='child-3' path='/child-3' component={generic('Child 3')}/>
        </State>);

        expect(screen.queryByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(screen.queryByText(/Fire event/i));
        expect(screen.queryByText('Child 3')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-3');
    });

    test('Transitions state & resolves URL when target state is descendant, while "path" attribute is in ascestor', () => {
        const [ history ] = renderWithNavigation(<State id='parent'>
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

        expect(screen.queryByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(screen.queryByText(/Fire event/i));
        expect(screen.queryByText('Grand Child 2')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-2');
    });

    test('Transitions state & resolves URL when target state is descendant & NOT initial state, while "path" attribute is in ascestor', () => {
        const [ history ] = renderWithNavigation(<State id='parent'>
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

        expect(screen.queryByText('Child 1')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-1/grand-child-1');
        fireEvent.click(screen.queryByText(/Fire event/i));
        expect(screen.queryByText('Grand Child 2-2')).toBeTruthy();
        expect(history.location.pathname).toBe('/child-2');
    });

    test('Resolves to proper state on native browser navigation', () => {
        const [ history ] = renderWithNavigation(<State id='parent'>
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
        </State>,
        [ '/child-1/grand-child-1', '/child-2', '/child-3', '/child-4']);

        expect(history.location.pathname).toBe('/child-4');
        expect(screen.queryByText('Grand Child 4-1')).toBeTruthy();

        act(() => history.back());
        expect(history.location.pathname).toBe('/child-3');
        expect(screen.queryByText('Grand Child 3')).toBeTruthy();

        act(() => history.back());
        expect(history.location.pathname).toBe('/child-2');
        expect(screen.queryByText('Child 2')).toBeTruthy();

        act(() => history.back());
        expect(history.location.pathname).toBe('/child-1/grand-child-1');
        expect(screen.queryByText('Grand Child 1')).toBeTruthy();

        act(() => history.forward());
        expect(history.location.pathname).toBe('/child-2');
        expect(screen.queryByText('Child 2')).toBeTruthy();

        act(() => history.forward());
        expect(history.location.pathname).toBe('/child-3');
        expect(screen.queryByText('Grand Child 3')).toBeTruthy();

        act(() => history.forward());
        expect(history.location.pathname).toBe('/child-4');
        expect(screen.queryByText('Grand Child 4-1')).toBeTruthy();
    });

    test('Ignores changes in URL hash if "ignoreHash" prop is present', () => {
        const [ history ] = renderWithNavigation(<State id='parent' path='/parent'>
            <State id='child-1' component={({ machine }) => <div>
                <h1>Child 1</h1>
                <button onClick={event => machine.send('test-event-1')}>Fire event</button>
            </div>}>
                <Transition event='test-event-1' target='child-2'/>
            </State>
            <State id='child-2' component={genericWithLinks('Child 2')}/>
        </State>,
        [ '/parent?search=true#hash=true' ],
        { ignoreHash: true });

        expect(history.location.pathname).toBe('/parent');
        expect(history.location.hash).toBe('#hash=true');
        
        fireEvent.click(screen.queryByText(/Fire event/i));
        expect(history.location.pathname).toBe('/parent');
        expect(history.location.hash).toBe('#hash=true');
        expect(screen.queryByText('Child 2')).toBeTruthy();
        
        act(() => history.push({ hash: null }));
        expect(history.location.pathname).toBe('/parent');
        expect(history.location.hash).toBeNull();
        expect(screen.queryByText('Child 2')).toBeTruthy();
    });

    test('Passes on guarded <Transition/>s', () => {
        renderWithNavigation(<State id='parent'>
            <State id='child-1' component={({ machine }) => <div>
                <h1>Child 1</h1>
                <button onClick={event => machine.send('test-event')}>Fire event</button>
            </div>}>
                <Transition cond={false} event='test-event' target='child-2'/>
                <Transition event='test-event' target='child-3'/>
            </State>
            <State id='child-2' component={generic('Child 2')}/>
            <State id='child-3' component={generic('Child 3')}/>
        </State>);

        expect(screen.queryByText('Child 1')).toBeTruthy();
        fireEvent.click(screen.queryByText(/Fire event/i));
        expect(screen.queryByText('Child 3')).toBeTruthy();
    });

    test.skip('Preserves query parameters when resolving url', () => {

    });

    test.skip('Translates the URL into dynamic segment when applicable', () => {
        renderWithNavigation(<State id='parent' path='/parent' component={generic('Parent')}>
            <State id='child' path='/:parent'>
                <State id='grand-child' path='/child'>
                    <State id='great-grand-child' path='/:child' component={genericWithParams('Child')}/>
                </State>
            </State>
        </State>,
        [ '/parent/marlin/grand-child/nemo' ]);

        expect(screen.queryByText('parent: marlin')).toBeTruthy();
        expect(screen.queryByText(/child\n:\nnemo/)).toBeTruthy();
        expect(container.firstChild).toMatchSnapshot();
    });

    test.skip('Discards events that result in mo matching transition', () => {
        const Parent = ({ children, machine: { send } }) => {
            useEffect(() => { send('transition'); }, []);
            return children;
        }

        renderWithNavigation(<State id='parent' component={Parent}>
            <Transition event='transition' target='child-2'/>
            <State id='child' component={generic('Child')}/>
        </State>);
    });

    test.skip('Throws error when two <State/>s have the same "id" attribute', () => {

    });

    test('Resolves URL and executes transition simultaneously on mount', () => {
        const Parent = ({ children, machine: { send } }) => {
            useEffect(() => { send('transition'); }, []);
            return children;
        }

        const [ history ] = renderWithNavigation(<State id='parent' component={Parent}>
                <Transition event='transition' target='child'/>
                <State id='loading' component={generic('Loading...')}/>
                <State id='child' path='/child' component={generic('Child')}/>
            </State>);

        expect(history.location.pathname).toBe('/child');
        expect(screen.queryByText('Child')).toBeTruthy();
    });
});
