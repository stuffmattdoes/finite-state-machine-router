import React from 'react';
import { Machine, State, Transition } from '..';
import {
    classNames,
    fakeUUID,
    getChildStateNodes,
    injectUrlParams,
    isCurrentStack,
    isExactStack,
    normalizeChildren,
    normalizeChildStateProps,
    resolveUrlToAtomic,
    getAtomic,
    selectTransition
} from '../util';

describe('Utility functions', () => {
    const MachineSimple = <Machine id='home'>
        <State id='child'/>
    </Machine>;

    const MachineComplex = (cond) => <Machine id='home'>
        <State id='parent'>
            <State id='child-1'>
                {/* <div> */}
                    <Transition cond={cond} event='test-event' target='child-3'/>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                {/* </div> */}
            </State>
            <State id='child-2'/>
        </State>
        <State id='parent-2'>
            <State id='child-3'/>
        </State>
    </Machine>;

    const MachineWithPaths = (cond) => <Machine id='home' path='/home'>
        <State id='parent' path='/:parent'>
            <State id='child-1' path='/child-1'>
                {/* <div> */}
                    <Transition cond={cond} event='test-event' target='child-3'/>
                    <Transition event='test-event' target='child-2'/>
                    <State id='grand-child'/>
                {/* </div> */}
            </State>
            <State id='child-2'/>
        </State>
        <State id='parent-2'>
            <State id='child-3'/>
        </State>
    </Machine>;

    const normalizedSimple = normalizeChildStateProps(React.Children.toArray(MachineSimple.props.children), 'home');
    const normalizedComplex = normalizeChildStateProps(React.Children.toArray(MachineComplex(false).props.children), 'home');
    const normalizedGuard = normalizeChildStateProps(React.Children.toArray(MachineComplex(true).props.children), 'home');
    const normalizedPaths = normalizeChildStateProps(React.Children.toArray(MachineWithPaths(false).props.children), 'home');
    const normalizedPathsGuard = normalizeChildStateProps(React.Children.toArray(MachineWithPaths(true).props.children), 'home');

    test('classNames', () => { 
        const className = [
            'custom-class',
            { 'should-display': true },
            { 'should-not-display': false }
        ];

        const className2 = [
            { 'should-not-display': false }
        ];

        expect (classNames(className)).toBe('custom-class should-display');
        expect (classNames(className2)).toBeNull();
    });

    test.skip('fakeUUID', () => {
        expect(fakeUUID()).toEqual(expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/));
    });

    test('getChildStateNodes', () => {
        const childrenSimple = getChildStateNodes(React.Children.toArray(MachineSimple.props.children))
            .every(child => child.type.displayName === 'State');
        const childrenComplex = getChildStateNodes(React.Children.toArray(MachineComplex(false).props.children))
            .every(child => child.type.displayName === 'State');
        const childrenPaths = getChildStateNodes(React.Children.toArray(MachineWithPaths(true).props.children))
            .every(child => child.type.displayName === 'State');
        
        expect(childrenSimple).toBe(true);
        expect(childrenComplex).toBe(true);
        expect(childrenPaths).toBe(true);
    });

    test.skip('getInitialChildStateNode', () => {
        const machineWithoutInitial = [
            <State id='child-1'/>,
            <State id='child-2'/>
        ];

        const machineWithInitial = [
            <State id='child-1'/>,
            <State id='child-2' initial/>
        ];

        const result1 = getInitialChildStateNode(getChildStateNodes(React.Children.toArray(machineWithoutInitial))).props.id;
        const result2 = getInitialChildStateNode(getChildStateNodes(React.Children.toArray(machineWithInitial))).props.id;

        expect(result1).toBe('child-1');
        expect(result2).toBe('child-2');
    });

    test('injectUrlParams', () => {
        const params = {
            'dynamicPath': 'dynamic-path',
            'anotherDynamicPath': 'another-dynamic-path'
        };

        expect(injectUrlParams('/:dynamicPath', params)).toBe('/dynamic-path');
        expect(injectUrlParams('/:dynamicPath/:anotherDynamicPath', params)).toBe('/dynamic-path/another-dynamic-path');
        expect(injectUrlParams('/:dynamicPath/static-path/:anotherDynamicPath', params)).toBe('/dynamic-path/static-path/another-dynamic-path');
        expect(injectUrlParams('/:dynamicPath/static-path', params)).toBe('/dynamic-path/static-path');
        expect(injectUrlParams('/static-path/:dynamicPath', params)).toBe('/static-path/dynamic-path');
        expect(injectUrlParams('/static-path/:dynamicPath/another-static-path', params)).toBe('/static-path/dynamic-path/another-static-path');
    });

    test.skip('isAtomic', () => {
        const notAtomic = <State id='child-1'>
            <Transition event='test-event' target='child-2'/>
            <State id='grand-child'/>
        </State>;
        const atomic = <State id='child-2'/>;
        
        expect(isAtomic(notAtomic)).toBe(false);
        expect(isAtomic(atomic)).toBe(true);
    });

    test('isCurrentStack', () => {
        expect(isCurrentStack('child-1', '#home.parent.child-1.grand-child')).toBe(true);
        expect(isCurrentStack('child-2', '#home.parent.child-1.grand-child')).toBe(false);
        expect(isCurrentStack('grand-child', '#home.parent.child-1.grand-child')).toBe(true);
    });

    test('isExactStack', () => {
        expect(isExactStack('child-1', '#home.parent.child-1.grand-child')).toBe(false);
        expect(isExactStack('child-2', '#home.parent.child-1.grand-child')).toBe(false);
        expect(isExactStack('grand-child', '#home.parent.child-1.grand-child')).toBe(true);
    });

    test.skip('normalizeChildren', () => {
        const ChildComponent = ({ children }) => <div>{children}</div>;
        ChildComponent.displayName = 'ChildComponent';
        const MachineNested = (cond) => <Machine id='home' path='/home'>
            <State id='parent' path='/:parent'>
                <State id='child-1' path='/child-1'>
                    <ChildComponent>
                        <div>
                            <Transition cond={cond} event='test-event' target='child-3'/>
                            <Transition event='test-event' target='child-2'/>
                            <State id='grand-child'/>
                        </div>
                    </ChildComponent>
                </State>
                <State id='child-2'/>
            </State>
            <State id='parent-2'>
                <div>
                    <State id='child-3'/>
                </div>
            </State>
        </Machine>;
    
        const normalizedChildren = normalizeChildren(React.Children.toArray(MachineNested(true).props.children), 'home');
        expect(normalizedChildren).toMatchInlineSnapshot(`
            Array [
                Object {
                "childStates": Array [
                    "child-1",
                    "child-2",
                ],
                "id": "parent",
                "initial": true,
                "path": "/:parent",
                "stack": "#home.parent",
                "transitions": Array [],
                "type": "compound",
                },
                Object {
                "childStates": Array [
                    "grand-child",
                ],
                "id": "child-1",
                "initial": true,
                "path": "/:parent/child-1",
                "stack": "#home.parent.child-1",
                "transitions": Array [
                    Object {
                    "cond": false,
                    "event": "test-event",
                    "sendId": "child-1",
                    "target": "child-3",
                    },
                    Object {
                    "cond": true,
                    "event": "test-event",
                    "sendId": "child-1",
                    "target": "child-2",
                    },
                ],
                "type": "default",
                },
                Object {
                "childStates": Array [],
                "id": "grand-child",
                "initial": true,
                "path": "/:parent/child-1",
                "stack": "#home.parent.child-1.grand-child",
                "transitions": Array [],
                "type": "atomic",
                },
                Object {
                "childStates": Array [],
                "id": "child-2",
                "initial": false,
                "path": "/:parent",
                "stack": "#home.parent.child-2",
                "transitions": Array [],
                "type": "atomic",
                },
                Object {
                "childStates": Array [
                    "child-3",
                ],
                "id": "parent-2",
                "initial": false,
                "path": "/",
                "stack": "#home.parent-2",
                "transitions": Array [],
                "type": "default",
                },
                Object {
                "childStates": Array [],
                "id": "child-3",
                "initial": true,
                "path": "/",
                "stack": "#home.parent-2.child-3",
                "transitions": Array [],
                "type": "atomic",
                },
            ]
        `);
    });

    test('normalizeChildStateProps', () => {
        expect(normalizedSimple).toMatchSnapshot();
        expect(normalizedComplex).toMatchSnapshot();
        expect(normalizedPaths).toMatchSnapshot();
    });

    test('resolveUrlToAtomic', () => {
        expect(resolveUrlToAtomic('/', normalizedSimple, 'home')).toMatchSnapshot();
        expect(resolveUrlToAtomic('/', normalizedComplex, 'home')).toMatchSnapshot();
        expect(resolveUrlToAtomic('/parent-id/child-1', normalizedPaths, 'home')).toMatchSnapshot();
    })

    test('getAtomic', () => {
        expect(getAtomic('#home.child', normalizedSimple)).toMatchSnapshot();
        expect(getAtomic('#home.parent.child-1', normalizedComplex)).toMatchSnapshot();
        expect(getAtomic('#home.parent.child-2', normalizedPaths)).toMatchSnapshot();
    });

    test('selectTransition', () => {
        expect(selectTransition('no-matching-event', '#home.parent.child-1', normalizedComplex)).toBe(null);
        expect(selectTransition('test-event', '#home.parent.child-1', normalizedComplex)).toHaveProperty('target', 'child-2');
        expect(selectTransition('test-event', '#home.parent.child-1', normalizedGuard)).toHaveProperty('target', 'child-3');
        expect(selectTransition('test-event', '#home.parent.child-1', normalizedPathsGuard)).toHaveProperty('target', 'child-3');
    });
});
