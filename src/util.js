import React from 'react';

const getChildStateNodes = (children) => {
    if (children.length) {
        const childrenOfType = getChildrenOfType(React.Children.toArray(children), 'State');
    
        if (childrenOfType.length) {
            return childrenOfType;
        }

        if (children.props && children.props.children) {
            return children.props.children.reduce((acc, child) => {
                acc = acc.concat(getChildrenOfType(React.Children.toArray(child.props.children), 'State'));
                return acc;
            }, []);
        }
    }
    
    return [];
}
const classNames = (_classNames) => {
    const next = _classNames.map(className => {
        switch(typeof className) {
            case 'string':
                return className;
            case 'object':
                return Object.keys(className).filter(key => Boolean(className[key])).join( ' ').trim();
            default:
                return null;
        }
    }).join(' ').trim();

    return Boolean(next) ? next : null;
}
const getChildrenOfType = (children, type) => children.filter(c => c.type.displayName === type);
// const getInitialChildStateNode = (stateNodes) => stateNodes.find(c => c.props.initial) || stateNodes[0];
// const isAtomic = (stateNode) => getChildStateNodes(React.Children.toArray(stateNode.props.children)).length === 0;
// const isAtomicNormalized = (stateNode) => stateNode.childStates.length === 0;
const isCurrentStack = (id, stack) => !!stack.split('.').find(state => state === id);
const isExactStack = (id, stack) => stack.split('.').pop() === id;
const isDynamicSegment = segment => /^:(.+)/.test(segment);
const isRootPath = (path) => path === '/';
const isRootSegment = url => url.slice(1) === '';
const isRootStack = stack => !stack.match(/\./g);
const isNotFound = stack => stack.split('.').pop() === '*';
const segmentize = url => url.split('/').filter(Boolean);

const injectUrlParams = (path, params) => {
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

const deriveStateFromUrl = (url, normalized, rootId) => {
    let match = {
        params: {},
        path: url,
        stack: null
    }

    // 1. Exact match, no dynamic URL needed
    const childMatch = normalized.find(norm => norm.path === url);

    if (childMatch) {
        match.path = childMatch.path;
        match.stack = childMatch.stack;
        return match;
    }

    // 1.1 Check if URL is root, return initial stack
    if (isRootSegment(url)) {
        match.stack = normalized.find(norm => norm.stack.match(/\./g).length === 1 && norm.initial).stack;
        return match;
    }

    // 2. No exact match yet, compare to dynamic URLs for match
    const dynamicPaths = normalized.filter(norm => norm.path && norm.path.match(/\/:/g)).map(norm => norm.path);

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
            match.stack = normalized.find(norm => norm.path === dynamicPathMatch).stack;;
        }
    }

    // 3.0 if no match, resolve to wildcard route "*""
    if (!match.stack) {
        const notFoundState = normalized.find(norm => norm.id === '*');
        match.stack = '#' + rootId + '.*';

        // 3.1 If no wildcard route "*", throw error
        if (!notFoundState) {
            console.warn(`No <State/> configuration matches URL "${url}, and no catch-all <State id='*' path='/404'/> exists. Consider adding one.`);
        }
    }

    return match;
}

const fakeUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 | 0;
    let v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const normalizeChildStateProps = (stateNodes, rootId) => {
    const normalizeLoop = (stateNodes) => {
        let initialIndex = stateNodes.findIndex(s => s.props.initial);
        initialIndex = initialIndex >= 0 ? initialIndex : 0;

        return stateNodes.reduce((acc, stateNode, i) => {
            const { children, id, parallel, path = '/' } = stateNode.props;
            const childStates = getChildStateNodes(React.Children.toArray(children));
            const transitions = getChildrenOfType(React.Children.toArray(children), 'Transition')
                .map(({ props }) => ({
                    cond: props.cond || null,
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

const getAtomic = (stack, normalized) => {
    const { childStates, path, stack: nextStack } = normalized.find(norm =>  norm.stack === stack);
    let initial = {
        path,
        stack: nextStack
    }

    if (childStates.length) {
        const childStatesFull = childStates.map(childId => normalized.find(norm => norm.id === childId));
        const initialChild = childStatesFull.find(child => child.initial) || childStatesFull[0];

        if (initialChild.childStates.length) {
            return getAtomic(initialChild.stack, normalized);
        } else {
            initial.path = initialChild.path || '/';
            initial.stack = initialChild.stack;
        }
    }

    return initial;
}

const resolveUrlToAtomic = (url, normalized, machineId) => {
    let initialProps = {
        params: null,
        path: null,
        stack: null,
        url
    };

    const atomicGotten = (stack, path) => {
        const { path: atomicPath, stack: atomicStack } = getAtomic(stack, normalized);
        if (stack !== atomicStack) {
            initialProps.exact = { stack, path };
        }
        initialProps.path = atomicPath;
        initialProps.stack = atomicStack;
        initialProps.url = injectUrlParams(atomicPath, initialProps.params);
    }

    if (isRootPath(url)) {
        const { stack } = normalized[0];
        atomicGotten(stack, url);
    } else {
        const { params, path: currentPath, stack: currentStack } = deriveStateFromUrl(url, normalized, machineId);
        initialProps.params = params;
        initialProps.path = currentPath;
        initialProps.stack = currentStack;

        if (!isNotFound(currentStack)) {
            atomicGotten(currentStack, currentPath);
        }
    }

    return initialProps;
}

const selectTransition = (event, stack, normalized) => {
    if (isRootStack(stack)) {
        return null;
    }

    const availableTransitions = normalized.find(norm => norm.stack === stack).transitions;

    if (availableTransitions.length) {
        const activeTransition = availableTransitions.find(({ cond, event: transitionEvent, target }) => 
            transitionEvent === event && (cond === null || cond === true));
        if (activeTransition) {
            return activeTransition;
        }
    }

    const parentStack = stack.split('.').slice(0, -1).join('.');
    return selectTransition(event, parentStack, normalized);
}

export {
    classNames,
    fakeUUID,
    getChildrenOfType,
    getChildStateNodes,
    // getInitialChildStateNode,
    injectUrlParams,
    // isAtomic,
    isCurrentStack, 
    isExactStack,
    normalizeChildStateProps,
    resolveUrlToAtomic,
    getAtomic,
    selectTransition
}