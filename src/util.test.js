import React from 'react';
import State from './State';
import Transition from './Transition';
import {
    // getChildrenOfType,
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
    // describe('getChildrenOfType', () => {

    // });

    test('getChildStateNodes', () => {
        const components = <State id='parent'>
            <State id='child-1'>
                <Transition event='test-event-1' target='child-2'/>
            </State>
            <State id='child-2'/>
        </State>;

        const childStates = getChildStateNodes(components).every(child => child.type.displayName === 'State');
        expect(childStates).toBe(true);
    });

    test('getInitialChildStateNode', () => {
        const componentsWithoutInitial = [
            <State id='child-1'/>,
            <State id='child-2'/>
        ];

        const componentsWithInitial = [
            <State id='child-1'/>,
            <State id='child-2' initial/>
        ];

        const result1 = getInitialChildStateNode(getChildStateNodes(componentsWithoutInitial)).props.id;
        const result2 = getInitialChildStateNode(getChildStateNodes(componentsWithInitial)).props.id;

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

    // describe('isCurrentStack', () => {

    // });

    // describe('isExactStack', () => {

    // });

    // describe('normalizeChildStateProps', () => {

    // });

    // describe('resolveInitial', () => {

    // });

    // describe('resolveToAtomic', () => {

    // });

    // describe('selectTransition', () => {

    // });
});
