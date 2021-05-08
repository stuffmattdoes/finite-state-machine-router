import React, { ReactChild } from 'react';

const getChildStateNodes = (children: React.ReactNode[]): React.ReactNode[] => {
    if (React.Children.count(children) > 0) {
        const childrenOfType = getChildrenOfType(children, 'State');
    
        if (childrenOfType.length) {
            return childrenOfType;
        }

        if (children.props && children.props.children) {
            return children.props.children.reduce((acc, child) => {
                acc = acc.concat(getChildrenOfType((child.props.children), 'State'));
                return acc;
            }, []);
        }
    }
    
    return [];
}

type ClasseName = string | { [name: string]: boolean };

const classNames = (classes: ClasseName[]): string => {
    const next = classes.map((className: ClasseName) => {
        switch(typeof className) {
            case 'string':
                return className;
            case 'object':
                return Object.keys(className).filter(key => Boolean(className[key])).join(' ').trim();
            default:
                return '';
        }
    }).join(' ').trim();

    return Boolean(next) ? next : '';
}

const getChildrenOfType = (children: React.ReactNode, type: string): React.ReactNode[] =>
    React.Children.toArray(children).filter((child) => child?.type.displayName === type);
const isCurrentStack = (id: string, stack: string): boolean => !!stack.split('.').find(state => state === id);
const isExactStack = (id: string, stack: string): boolean => stack.split('.').pop() === id;
const isDynamicSegment = (segment: string): boolean => /^:(.+)/.test(segment);
const isRootPath = (path: string): boolean => path === '/';
const isRootSegment = (url: string): boolean => url.slice(1) === '';
const isRootStack = (stack: string): boolean => !stack.match(/\./g);
const isNotFound = (stack: string): boolean => stack.split('.').pop() === '*';
const segmentize = (url: string): string[] => url.split('/').filter(Boolean);

const injectUrlParams = (path: string, params: { [name: string]: string }): string => {
    const url = segmentize(path).map(seg => {
        if (isDynamicSegment(seg)) {
            const param = seg.replace(':', '');

            if (Object.keys(params).includes(param)) {
                return params[param].toString();
            } else {
                console.error(`Cannot push to a dynamic URL without supplying the proper parameters: ${seg} parameter is missing.`);
                return 'undefined';
            }
        }

        return seg;
    }).join('/');

    return '/' + url + (window.location.search ? window.location.search : '');
}

type StateMatch = {
    exact: boolean,
    params: { [key: string]: string },
    path: string,
    stack: string,
    url: string
}

const deriveStateFromUrl = (url: string, normalizedChildStates: NormalizedState[], rootId: string): StateMatch => {
    let match = {
        params: {},
        path: url,
        stack: null
    }

    // 1. Exact match, no dynamic URL needed
    const childMatch = normalizedChildStates.find(norm => norm.path === url);

    if (childMatch) {
        match.path = childMatch.path;
        match.stack = childMatch.stack;
        return match;
    }

    // 1.1 Check if URL is root, return initial stack
    if (isRootSegment(url)) {
        match.stack = normalizedChildStates.find(norm => norm.stack.match(/\./g).length === 1 && norm.initial).stack;
        return match;
    }

    // 2. No exact match yet, compare to dynamic URLs for match
    const dynamicPaths = normalizedChildStates.filter(norm => norm.path && norm.path.match(/\/:/g)).map(norm => norm.path);

    if (dynamicPaths.length) {
        // 2.1 Split url && child paths into arrays, compare 1 by 1
        const urlSegments = segmentize(url);;
        
        // let params = {};
        const dynamicPathMatch = dynamicPaths.find(p => {
            const pathSegments = segmentize(p);
            match.params = {};

            // Can't be a match if our path segments is not the same length as our URL segments
            if (pathSegments.length !== urlSegments.length) {
                return false;
            }

            // TODO
            // path doesn't parse params if complete path match is not found
            return !pathSegments.map((pathSegment, i) => {
                // 2.2 infer parameter from URL from first segment array that matches in length
                if (isDynamicSegment(pathSegment)) {
                    match.params[pathSegment.slice(1)] = urlSegments[i];
                    return true;
                // 2.3 if path segment matches url segment exactly, proceed
                } else if (pathSegment === urlSegments[i]) {
                    return true;
                }

                return false;
            }).includes(false);
        });

        if (dynamicPathMatch) {
            // 2.4 finally, return the stack that corresponds to the URL
            match.path = dynamicPathMatch;
            match.stack = normalizedChildStates.find(norm => norm.path === dynamicPathMatch).stack;;
        }
    }

    // 3.0 if no match, resolve to wildcard route "*""
    if (!match.stack) {
        const notFoundState = normalizedChildStates.find(norm => norm.id === '*');
        match.stack = '#' + rootId + '.*';

        // 3.1 If no wildcard route "*", throw error
        if (!notFoundState) {
            console.warn(`No <State/> configuration matches URL "${url}, and no catch-all <State id='*' path='/404'/> exists. Consider adding one.`);
        }
    }

    return match;
}

type TransitionType = {
    cond: boolean,
    event: string,
    sendId: string,
    target: string
}

type NormalizedState = {
    childStates: string[],
    id: string,
    initial: boolean,
    path: string,
    stack: string,
    transitions: TransitionType[],
    type: 'atomic' | 'compound' | 'default' | 'parallel'
}

const normalizeChildStateProps = (stateNodes, rootId): NormalizedState[] => {
    const normalizeLoop = (stateNodes) => {
        let initialIndex = stateNodes.findIndex(s => s.props.initial);
        initialIndex = initialIndex >= 0 ? initialIndex : 0;

        return stateNodes.reduce((acc, stateNode, i) => {
            const { children, id, parallel, path = '/' } = stateNode.props;
            const childStates = getChildStateNodes(React.Children.toArray(children));
            const transitions = getChildrenOfType(children, 'Transition')
                .map(({ props }) => ({
                    cond: props.cond === true || props.cond === undefined ? true : false,
                    event: props.event,
                    sendId: id,
                    target: props.target
                }));

            // Add current state node to array
            acc.push({
                childStates: childStates.map(child => child.props.id),
                id,
                initial: initialIndex === i,
                path,
                stack: '.' + id,
                transitions,
                type: parallel ? 'parallel'
                    : childStates.length === 0 ? 'atomic'
                    : childStates.length > 1 ? 'compound' : 'default'
            });

            // Add children state nodes to array, recursively
            if (childStates.length) {
                normalizeLoop(childStates).forEach((gcs, j) => acc.push({
                    childStates: gcs.childStates,
                    id: gcs.id,
                    initial: gcs.initial,
                    path: !isRootPath(path) ? !isRootPath(gcs.path) ? path + gcs.path : path : gcs.path,
                    stack: '.' + id + gcs.stack,
                    transitions: gcs.transitions,
                    type: gcs.type
                }));
            }

            return acc;
        }, []);
    };

    return normalizeLoop(stateNodes).map(norm => {
        norm.stack = '#' + rootId + norm.stack;
        return norm;
    });
}

const getAtomic = (stack: string, normalizedChildStates: NormalizedState[]): { path: string, stack: string } => {
    const { childStates, path, stack: _stack } = normalizedChildStates.find(child =>  child.stack === stack);
    let initial = {
        path,
        stack: _stack
    }

    if (childStates.length) {
        const childStatesPopulate = childStates.map(id => normalizedChildStates.find(norm => norm.id === id));
        const initialChild = childStatesPopulate.find(child => child.initial) || childStatesPopulate[0];

        if (initialChild.childStates.length) {
            return getAtomic(initialChild.stack, normalizedChildStates);
        } else {
            initial.path = initialChild.path || '/';
            initial.stack = initialChild.stack;
        }
    }

    return initial;
}

type AtomicExists = {
    params: { [name: string]: string },
    path: string | null,
    stack: string | null,
    url: string
}

const resolveUrlToAtomic = (url: string, normalizedChildStates: NormalizedState[], machineId: string) => {
    let atomic: AtomicExists = {
        params: {},
        path: null,
        stack: null,
        url
    };

    const atomicExists = (stack: string, path: string): AtomicExists => {
        const { path: atomicPath, stack: atomicStack } = getAtomic(stack, normalizedChildStates);
        return {
            ...atomic,
            path: atomicPath,
            stack: atomicStack,
            url: injectUrlParams(atomicPath, atomic.params)
        }
    }

    if (isRootPath(url)) {
        const { stack } = normalizedChildStates[0];
        atomic = atomicExists(stack, url);
    } else {
        const { params, path: currentPath, stack: currentStack } = deriveStateFromUrl(url, normalizedChildStates, machineId);
        atomic = {
            ...atomic,
            params,
            path: currentPath,
            stack: currentStack
        }

        if (!isNotFound(currentStack)) {
            atomic = atomicExists(currentStack, currentPath);
        }
    }

    return atomic;
}

const selectTransition = (event: string, currentStack: string, normalizedChildStates: NormalizedState[]): TransitionType | null => {
    if (isRootStack(currentStack)) {
        return null;
    }

    const availableTransitions = normalizedChildStates && normalizedChildStates.find(norm => norm.stack === currentStack)?.transitions;

    if (availableTransitions?.length) {
        const activeTransition = availableTransitions.find(({ cond, event: transitionEvent, target }) => 
            transitionEvent === event && (cond === null || cond === true));
        if (activeTransition) {
            return activeTransition;
        }
    }

    const parentStack = currentStack.split('.').slice(0, -1).join('.');
    return selectTransition(event, parentStack, normalizedChildStates);
}

export {
    classNames,
    getChildrenOfType,
    getChildStateNodes,
    injectUrlParams,
    isCurrentStack, 
    isExactStack,
    normalizeChildStateProps,
    resolveUrlToAtomic,
    getAtomic,
    selectTransition
}