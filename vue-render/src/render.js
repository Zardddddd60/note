import { VNodeFlags, ChildrenFlags } from './flags';
import { patchData } from './patchData';
import { createTextVNode } from './h';
import { lis } from './util';

export default function render(vnode, container) {
    const prevVNode = container.vnode;
    if (prevVNode) {
        if (vnode) {
            patch(prevVNode, vnode, container);
            container.vnode = vnode;
        } else {
            container.removeChild(prevVNode.el);
            container.vnode = null;
        }
    } else {
        if (vnode) {
            mount(vnode, container);
            container.vnode = vnode;
        }
    }
}

function patch(prevVNode, nextVNode, container) {
    const prevFlag = prevVNode.flag;
    const nextFlag = nextVNode.flag;

    if (prevFlag !== nextFlag) {
        replaceVNode(prevVNode, nextVNode, container);
    } else if (prevFlag === VNodeFlags.ELEMENT_HTML) {
        patchELement(prevVNode, nextVNode, container);
    } else if (prevFlag & VNodeFlags.TEXT) {
        patchText(prevVNode, nextVNode);
    } else if (prevFlag & VNodeFlags.FRAGMENT) {
        patchFragment(prevVNode, nextVNode, container);
    } else if (prevFlag & VNodeFlags.PORTAL) {
        patchPortal(prevVNode, nextVNode);
    } else if (prevFlag & VNodeFlags.COMPONENT) {
        patchComponent(prevVNode, nextVNode, container);
    }
}

function mount(vnode, container, isSvg, refNode) {
    if (vnode.flag & VNodeFlags.ELEMENT) {
        mountElement(vnode, container, isSvg, refNode);
    } else if (vnode.flag & VNodeFlags.TEXT) {
        mountText(vnode, container);
    } else if (vnode.flag & VNodeFlags.FRAGMENT) {
        mountFragment(vnode, container, isSvg);
    } else if (vnode.flag & VNodeFlags.PORTAL) {
        mountPortal(vnode, container);
    } else if (vnode.flag & VNodeFlags.COMPONENT) {
        mountComponent(vnode, container, isSvg);
    }
}

function mountElement(vnode, container, isSvg, refNode) {
    isSvg = isSvg || vnode.flag & VNodeFlags.ELEMENT_SVG;
    const el = isSvg ?
        document.createElementNS('http://www.w3.org/2000/svg', vnode.tag) :
        document.createElement(vnode.tag);

    vnode.el = el;
    const data = vnode.data;
    if (data) {
        for (const key in data) {
            patchData(el, key, null, data[key]);
        }
    }

    if (vnode.childFlag !== ChildrenFlags.NO_CHILDREN) {
        if (vnode.childFlag & ChildrenFlags.SINGLE_VNODE) {
            mount(vnode.children, el, isSvg);
        } else if (vnode.childFlag & ChildrenFlags.MULTI_VNODES) {
            for (const child of vnode.children) {
                mount(child, el, isSvg);
            }
        }
    }

    // container.appendChild(el);
    if (refNode) {
        container.insertBefore(el, refNode)
    } else {
        container.appendChild(el);
    }
}

function mountText(vnode, container) {
    const el = document.createTextNode(vnode.children);
    vnode.el = el;
    container.appendChild(el);
}

function mountFragment(vnode, container, isSVG) {
    const { childFlag, children } = vnode;
    if (childFlag & ChildrenFlags.MULTI_VNODES) {
        for (const child of children) {
            mount(child, container, isSVG);
        }
        vnode.el = children[0].el;
    } else if (childFlag & ChildrenFlags.SINGLE_VNODE) {
        mount(children, container, isSVG);
        vnode.el = children.el;
    } else if (childFlag & ChildrenFlags.NO_CHILDREN) {
        const placeholder = createTextVNode('');
        mountText(placeholder, container);

        vnode.el = placeholder;
    }
}

function mountPortal(vnode, container) {
    const { tag, children, childFlag } = vnode;
    const target = typeof tag === 'string' ?
        document.querySelector(tag) : tag;
    
    if (childFlag & ChildrenFlags.SINGLE_VNODE) {
        mount(children, target);
    } else if (childFlag & ChildrenFlags.MULTI_VNODES) {
        for (const child of children) {
            mount(child, target);
        }
    }

    const placeholder = createTextVNode('');
    mountText(placeholder, container);
    vnode.el = placeholder;
}

function mountComponent(vnode, container, isSVG) {
    const { flag } = vnode;
    if (flag & VNodeFlags.COMPONENT_STATEFUL) {
        mountStatefulComponent(vnode, container, isSVG);
    } else {
        mountFunctionalComponent(vnode, container, isSVG);
    }
}

function mountStatefulComponent(vnode, container, isSVG) {
    // 暂时还不知道vnode.children是干嘛的，为什么把组件实例作为vnode.children
    const instance = (vnode.children = new vnode.tag());

    instance._update = function() {
        if (instance._mounted) {
            const prevVNode = instance.$vnode;
            const nextVNode = (instance.$node = instance.render());
            
            // 这里是el的parentNode
            patch(prevVNode, nextVNode, prevVNode.el.parentNode);
            instance.$el = vnode.el = instance.$vnode.el;
        } else {
            instance._mounted = true;
            instance.$props = vnode.data
            instance.$vnode = instance.render();
            mount(instance.$vnode, container, isSVG);
            instance.$el = vnode.el = instance.$vnode.el;

            // 暂时加在这里
            instance.mounted && instance.mounted();
        }
    }

    instance._update();
}

function mountFunctionalComponent(vnode, container, isSVG) {
    vnode.handle = {
        container,
        prev: null,
        next: vnode,
        update() {
            // 非初次挂载
            if (vnode.handle.prev) {
                const prevVNode = vnode.handle.prev;
                const nextVNode = vnode.handle.next;
                const prevVTree = prevVNode.children;
                const nextVTree = (nextVNode.children = nextVNode.tag(nextVNode.data));

                patch(prevVTree, nextVTree, vnode.handle.container);
            } else {
                // 初次挂载
                const props = vnode.data;
                const $vnode = (vnode.children = vnode.tag(props));
                mount($vnode, container, isSVG);
                vnode.el = $vnode.el;
            }
        },
    };
    vnode.handle.update();
}

function replaceVNode(prevVNode, nextVNode, container) {
    container.removeChild(prevVNode.el);
    if (prevVNode.flag & VNodeFlags.COMPONENT_STATEFUL_NORAMAL) {
        const instance = prevVNode.children;
        if (instance.unmounted) {
            instance.unmounted();
        }
    }
    mount(nextVNode, container);
}

function patchELement(prevVNode, nextVNode, container) {
    if (prevVNode.tag !== nextVNode.tag) {
        replaceVNode(prevVNode, nextVNode, container);
        return;
    }
    const el = (nextVNode.el = prevVNode.el);
    const prevData = prevVNode.data;
    const nextData = nextVNode.data;

    if (nextData) {
        for (const key in nextData) {
            patchData(el, key, prevData[key], nextData[key]);
        }
    }
    if (prevData) {
        for (const key in prevData) {
            if (!nextData.hasOwnProperty(key)) {
                patchData(el, key, prevData[key], null);
            }
        }
    }

    patchChildren(
        prevVNode.childFlag,
        nextVNode.childFlag,
        prevVNode.children,
        nextVNode.children,
        el,
    )
}

function patchText(prevVNode, nextVNode) {
    const el = (nextVNode.el = prevVNode.el);
    if (nextVNode.children !== prevVNode.children) {
        el.nodeValue = nextVNode.children;
    }
}

function patchFragment(prevVNode, nextVNode, container) {
    patchChildren(
        prevVNode.childFlag,
        nextVNode.childFlag,
        prevVNode.children,
        nextVNode.children,
        container,
    );

    switch(nextVNode.childFlag) {
        case ChildrenFlags.MULTI_VNODES:
            nextVNode.el = nextVNode.children[0].el;
            break;
        case ChildrenFlags.SINGLE_VNODE:
            nextVNode.el = nextVNode.children.el;
            break;
        default:
            nextVNode.el = prevVNode.el;
    }
}

function patchPortal(prevVNode, nextVNode) {
    patchChildren(
        prevVNode.childFlag,
        nextVNode.childFlag,
        prevVNode.children,
        nextVNode.children,
        prevVNode.tag,
    );

    nextVNode.el = prevVNode.el;

    if (prevVNode.tag !== nextVNode.tag) {
        const { tag } = nextVNode;
        const container = typeof tag === 'string' ?
            document.querySelector(tag) : tag;
        switch(nextVNode.childFlag) {
            case ChildrenFlags.SINGLE_VNODE:
                container.appendChild(nextVNode.children.el);
                break;
            case ChildrenFlags.MULTI_VNODES:
                for (const child of nextVNode.children) {
                    container.appendChild(child.el);
                }
                break;
            default:
                break;
        }
    }
}

function patchComponent(prevVNode, nextVNode, container) {
    if (prevVNode.tag !== nextVNode.tag) {
        replaceVNode(prevVNode, nextVNode, container)
    } else if (nextVNode.flag & VNodeFlags.COMPONENT_STATEFUL_NORAMAL) {
        // 取到实例，并赋给nextVNode，不再new一个了；
        const instance = (nextVNode.children = prevVNode.children);
        // 更新data给render用
        instance.$props = nextVNode.data;
        instance.render();
    } else {
        // 更新handle数据，在update的时候直接从上边拿；
        const handle = (nextVNode.handle = prevVNode.handle);
        handle.prev = prevVNode;
        handle.next = nextVNode;

        handle.container = container;
        handle.update();
    }
}

function patchChildren(prevChildFlag, nextChildFlag, prevChildren, nextChildren, container) {
    switch (prevChildFlag) {
        case ChildrenFlags.SINGLE_VNODE:
            switch (nextChildFlag) {
                case ChildrenFlags.SINGLE_VNODE:
                    patch(prevChildren, nextChildren, container);
                    break;
                case ChildrenFlags.NO_CHILDREN:
                    container.removeChild(prevChildren.el);
                    break;
                default:
                    container.removeChild(prevChildren.el);
                    for (const child of nextChildren) {
                        mount(child, container);
                    }
                    break;
            }
            break;
        case ChildrenFlags.NO_CHILDREN:
            switch (nextChildFlag) {
                case ChildrenFlags.SINGLE_VNODE:
                    mount(nextChildren, container);
                    break;
                case ChildrenFlags.NO_CHILDREN:
                    break;
                default:
                    for (const child of nextChildren) {
                        mount(child, container);
                    }
                    break;
            }
            break;
        default:
            switch (nextChildFlag) {
                case ChildrenFlags.SINGLE_VNODE:
                    for (const child of prevChildren) {
                        container.removeChild(child.el);
                    }
                    mount(nextChildren, container);
                    break;
                case ChildrenFlags.NO_CHILDREN:
                    for (const child of prevChildren) {
                        container.removeChild(child.el);
                    }
                    break;
                default:
                    // simplePatch(prevChildren, nextChildren, container);
                    // noMovePatch(prevChildren, nextChildren, container);
                    // reactPatch(prevChildren, nextChildren, container);
                    // vue2Patch(prevChildren, nextChildren, container);
                    vue3Patch(prevChildren, nextChildren, container);
                    break;
            }
            break;
    }
}

function noMovePatch(prevChildren, nextChildren, container) {
    const prevLen = prevChildren.length;
    const nextLen = nextChildren.length;

    const lessLen = Math.min(prevLen, nextLen);

    for (let i = 0; i < lessLen; i ++) {
        patch(prevChildren[i], nextChildren[i], container);
    }

    if (prevLen > nextLen) {
        for (let i = lessLen; i < prevLen; i ++) {
            container.removeChild(prevChildren[i])
        }
    } else if (nextLen > prevLen) {
        mount(nextChildren[i], container);
    }
}

function simplePatch(prevChildren, nextChildren, container) {
    for (const child of prevChildren) {
        container.removeChild(child.el);
    }
    for (const child of nextChildren) {
        mount(child, container);
    }
}

function reactPatch(prevChildren, nextChildren, container) {
    let maxIndex = 0;
    for (let i = 0; i < nextChildren.length; i ++) {
        const nextVNode = nextChildren[i];
        let found = false;
        for (let j = 0; j < prevChildren.length; j ++) {
            const prevVNode = prevChildren[j];
            if (prevVNode.key == nextVNode.key) {
                found = true;
                patch(prevVNode, nextVNode, container);
                if (j < maxIndex) {
                    const refNode = nextChildren[i - 1].el.nextSibling;
                    container.insertBefore(prevVNode.el, refNode);
                } else {
                    maxIndex = j;
                }
                break;
            }
        }
        // 新元素
        if (!found) {
            const refNode = i - 1 < 0 ?
                prevChildren[0].el :
                nextChildren[i - 1].el.nextSibling;
            mount(nextVNode, container, false, refNode);
        }
    }
    // 删除元素
    for (let i = 0; i < prevChildren.length; i ++) {
        const prevVNode = prevChildren[i];

        const has = nextChildren.find(node => node.key === prevVNode.key);

        if (!has) {
            container.removeChild(prevVNode.el);
        }
    }
}

function vue2Patch(prevChildren, nextChildren, container) {
    let prevStartIdx = 0;
    let nextStartIdx = 0;
    let prevEndIdx = prevChildren.length - 1;
    let nextEndIdx = nextChildren.length - 1;

    let prevStartVNode = prevChildren[prevStartIdx];
    let nextStartVNode = nextChildren[nextStartIdx];
    let prevEndVNode = prevChildren[prevEndIdx];
    let nextEndVNode = nextChildren[nextEndIdx];

    while (prevStartIdx <= prevEndIdx && nextStartIdx <= nextEndIdx) {
        if (!prevStartVNode) {
            prevStartIdx ++;
            prevStartVNode = prevChildren[prevStartIdx];
        } else if (!prevEndVNode) {
            prevEndIdx --;
            prevEndVNode = prevChildren[prevEndIdx];
        } else if (prevStartVNode.key === nextStartVNode.key) {
            patch(prevStartVNode, nextStartVNode, container);
            prevStartIdx ++;
            nextStartIdx ++;
            prevStartVNode = prevChildren[prevStartIdx];
            nextStartVNode = nextChildren[nextStartIdx];
        } else if (prevEndVNode.key === nextEndVNode.key) {
            patch(prevEndVNode, nextEndVNode, container);
            prevEndIdx --;
            nextEndIdx --;
            prevEndVNode = prevChildren[prevEndIdx];
            nextEndVNode = nextChildren[nextEndIdx];
        } else if (prevStartVNode.key === nextEndVNode.key) {
            patch(prevStartVNode, nextEndVNode, container);
            container.insertBefore(nextEndVNode.el, prevEndVNode.el.nextSibling);
            prevStartIdx ++;
            nextEndIdx --;
            prevStartVNode = prevChildren[prevStartIdx];
            nextEndVNode = nextChildren[nextEndIdx];
        } else if (prevEndVNode.key === nextStartVNode.key) {
            patch(prevEndVNode, nextStartVNode, container);
            container.insertBefore(nextStartVNode.el, prevStartVNode.el);
            prevEndIdx --;
            nextStartIdx ++;
            prevEndVNode = prevChildren[prevEndIdx];
            nextStartVNode = nextChildren[nextStartIdx];
        } else {
            const idxInPrev = prevChildren.findIndex(child => child.key === nextStartVNode.key);
            // 找到了
            if (idxInPrev >= 0) {
                const vnodeToMove = prevChildren[idxInPrev];
                patch(vnodeToMove, nextStartVNode, container);
                container.insertBefore(vnodeToMove.el, prevStartVNode.el);

                // 当遇到已经移动了的prev元素，直接跳过
                prevChildren[idxInPrev] = undefined;
            } else {
                mount(nextStartVNode, container, false, prevStartVNode.el);
            }
            nextStartIdx ++;
            nextStartVNode = nextChildren[nextStartIdx];
        }
    }

    if (prevEndIdx < prevStartIdx) {
        for (let i = nextStartIdx; i <= nextEndIdx; i ++) {
            mount(nextChildren[i], container, false, prevStartVNode.el);
        }
    } else if (nextEndIdx < nextStartIdx) {
        for (let i = prevStartIdx; i <= prevEndIdx; i ++) {
            container.removeChild(prevChildren[i].el);
        }
    }
}

function vue3Patch(prevChildren, nextChildren, container) {
    let start = 0;
    let prevVNode = prevChildren[start];
    let nextVNode = nextChildren[start];
    let prevEnd = prevChildren.length - 1;
    let nextEnd = nextChildren.length - 1;

    outer: {
        while(prevVNode.key === nextVNode.key) {
            patch(prevVNode, nextVNode, container);
            start ++;
            if (start > prevEnd || start > nextEnd) {
                break outer;
            }
            prevVNode = prevChildren[start];
            nextVNode = nextChildren[start];
        }

        prevVNode = prevChildren[prevEnd];
        nextVNode = nextChildren[nextEnd];

        while (prevVNode.key === nextVNode.key) {
            patch(prevVNode, nextVNode, container);
            prevEnd --;
            nextEnd --;

            if (start > prevEnd || start > nextEnd) {
                break outer;
            }
            prevVNode = prevChildren[prevEnd];
            nextVNode = prevChildren[nextEnd];
        }
    }

    if (start > prevEnd && start <= nextEnd) {
        const refNode = nextEnd + 1 < nextChildren.length ?
            nextChildren[nextEnd + 1].el : null;
        for (let i = start; i <= nextEnd; i ++) {
            mount(nextChildren[i], container, false, refNode);
        }
    } else if (start > nextEnd && start <= prevEnd) {
        for (let i = start; i <= prevEnd; i ++) {
            container.removeChild(prevChildren[i].el)
        }
    } else {
        const prevStart = start;
        const nextStart = start;
        const nextLeft = nextEnd - nextStart + 1;
        const nextMap = {};
        const source = [];
        let moved = false;
        let pos = 0;
        let patched = 0;

        for (let i = 0; i < nextLeft; i ++) {
            source.push(-1);
        }

        for (let i = nextStart; i <= nextEnd; i ++) {
            nextMap[nextChildren[i].key] = i;
        }

        // 使用react的更新方式
        for (let i = prevStart; i <= prevEnd; i ++) {
            const prevVNode = prevChildren[i];
            if (patched < nextLeft) {
                const nextNodeIndex = nextMap[prevVNode.key];
                if (nextNodeIndex !== undefined) {
                    patch(prevVNode, nextChildren[nextNodeIndex], container);
                    patched ++;
                    // 更新source
                    source[nextNodeIndex - nextStart] = i;
                    if (nextNodeIndex < pos) {
                        moved = true;
                    } else {
                        pos = nextNodeIndex;
                    }
                } else {
                    // 老的有，新的没有，移除
                    container.removeChild(prevVNode.el);
                }
            } else {
                container.removeChild(prevVNode.el);
            }
        }

        if (moved) {
            const seq = lis(source);
            let currentSeq = seq.length - 1;

            for (let i = nextLeft - 1; i >= 0; i --) {
                if (source[i] === -1) {
                    // 没找到的 mount
                    const pos = nextStart + i;
                    const nextVNode = nextChildren[pos];

                    const refNode = pos + 1 < nextChildren.length ?
                        nextChildren[pos + 1].el : null;
                    
                    mount(nextVNode, container, false, refNode);
                } else if (i !== seq[currentSeq]) {
                    // 移动
                    const pos = nextStart + i;
                    const nextVNode = nextChildren[pos];

                    const refNode = pos + 1 < nextChildren.length ?
                        nextChildren[pos + 1].el : null;
                    
                    container.insertBefore(nextVNode.el, refNode);
                } else {
                    // 不需移动
                    currentSeq --;
                }
            }
        }

        for (let i = nextEnd; i >= nextStart; i --) {
            const has = prevChildren.find(node => node.key === nextChildren[i].key);
            if (!has) {
                const refNode = i + 1 > nextChildren.length ?
                    null : nextChildren[i + 1].el;
                mount(nextChildren[i], container, false, refNode);
            }
        }
    }
}
