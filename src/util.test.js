import React from 'react';
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
        const machine = <State id='parent'>
            <State id='child-1'>
                <Transition event='test-event-1' target='child-2'/>
            </State>
            <State id='child-2'/>
        </State>;

        const childStates = getChildStateNodes(machine).every(child => child.type.displayName === 'State');
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
        const path1 = '/:dynamicPath';
        const path2 = '/:dynamicPath/:anotherDynamicPath';
        const path3 = '/:dynamicPath/static-path/:anotherDynamicPath';
        const path4 = '/:dynamicPath/static-path';
        const path5 = '/static-path/:dynamicPath';
        const path6 = '/static-path/:dynamicPath/another-static-path';
        const params = {
            'dynamicPath': 'dynamic-path',
            'anotherDynamicPath': 'another-dynamic-path'
        };

        expect(injectUrlParams(path1, params)).toBe('/dynamic-path');
        expect(injectUrlParams(path2, params)).toBe('/dynamic-path/another-dynamic-path');
        expect(injectUrlParams(path3, params)).toBe('/dynamic-path/static-path/another-dynamic-path');
        expect(injectUrlParams(path4, params)).toBe('/dynamic-path/static-path');
        expect(injectUrlParams(path5, params)).toBe('/static-path/dynamic-path');
        expect(injectUrlParams(path6, params)).toBe('/static-path/dynamic-path/another-static-path');
    });

    // test('isCurrentStack', () => {

    // });

    // test('isExactStack', () => {

    // });

    test('normalizeChildStateProps', () => {
        const machine = React.Children.toArray(<State id='parent' path='/parent'>
            <State id='child-1' path='/child-1'>
                <Transition event='test-event' target='child-2'/>
                <State id='grand-child'/>
            </State>
            <State id='child-2'/>
        </State>);

        const childStateNodes = [
            {
                childStates: [ 'child-1', 'child-2' ],
                id: 'parent',
                initial: true,
                path: '/parent',
                stack: '#home.parent',
                transitions: [],
                type: 'compound'
            },
            {
                childStates: [ 'grand-child' ],
                id: 'child-1',
                initial: true,
                path: '/parent/child-1',
                stack: '#home.parent.child-1',
                transitions: [
                    {
                        cond: null,
                        event: 'test-event',
                        sendId: 'child-1',
                        target: 'child-2'
                    }
                ],
                type: 'default'
            },
            {
                childStates: [ 'grand-child' ],
                id: 'grand-child',
                initial: true,
                path: '/parent/child-1',
                stack: '#home.parent.child-1.grand-child',
                transitions: [],
                type: 'atomic'
            },
            {
                childStates: [],
                id: 'child-2',
                initial: false,
                path: '/parent',
                stack: '#home.parent.child-2',
                transitions: [],
                type: 'atomic'
            },
        ];

        expect(normalizeChildStateProps(machine, 'home').toString()).toBe(childStateNodes.toString());
    });

    // test('resolveInitial', () => {

    // });

    // test('resolveToAtomic', () => {

    // });

    // test('selectTransition', () => {

    // });
});
