import React from 'react';
import Machine from './Machine';
import State from './State';
import Transition from './Transition';
import {
    // getChildrenOfType,
    classNames,
    getChildStateNodes,
    getInitialChildStateNode,
    injectUrlParams,
    isCurrentStack,
    isExactStack,
    normalizeChildStateProps,
    resolveInitial,
    resolveToAtomic,
    selectTransition
} from './util';

describe('utility functions', () => {
    const machine = <Machine id='home' path='/home'>
            <State id='parent' path='/:parent'>
            <State id='child-1' path='/child-1'>
                <Transition event='test-event' target='child-2'/>
                <State id='grand-child'/>
            </State>
            <State id='child-2'/>
        </State>
    </Machine>;
    const normalized = normalizeChildStateProps(React.Children.toArray(machine.props.children), 'home');

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

    test('getChildStateNodes', () => {
        const childStates = getChildStateNodes(machine.props.children).every(child => child.type.displayName === 'State');
        expect(childStates).toBe(true);
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

        const result1 = getInitialChildStateNode(getChildStateNodes(machineWithoutInitial)).props.id;
        const result2 = getInitialChildStateNode(getChildStateNodes(machineWithInitial)).props.id;

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

    test('normalizeChildStateProps', () => expect(normalized).toMatchSnapshot());

    test('resolveInitial', () => {
        expect(resolveInitial('/parent-id/child-1', normalized, 'home')).toMatchSnapshot();
    })

    test('resolveToAtomic', () => {
        expect(resolveToAtomic('#home.parent', normalized)).toMatchSnapshot();
        expect(resolveToAtomic('#home.parent.child-1', normalized)).toMatchSnapshot();
        expect(resolveToAtomic('#home.parent.child-2', normalized)).toMatchSnapshot();
    });

    test('selectTransition', () => {
        expect(selectTransition('no-matching-event', '#home.parent.child-1', normalized)).toBe(null);
        expect(selectTransition('test-event', '#home.parent.child-1', normalized)).toMatchSnapshot();
    });
});
