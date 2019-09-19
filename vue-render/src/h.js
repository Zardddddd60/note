import { VNodeFlags, ChildrenFlags } from './flags';

export const Fragment = Symbol();
export const Portal = Symbol();

// 根据tag，data，children，推到flag和childFlag，得到一个VNode
export function h(tag, data = null, children = null) {
    let flag = null;
    if (typeof tag === 'string') {
        flag = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML;
    } else if (tag === Fragment) {
        flag = VNodeFlags.FRAGMENT;
    } else if (tag === Portal) {
        flag = VNodeFlags.PORTAL;
        tag = data && data.target;
    } else {
        if (tag !== null && typeof tag === 'object') {
            flag = tag.functional ?
                VNodeFlags.COMPONENT_FUNCTIONAL :
                VNodeFlags.COMPONENT_STATEFUL_NORAMAL;
        } else if (typeof tag === 'function') {
            flag = tag.prototype.render ?
                VNodeFlags.COMPONENT_STATEFUL_NORAMAL :
                VNodeFlags.COMPONENT_FUNCTIONAL;
        }
    }

    let childFlag = null;
    if (Array.isArray(children)) {
        const len = children.length;
        if (len === 0) {
            childFlag = ChildrenFlags.NO_CHILDREN;
        } else if (len === 1) {
            childFlag = ChildrenFlags.SINGLE_VNODE;
            children = children[0];
        } else {
            childFlag = ChildrenFlags.KEYED_VNODES;
            children = normalizeVNodes(children);
        }
    } else if (children == null) {
        childFlag = ChildrenFlags.NO_CHILDREN;
    } else if (children._isVnode) {
        childFlag = ChildrenFlags.SINGLE_VNODE;
    } else {
        childFlag = ChildrenFlags.SINGLE_VNODE;
        children = createTextVNode(children + '');
    }

    return {
        tag,
        flag,
        childFlag,
        children,
        data,
        _isVnode: true,
        el: null,
        key: data && data.key ? data.key : null,
    };
}

function normalizeVNodes(children) {
    return children.map((child, index) => {
        return {
            ...child,
            key: child.key == null ? `|${index}` : child.key,
        };
    });
}

export function createTextVNode(text) {
    return {
        _isVnode: true,
        flag: VNodeFlags.TEXT,
        children: text,
        childFlag: ChildrenFlags.NO_CHILDREN,
        data: null,
        tag: null,
    };
}
