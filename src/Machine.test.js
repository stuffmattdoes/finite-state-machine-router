import React from 'react';
import { createMemoryHistory } from 'history';
import renderer from 'react-test-renderer';
import { Link, Machine, State, Transition } from '.';

describe('<Machine/>', () => {
    test.skip('Renders the minimum necessary components for a valid <Machine/>', () => {
        const wrapper = renderer.create(<Machine id='home'>
            <State id='child'/>
        </Machine>);

        expect(wrapper.toJSON()).toMatchSnapshot();
    });

    test.skip('Renders <Machine/> content that does not contain any URLs', () => {
        const wrapper = renderer.create(<Machine id='home'>
            <State id='child-1' component={(props) => <div>
                <Link event='link-event'>Link Event</Link>
                <Link href='/home'>Link Event</Link>
            </div>}>
                <State id='grand-child'>
                    <State id='great-grand-child'/>
                </State>
            </State>
            <State id='child-2' component={(props) => <h1>Child 2</h1>} />
        </Machine>);

        expect(wrapper.toJSON()).toMatchSnapshot(); // renders as DOM elements
    });

    test.skip('Renders <Machine/> content at \'/\'', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const wrapper = renderer.create(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='child-1' path='/child-1' component={(props) => <div>
                <Link event='link-event'>Link Event</Link>
                <Link href='/home'>Link Event</Link>
            </div>}>
                <State id='grand-child'>
                    <State id='great-grand-child'/>
                </State>
            </State>
            <State id='child-2' component={(props) => <h1>Child 2</h1>} path='/child-2'/>
        </Machine>);

        expect(wrapper.toJSON()).toMatchSnapshot(); // renders as DOM elements
    });
});