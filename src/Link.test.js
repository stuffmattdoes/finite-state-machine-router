import React from 'react';
import { createMemoryHistory } from 'history';
import { Link, Machine, State, Transition } from '.';
import { render, fireEvent } from '@testing-library/react';

describe('<Link/>', () => {
    const generic = (name) => ({ children }) => <div><h1>{name}</h1>{children}</div>;
    const genericWithLinks = (name) => (props) => <div>
        <h1>{name}</h1>
        <Link href='/child-2'>URL Push</Link>
        <Link href='/child-2' replace>URL Replace</Link>
    </div>;
    const renderWithNavigation = (element) => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const machine = <Machine history={testHistory} id='home' path={initialUrl}>
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
        const [ history, machine ] = renderWithNavigation(genericWithLinks('Child 1'));
        const { getByText } = render(machine);

        expect(history.location.pathname).toBe('/child-1');
        expect(getByText('URL Push')).toBeTruthy();
        expect(getByText('URL Replace')).toBeTruthy();
    });

    test('Pushes URL to history by default', () => {
        const [ history, machine ] = renderWithNavigation(genericWithLinks('Child 1'));
        const { getByText } = render(machine);

        expect(history.location.pathname).toBe('/child-1');
        expect(getByText('Child 1')).toBeTruthy();
        fireEvent.click(getByText(/URL Push/));
        expect(history.location.pathname).toBe('/child-2');
        expect(history.action).toBe('PUSH');
        expect(getByText('Grand Child 2')).toBeTruthy();
    });

    test.skip('Replaces URL in history if "replace" attribute is true and is clicked', () => {
        const [ history, machine ] = renderWithNavigation(genericWithLinks('Child 1'));
        const { getByText } = render(machine);

        expect(history.location.pathname).toBe('/child-1');
        expect(getByText(/Child 1/)).toBeTruthy();
        fireEvent.click(getByText(/URL Replace/));
        console.log(history);
        expect(history.location.pathname).toBe('/child-2');
        expect(history.action).toBe('REPLACE');
        expect(getByText('Grand Child 2')).toBeTruthy();
    });

    // test('Replaces URL when link for current path is clicked without state', () => {
        
    // });

    // test('Replaces URL when link for current path is clicked with the same state', () => {

    // });

    // test('Pushes URL when link for current path is clicked with different state', () => {

    // });

    test('Ignores clicks when disabled', () => {
        const [ history, machine ] = renderWithNavigation((props) => <div>
            <h1>{name}</h1>
            <Link href='/child-2' disabled>URL Disabled</Link>
        </div>);
        const { getByText } = render(machine);
        expect(history.location.pathname).toBe('/child-1');
        fireEvent.click(getByText('URL Disabled'));
        expect(history.location.pathname).toBe('/child-1');
        expect(history.length).toBe(2);
    });
});