import React from 'react';
import { createMemoryHistory } from 'history';
import { Link, Machine, State, Transition } from '.';
import { cleanup, render, fireEvent } from '@testing-library/react';

describe('<Link/>', () => {
    afterEach(cleanup);

    const generic = (name) => ({ children }) => <div><h1>{name}</h1>{children}</div>;
    const genericWithLinks = (name) => (props) => <div>
        <h1>{name}</h1>
        <Link href='/child-2'>URL Push</Link>
        <Link href='/child-2' replace>URL Replace</Link>
    </div>;
    const renderWithNavigation = (path, element) => {
        const testHistory = createMemoryHistory({ initialEntries: [ path ] });
        const machine = <Machine history={testHistory} id='home' path={path}>
            <State id='parent'>
                <State id='child' component={element} path='/child-1'>
                </State>
                <State id='child-2' component={generic('Child 2')} path='/child-2'>
                    <State id='granc-child-2' component={generic('Grand Child 2')}/>
                </State>
            </State>
        </Machine>;

        return [ testHistory, machine ];
    }

    test('Build verification', () => {
        const [ history, machine ] = renderWithNavigation('/', genericWithLinks('Child 1'));
        const { getByText } = render(machine);

        expect(history.location.pathname).toBe('/child-1');
        expect(getByText('URL Push')).toBeTruthy();
        expect(getByText('URL Replace')).toBeTruthy();
    });

    test('Pushes URL to history by default', () => {
        const [ history, machine ] = renderWithNavigation('/', genericWithLinks('Child 1'));
        const { getByText } = render(machine);

        expect(history.location.pathname).toBe('/child-1');
        expect(getByText('Child 1')).toBeTruthy();
        fireEvent.click(getByText(/URL Push/));
        expect(history.location.pathname).toBe('/child-2');
        expect(history.action).toBe('PUSH');
        expect(getByText('Grand Child 2')).toBeTruthy();
    });

    test.skip('Replaces URL in history if "replace" attribute is true and is clicked', () => {
        const [ history, machine ] = renderWithNavigation('/', genericWithLinks('Child 1'));
        const { getByText } = render(machine);
        // const assign = jest.spyOn(window.location, 'assign');
        // const replace = window.location.replace;
        // window.location.replace = jest.fn();

        expect(history.location.pathname).toBe('/child-1');
        expect(getByText(/Child 1/)).toBeTruthy();
        fireEvent.click(getByText(/URL Replace/));
        expect(history.location.pathname).toBe('/child-2');
        expect(history.action).toBe('REPLACE');
        expect(getByText('Grand Child 2')).toBeTruthy();

        // window.location.replace = replace;
    });

    // test('Replaces URL when link for current path is clicked without state', () => {
        
    // });

    // test('Replaces URL when link for current path is clicked with the same state', () => {

    // });

    // test('Pushes URL when link for current path is clicked with different state', () => {

    // });

    test('Ignores clicks when disabled', () => {
        const mockFn = jest.fn();
        const [ history, machine ] = renderWithNavigation('/', (props) => <div>
            <h1>{name}</h1>
            <Link href='/child-2' disabled onClick={mockFn}>URL Disabled</Link>
        </div>);
        const { getByText } = render(machine);
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(getByText('URL Disabled'));
        expect(history.location.pathname).toBe('/child-1');
        expect(mockFn).not.toHaveBeenCalled();
    });
});