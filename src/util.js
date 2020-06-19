import React from 'react';

export const getChildStateNodes = (children) => {
    if (children) {
        const childrenArr = React.Children.toArray(children);
        const childrenOfType = childrenArr.filter(c => c.type.displayName === 'State');
    
        if (childrenOfType.length) {
            return childrenOfType;
        }

        if (children.props && children.props.children) {
            return children.props.children.reduce((acc, child) => {
                acc = acc.concat(getChildrenOfType(child.props.children, 'State'));
                return acc;
            }, []);
        }
    }
    
    return [];
}
export const classNames = (classnames) => classNames.filter(Boolean).join(' ');
export const getChildrenOfType = (children, type) => React.Children.toArray(children).filter(c => c.type.displayName === type);
export const getInitialChildStateNode = (stateNodes) => stateNodes.find(c => c.props.initial) || stateNodes[0];
export const isCurrentStack = (id, stack) => !!stack.split('.').find(state => state === id);
export const isExactStack = (id, stack) => stack.split('.').pop() === id;
export const isDynamicSegment = segment => /^:(.+)/.test(segment);
export const isDynamicPath = segment => /\:/g.test(segment);
export const isRootSemgent = url => url.slice(1) === '';
export const isRootStack = stack => !stack.match(/\./g);
export const isNotFound = stack => stack.split('.').pop() === '*';
export const segmentize = url => url.replace(/(^\/+|\/+$)/g, '').split('/');

export function injectUrlParams(path, params) {
    // console.log('injectUrlParams', path, params);

    const url = segmentize(path).map(seg => {
        if (isDynamicSegment(seg)) {
            const param = seg.replace(':', '');

            if (Object.keys(params).includes(param)) {
                return params[param].toString();
            } else {
                // console.error(`Cannot push to a dynamic URL without supplying the proper parameters: ${seg} parameter is missing.`);
                return 'undefined';
            }
        }

        return seg;
    }).join('/');

    return '/' + url + (window.location.search ? window.location.search : '');
}

export function deriveStateFromUrl(url, normalized, rootId) {
    // console.log('deriveStateFromUrl');
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

    // 1.1 Check if URL is root, return root stack
    if (isRootSemgent(url)) {
        match.stack = normalized.find(norm => norm.stack.match(/\./g).length === 1 && norm.initial).stack;
        return match;
    }

    // 2. No exact match yet, compare to dynamic URLs for match
    const dynamicPaths = normalized.filter(norm => norm.path && norm.path.match(/\/:/g)).map(norm => norm.path);

    if (dynamicPaths.length) {
        // 2.1 Split url && child paths into arrays, compare 1 by 1
        const urlSegments = segmentize(url);
        // let params = {};
        const dynamicPathMatch = dynamicPaths.find(p => {
            const pathSegments = segmentize(p);
            match.params = {};

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
            // 3. finally, return the stack that corresponds to the URL
            match.path = dynamicPathMatch;
            match.stack = normalized.find(norm => norm.path === dynamicPathMatch).stack;;
        }
    }

    // Finally, if no match, resolve to not found    
    if (!match.stack) {
        match.stack = '#' + rootId + '.*';
    }

    return match;
}

// Unused
function getAllStacks(stateNodes) {
    return stateNodes.reduce((acc, child) => {
        const childStates = getChildStateNodes(child.props.children);
        const grandChildStacks = getAllStacks(childStates);
        const { id } = child.props;

        acc.push('.' + id);
        
        if (grandChildStacks.length) {
            grandChildStacks.forEach(gcs => acc.push('.' + id + gcs));
        }

        return acc;
    }, []);
}

// Unused
function getAllRoutes(stateNodes) {
    return stateNodes.reduce((acc, child) => {
        const childStates = getChildStateNodes(child.props.children);
        const grandChildRoutes = getAllRoutes(childStates);
        const grandChildRoutesArr = Object.keys(grandChildRoutes);
        const { id, path } = child.props;

        if (path) {
            acc[path] = '.' + id;
        }
        
        if (grandChildRoutesArr.length) {
            grandChildRoutesArr.forEach(route => acc[path ?
                path + route
                : route] = '.' + id + grandChildRoutes[route]
            );
        }

        return acc;
    }, {});
}

export function normalizeChildStateProps(stateNodes, rootId) {
    function normalizeLoop(stateNodes) {
        let initIndex = stateNodes.findIndex(s => s.props.initial);
        initIndex = initIndex >= 0 ? initIndex : 0;

        return stateNodes.reduce((acc, stateNode, i) => {
            const childStates = getChildStateNodes(stateNode.props.children);
            // console.log(stateNode.props.id, stateNode, childStates);
            const { id, path = null, type } = stateNode.props;
            const transitions = getChildrenOfType(stateNode.props.children, 'Transition')
                .map(({ props }) => ({
                    cond: props.cond || null,
                    event: props.event,
                    sendId: id,
                    target: props.target
                }));

            acc.push({
                childStates: childStates.map(child => child.props.id),
                id: id,
                initial: i === initIndex,
                path: path,
                stack: '.' + id,
                transitions,
                type: type === 'parallel' ? 'parallel'
                    : childStates.length === 0 ? 'atomic'
                    : childStates.length > 1 ? 'compound' : 'default'
            });

            if (childStates.length) {
                const normChildStates = normalizeLoop(childStates);

                normChildStates.forEach((gcs, j) => acc.push({
                    childStates: gcs.childStates,
                    id: gcs.id,
                    initial: gcs.initial,
                    path: path ? gcs.path ? path + gcs.path : path : gcs.path,
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

export function resolveToAtomic(stack, normalized) {
    const { childStates, path, stack: nextStack } = normalized.find(norm => norm.stack === stack);
    let initial = {
        path,
        stack: nextStack
    }

    if (childStates.length) {
        const childStatesFull = childStates.map(childId => normalized.find(norm => norm.id === childId));
        const initialChild = childStatesFull.find(child => child.initial) || childStatesFull[0];

        if (initialChild.childStates.length) {
            return resolveToAtomic(initialChild.stack, normalized);
        } else {
            initial.path = initialChild.path || '/';
            initial.stack = initialChild.stack;
        }
    }
    
    return initial;
}

export function resolveInitial(url, normalized, machineId) {
    let initialProps = {
        params: null,
        path: null,
        stack: null,
        url
    }

    const { params, path: currentPath, stack: currentStack } = deriveStateFromUrl(url, normalized, machineId);
    initialProps.params = params;
    initialProps.path = currentPath;
    initialProps.stack = currentStack;
    const { path, stack } = resolveToAtomic(currentStack, normalized);
    
    if (!isNotFound(stack)) {
        initialProps.path = path;
        initialProps.stack = stack;
        initialProps.url = injectUrlParams(path, params);
    }

    return initialProps;
}

export function selectTransition(event, stack, normalized) {
    if (isRootStack(stack)) {
        return null;
    }

    const availableTransitions = normalized.find(norm => norm.stack === stack).transitions;

    if (availableTransitions.length) {
        const activeTransition = availableTransitions.find(({ cond, event: transitionEvent, target }) => 
            transitionEvent === event && cond === null || cond === true);
        if (activeTransition) {
            return activeTransition;
        }
    }

    const nextStack = stack.split('.').slice(0, -1).join('.');
    return selectTransition(event, nextStack, normalized);
}