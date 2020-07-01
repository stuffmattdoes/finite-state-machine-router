import React from 'react';
import { Machine, State, Transition } from '.';
import {
    // getChildrenOfType,
    classNames,
    fakeUUID,
    getChildStateNodes,
    getInitialChildStateNode,
    injectUrlParams,
    isCurrentStack,
    isExactStack,
    normalizeChildStateProps,
    resolveSeedToAtomic,
    getAtomic,
    selectTransition
} from './util';

describe('utility functions', () => {
    const MachineSimple = <Machine id='home'>
        <State id='child'/>
    </Machine>;
    const MachineComplex = <Machine id='home'>
        <State id='parent'>
            <State id='child-1'>
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
            <State id='child-1' path='/child-1'>
                <Transition event='test-event' target='child-2'/>
                <State id='grand-child'/>
            </State>
            <State id='child-2'/>
        </State>
        <State id='parent-2'>
            <State id='child-3'/>
        </State>
    </Machine>;
    const normalizedSimple = normalizeChildStateProps(React.Children.toArray(MachineSimple.props.children), 'home');
    const normalizedComplex = normalizeChildStateProps(React.Children.toArray(MachineComplex.props.children), 'home');
    const normalizedPaths = normalizeChildStateProps(React.Children.toArray(MachineWithPaths.props.children), 'home');

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

    test('fakeUUID', () => {
        expect(fakeUUID()).toEqual(expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/));
    });

    test('getChildStateNodes', () => {
        const childrenSimple = getChildStateNodes(React.Children.toArray(MachineSimple.props.children))
            .every(child => child.type.displayName === 'State');
        const childrenComplex = getChildStateNodes(React.Children.toArray(MachineComplex.props.children))
            .every(child => child.type.displayName === 'State');
        const childrenPaths = getChildStateNodes(React.Children.toArray(MachineWithPaths.props.children))
            .every(child => child.type.displayName === 'State');
        
        expect(childrenSimple).toBe(true);
        expect(childrenComplex).toBe(true);
        expect(childrenPaths).toBe(true);
    });

    test('getInitialChildStateNode', () => {
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

    test('normalizeChildStateProps', () => {
        expect(normalizedSimple).toMatchSnapshot();
        expect(normalizedComplex).toMatchSnapshot();
        expect(normalizedPaths).toMatchSnapshot();
    });

    test('resolveSeedToAtomic', () => {
        expect(resolveSeedToAtomic('/', normalizedSimple, 'home')).toMatchSnapshot();
        expect(resolveSeedToAtomic('/', normalizedComplex, 'home')).toMatchSnapshot();
        expect(resolveSeedToAtomic('/parent-id/child-1', normalizedPaths, 'home')).toMatchSnapshot();
    })

    test('getAtomic', () => {
        expect(getAtomic('#home.child', normalizedSimple)).toMatchSnapshot();
        expect(getAtomic('#home.parent.child-1', normalizedComplex)).toMatchSnapshot();
        expect(getAtomic('#home.parent.child-2', normalizedPaths)).toMatchSnapshot();
    });

    test('selectTransition', () => {
        expect(selectTransition('no-matching-event', '#home.parent.child-1', normalizedComplex)).toBe(null);
        expect(selectTransition('test-event', '#home.parent.child-1', normalizedComplex)).toMatchSnapshot();
    });
});
