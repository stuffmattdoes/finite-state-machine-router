import React from 'react';
import { createMemoryHistory } from 'history';
import renderer from 'react-test-renderer';
import { Link, Machine, State, Transition } from '.';

describe('<Machine/>', () => {
    const MachineSimple = <Machine id='home'>
        <State id='child'/>
    </Machine>;
    const Child1 = (props) => <div>
        <Link event='link-event'>Link Event</Link>
        <Link href='/home'>Link Event</Link>
    </div>
    const MachineComplex = <Machine id='home'>
        <State id='parent'>
            <State id='child-1' component={Child1}>
                <Transition event='test-event' target='child-2'/>
                <State id='grand-child'/>
            </State>
            <State id='child-2'/>
        </State>
        <State id='parent-2'>
            <State id='child-3'/>
        </State>
    </Machine>;

    const MachineWithPaths = <Machine id='home' path='/home'>
        <State id='parent' path='/:parent'>
            <State id='child-1' path='/child-1' component={Child1}>
                <Transition event='test-event' target='child-2'/>
                <State id='grand-child'/>
            </State>
            <State id='child-2' component={(props) => <div>Child 1</div>}/>
        </State>
        <State id='parent-2'>
            <State id='child-3'/>
        </State>
    </Machine>;

    test('Renders the minimum necessary components for a valid <Machine/>', () => {
        const wrapper = renderer.create(MachineSimple);
        expect(wrapper.toJSON()).toMatchSnapshot();
    });

    test('Renders <Machine/> content that does not contain any URLs', () => {
        const wrapper = renderer.create(MachineComplex);
        expect(wrapper.toJSON()).toMatchSnapshot();
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

        expect(wrapper.toJSON()).toMatchSnapshot();
    });
});