import {
    deriveStateFromUrl,
    getChildStateNodes,
    getChildrenOfType,
    getInitialChildStateNode,
    injectUrlParams,
    isCurrentStack,
    isExactStack,
    isDynamicSegment,
    isDynamicPath,
    isRootSemgent,
    isRootStack,
    isNotFound,
    normalizeChildStateProps,
    resolveInitial,
    resolveToAtomic,
    segmentize,
    selectTransition
} from './util';

describe('utility functions', () => {
    describe('isDynamicSegment', () => {
        test('Identifies dynamic URL segments', () => {
            expect(isDynamicSegment(':isDynamic')).toBe(true);
        });

        test('Ignores static URL segments', () => {
            expect(isDynamicSegment('is-not-dynamic')).toBe(false);
        });
    });
});
