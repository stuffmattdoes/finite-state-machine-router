import React from 'react';
import { Machine, State, Transition } from '..';
import {
    classNames,
    getChildStateNodes,
    injectUrlParams,
    isCurrentStack,
    isExactStack,
    normalizeChildStateProps,
    resolveUrlToAtomic,
    getAtomic,
    selectTransition
} from '../util';

describe('utility functions', () => {
    const MachineSimple = <Machine id='home'>
        <State id='child'/>
    </Machine>;

    const MachineComplex = (cond) => <Machine id='home'>
        <State id='parent'>
            <State id='child-1'>
                <Transition cond={cond} event='test-event' target='child-3'/>
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

    const normalizedSimple = normalizeChildStateProps(MachineSimple.props.children, 'home');
    const normalizedComplex = normalizeChildStateProps(MachineComplex(false).props.children, 'home');
    const normalizedGuard = normalizeChildStateProps(MachineComplex(true).props.children, 'home');
    const normalizedPaths = normalizeChildStateProps(MachineWithPaths.props.children, 'home');

    test.skip('classNames', () => { 
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
        const childrenSimple = getChildStateNodes(MachineSimple.props.children)
            .every(child => child.type.displayName === 'State');
        const childrenComplex = getChildStateNodes(MachineComplex(false).props.children)
            .every(child => child.type.displayName === 'State');
        const childrenPaths = getChildStateNodes(MachineWithPaths.props.children)
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

        const result1 = getInitialChildStateNode(getChildStateNodes(machineWithoutInitial)).props.id;
        const result2 = getInitialChildStateNode(getChildStateNodes(machineWithInitial)).props.id;

        expect(result1).toBe('child-1');
        expect(result2).toBe('child-2');
    });

    test.skip('injectUrlParams', () => {
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

    test.skip('isCurrentStack', () => {
        expect(isCurrentStack('child-1', '#home.parent.child-1.grand-child')).toBe(true);
        expect(isCurrentStack('child-2', '#home.parent.child-1.grand-child')).toBe(false);
        expect(isCurrentStack('grand-child', '#home.parent.child-1.grand-child')).toBe(true);
    });

    test.skip('isExactStack', () => {
        expect(isExactStack('child-1', '#home.parent.child-1.grand-child')).toBe(false);
        expect(isExactStack('child-2', '#home.parent.child-1.grand-child')).toBe(false);
        expect(isExactStack('grand-child', '#home.parent.child-1.grand-child')).toBe(true);
    });

    test.skip('normalizeChildStateProps', () => {
        expect(normalizedSimple).toMatchSnapshot();
        expect(normalizedComplex).toMatchSnapshot();
        expect(normalizedPaths).toMatchSnapshot();
    });

    test.skip('resolveUrlToAtomic', () => {
        expect(resolveUrlToAtomic('/', normalizedSimple, 'home')).toMatchSnapshot();
        expect(resolveUrlToAtomic('/', normalizedComplex, 'home')).toMatchSnapshot();
        expect(resolveUrlToAtomic('/parent-id/child-1', normalizedPaths, 'home')).toMatchSnapshot();
    })

    test.skip('getAtomic', () => {
        expect(getAtomic('#home.child', normalizedSimple)).toMatchSnapshot();
        expect(getAtomic('#home.parent.child-1', normalizedComplex)).toMatchSnapshot();
        expect(getAtomic('#home.parent.child-2', normalizedPaths)).toMatchSnapshot();
    });

    test.skip('selectTransition', () => {
        expect(selectTransition('no-matching-event', '#home.parent.child-1', normalizedComplex)).toBe(null);
        expect(selectTransition('test-event', '#home.parent.child-1', normalizedComplex)).toHaveProperty('target', 'child-2');
        expect(selectTransition('test-event', '#home.parent.child-1', normalizedGuard)).toHaveProperty('target', 'child-3');
    });

});
