import React from 'react';

export const logger = (state, event, target) => {
    const { current, id } = state;
    const date = new Date();
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;

    console.group(`%cFSM Router transition: %c${event} %c@ ${time}`, 'color: grey; font-weight: normal', 'font-weight: bold;', 'color: grey; font-weight: normal');
    console.log(`%cprev state: %c${current}\n`, 'color: grey; font-weight: bold;', 'color: black;');
    console.log(`%cevent: %c${event}\n`, 'color: blue; font-weight: bold;', 'color: black;');
    console.log(`%cnext state: %c#${id}.${target}\n`, 'color: green; font-weight: bold;', 'color: black;');
    console.groupEnd();
}

export const fakeUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 | 0;
    let v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const paramRegExp = /^:(.+)/;
export const getChildrenOfType = (children, type) => React.Children.toArray(children).filter(c => c.type.name === type);
export const getChildStateNodes = (children) => getChildrenOfType(children, 'State');
export const isCurrentStack = (id, stack) => !!stack.split('.').find(state => state === id);
export const isExactStack = (id, stack) => stack.split('.').pop() === id;
export const isDynamic = segment => paramRegExp.test(segment);
export const isRootSemgent = url => url.slice(1) === '';
export const segmentize = url => url.replace(/(^\/+|\/+$)/g, '').split('/');

export function injectUrlParameters(path, params) {
    const url = segmentize(path).map(seg => {
        if (isDynamic(seg)) {
            const param = seg.replace(':', '');

            if (Object.keys(params).includes(param)) {
                return params[param].toString();
            } else {
                // console.error(`Cannot push to a dynamic URL without supplying the proper parameters: ${seg} parameter is missing.`);
                return 'undefined';
            }
        }

        return seg;
    });

    return '/' + url.join('/');
}

export function deriveStateFromUrl(url, normalized, rootId) {
    let match = {
        params: {},
        path: url,
        stack: normalized.find(route => route.path === url)
    }

    // 1. Exact match, no dynamic URL needed
    if (match.stack) {
        return match;
    }

    // 1.1 Check if URL is root, return root stack
    if (isRootSemgent(url)) {
        match.stack = normalized.find(norm => norm.stack.match(/\./g).length === 1 && norm.initial).stack;
        return match;
    }

    // 1.2 pre-emptively assume we don't find a match
    // match.stack = '#' + rootId + '.*';
    const notFound = normalized.find(norm => norm.id === '*');

    if (notFound) {
        match.stack = notFound.stack;
    }

    // 2. No exact match yet, compare to dynamic URLs for match
    const dynamicPaths = normalized.filter(norm => norm.path && norm.path.match(/\/:/g)).map(norm => norm.path);

    if (dynamicPaths.length) {
        // 2.1 Split url && route map into arrays, compare 1 by 1
        const urlSegments = segmentize(url);
        // let params = {};
        const route = dynamicPaths.find(p => {
            const pathSegments = segmentize(p);
            match.params = {};

            if (pathSegments.length !== urlSegments.length) {
                return false;
            }

            // TODO
            // Route doesn't parse params if complete route match is not found
            return !pathSegments.map((pathSegment, i) => {
                // 2.2 infer parameter from URL from first segment array that matches in length
                if (isDynamic(pathSegment)) {
                    match.params[pathSegment.slice(1)] = urlSegments[i];
                    return true;
                // 2.3 if path segment matches url segment exactly, proceed
                } else if (pathSegment === urlSegments[i]) {
                    return true;
                }

                return false;
            }).includes(false);
        });

        if (route) {
            // 3. finally, return the stack that corresponds to the URL
            const currentStack = normalized.find(norm => norm.path === route).stack;
            match.stack = currentStack;
        }
    }

    return match;
}

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

export function getInitialChildStateNode(stateNodes) {
    return stateNodes.find(c => c.props.initial) || stateNodes[0];
}

export function normalizeChildStateProps(stateNodes, rootId) {
    function normalizeLoop(stateNodes) {
        let initIndex = stateNodes.findIndex(s => s.props.initial);
        initIndex = initIndex >= 0 ? initIndex : 0;

        return stateNodes.reduce((acc, stateNode, i) => {
            const childStates = getChildStateNodes(stateNode.props.children);
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

export function resolveInitialStack(stack, normalized) {
    const { childStates, path, stack: nextStack } = normalized.find(norm => norm.stack === stack);
    let initial = {
        route: path,
        stack: nextStack
    }

    if (childStates.length) {
        const childStatesFull = childStates.map(childId => normalized.find(norm => norm.id === childId));
        const initialChild = childStatesFull.find(child => child.initial) || childStatesFull[0];

        if (initialChild.childStates.length) {
            return resolveInitialStack(initialChild.stack, normalized);
        } else {
            initial.route = initialChild.path;
            initial.stack = initialChild.stack;
        }
    }
    
    return initial;
}

export function selectTransition(event, stack, normalized) {
    const activeTransitions = normalized.find(norm => norm.stack === stack).transitions;

    if (activeTransitions.length) {
        const activeTransition = activeTransitions.find(({ cond, event: transitionEvent, target }) => 
            transitionEvent === event && cond === null || cond === true);
        if (activeTransition) {
            return activeTransition;
        }
    }
    
    const nextStack = stack.split('.').slice(0, -1).join('.');
    return selectTransition(event, nextStack, normalized);
}