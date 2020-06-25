import React from 'react';
import { createMemoryHistory } from 'history';
import renderer from 'react-test-renderer';
import { Link, Machine, State, Transition } from '.';

describe('<Machine/>', () => {
    const Child1 = (props) => <div>
        <Link event='link-event'>Link Event</Link>
        <Link href='/home'>Link Event</Link>
    </div>
    const Child2 = ({ children }) => <div>Child 2 {children}</div>;
    const MachineSimple = <Machine id='home'>
        <State id='child' component={Child1}/>
    </Machine>;
    const MachineComplex = <Machine id='home'>
        <State id='parent'>
            <State id='child-1' component={Child1}>
                <Transition event='test-event' target='child-2'/>
                <State id='grand-child'/>
            </State>
            <State id='child-2' component={Child2}/>
        </State>
        <State id='parent-2'>
            <State id='child-3'/>
        </State>
    </Machine>;

    // const MachineWithPaths = <Machine id='home' path='/home'>
    //     <State id='parent' path='/:parent'>
    //         <State id='child-1' path='/child-1' component={Child1}>
    //             <Transition event='test-event' target='child-2'/>
    //             <State id='grand-child'/>
    //         </State>
    //         <State id='child-2' component={Child2}/>
    //     </State>
    //     <State id='parent-2'>
    //         <State id='child-3' path='/child-3'/>
    //     </State>
    // </Machine>;

    test('Renders the minimum necessary components for a valid <Machine/>', () => {
        const wrapper = renderer.create(MachineSimple);
        expect(wrapper.toJSON()).toMatchSnapshot();
    });

    test('Renders <Machine/> content that does not contain any URLs', () => {
        const wrapper = renderer.create(MachineComplex);
        expect(wrapper.toJSON()).toMatchSnapshot();
    });

    test('Renders <Machine/> content at \'/\'', () => {
        const initialUrl = '/';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const wrapper = renderer.create(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='child-1' path='/child-1' component={Child1}>
                <State id='grand-child'>
                    <State id='great-grand-child'/>
                </State>
            </State>
            <State id='child-2' component={Child2} path='/child-2'/>
        </Machine>);

        expect(wrapper.toJSON()).toMatchSnapshot();
    });

    test('Resolves ito nitial <State/> node lineage', () => {
        const wrapper = renderer.create(<Machine id='home'>
            <State id='parent'>
                <State id='child-1' component={Child1}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                </State>
                <State id='child-2' initial component={Child2}/>
            </State>
            <State id='parent-2'>
                <State id='child-3'/>
            </State>
        </Machine>);

        const wrapper2 = renderer.create(<Machine id='home'>
            <State id='parent'>
                <State id='child-1' component={Child1}>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                </State>
                <State id='child-2' component={Child2}/>
            </State>
            <State id='parent-2' initial>
                <State id='child-3' component={Child1}/>
            </State>
        </Machine>);

        expect(wrapper.toJSON()).toMatchSnapshot();
        expect(wrapper2.toJSON()).toMatchSnapshot();
    });

    test('Resolves to an atomic <State/> form a URL', () => {
        const initialUrl = '/child-2';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const wrapper = renderer.create(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='child-1' path='/child-1' component={Child1}>
                <State id='grand-child'>
                    <State id='great-grand-child-1'/>
                </State>
            </State>
            <State id='child-2' component={Child2} path='/child-2'>
                <State id='great-grand-child-2' component={Child2}/>
            </State>
        </Machine>);

        expect(wrapper.toJSON()).toMatchSnapshot();
    });

    test('Resolves to wildcard route when no <State/> matches URL', () => {
        const initialUrl = '/no-route-found';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const wrapper = renderer.create(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent' path='/parent'/>
            <State id='*' component={(props) => <div>Wildcard Route</div>}/>
        </Machine>);

        expect(wrapper.toJSON()).toMatchSnapshot();
    });

    test('Returns "null" instead of crashing when no <State/> matches URL', () => {
        const consoleWarn = console.warn;
        global.console.warn = jest.fn();
        const initialUrl = '/no-route-found';
        const testHistory = createMemoryHistory({ initialEntries: [ initialUrl ] });
        const wrapper = renderer.create(<Machine history={testHistory} id='home' path={initialUrl}>
            <State id='parent' path='/parent'/>
        </Machine>);

        expect(wrapper.toJSON()).toMatchSnapshot();
        expect(console.warn).toHaveBeenCalledWith('No <State/> configuration matches URL "/no-route-found, and no catch-all <State id=\'*\' path=\'/404\'/> exists. Consider adding one.');
        global.console.warn = consoleWarn;  // Restore console.warn
    });
});