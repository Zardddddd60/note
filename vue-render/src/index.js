import {
    h,
    Fragment,
    Portal
} from './h';
import render from './render';

// class MyComponent {
//     render() {
//         return h(
//             'div', {
//                 style: {
//                     background: 'green'
//                 },
//             },
//             [
//                 h('span', null, '我是组件的标题1......'),
//                 h('span', null, '我是组件的标题2......')
//             ]
//         );
//     }
// }

// function MyFunctionalComponent() {
//     // 返回要渲染的内容描述，即 VNode
//     return h(
//         'div',
//         {
//             style: {
//                 background: 'green'
//             },
//         },
//         [
//             h('span', null, '我是组件的标题1......'),
//             h('span', null, '我是组件的标题2......')
//         ]
//     );
// }

// const elementVnode = h(
// 'div', {
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'red'
//     }
// },
// [
//     h('div', {
//         style: {
//             height: '50px',
//             width: '50px',
//             background: 'green'
//         }
//     }, '文本？'),
//     h(MyComponent),
//     h(Fragment, null, [
//         h('p', {
//             style: {
//                 color: 'yellow',
//             },
//         }, '啦啦啦123'),
//         h('p', null, '嘻嘻嘻')
//     ]),
//     h(Portal, {
//         target: 'body',
//     }, '??????')
// ]
//     MyFunctionalComponent
// );

// const prev = h('div', null, 'prev data');

// render(prev, document.getElementById('app'))
// window.setTimeout(() => {
//     render(elementVnode, document.getElementById('app'))
// }, 2000);

// patch single child to single child;
// const prevVNode = h('div', null,
//     h('p', {
//         style: {
//             height: '100px',
//             width: '100px',
//             background: 'red'
//         }
//     })
// )

// // 新的 VNode
// const nextVNode = h('div', null,
//     h('p', {
//         style: {
//             height: '100px',
//             width: '100px',
//             background: 'green'
//         }
//     })
// )

// render(prevVNode, document.getElementById('app'))

// // 2秒后更新
// setTimeout(() => {
//     render(nextVNode, document.getElementById('app'))
// }, 2000)

// patch single child to no child;
// const prevVNode = h(
//     'div',
//     null,
//     h('p', {
//         style: {
//             height: '100px',
//             width: '100px',
//             background: 'red'
//         }
//     })
// )

// // 新的 VNode
// const nextVNode = h('div')

// render(prevVNode, document.getElementById('app'))

// // 2秒后更新
// setTimeout(() => {
//     render(nextVNode, document.getElementById('app'))
// }, 2000)

// patch single to multi
// 旧的 VNode
// const prevVNode = h('div', null, h('p', null, '只有一个子节点'))

// // 新的 VNode
// const nextVNode = h('div', null, [
//     h('p', null, '子节点 1'),
//     h('p', null, '子节点 2')
// ])

// render(prevVNode, document.getElementById('app'))

// // 2秒后更新
// setTimeout(() => {
//     render(nextVNode, document.getElementById('app'))
// }, 2000)

// patch text to text
// render(h('p', null, 'old text'), document.getElementById('app'));

// setTimeout(() => {
//     render(h('p', null, 'new text'), document.getElementById('app'))
// }, 2000);

// patch fragment
// render(h(Fragment, null, [
//     h('p', null, '旧子节点1'),
//     h('p', null, '旧子节点2'),
//     h('p', null, '旧子节点3'),
//     h('p', null, '旧子节点4'),
// ]), document.getElementById('app'));

// setTimeout(() => {
//     render(h(Fragment, null, [
//         h('p', null, '新子节点1'),
//         h('p', null, '新子节点2'),
//         h('p', null, '新子节点3'),
//         h('p', null, '新子节点4'),
//     ]), document.getElementById('app'));
// }, 2000);

// patch portal
// const prevVNode = h(
//     Portal,
//     { target: '#old-container' },
//     h('p', null, '旧的 Portal'),
// );

// const nextVNode = h(
//     Portal,
//     { target: '#new-container' },
//     h('p', null, '新的 Portal'),
// )

// render(prevVNode, document.getElementById('app'));

// setTimeout(() => {
//     render(nextVNode, document.getElementById('app'));
// }, 2000);

// class ChildComponent {
//     render() {
//       // 子组件中访问外部状态：this.$props.text
//         return h('div', null, this.$props.text);
//     }
// }

// function MyFunctionalComp(props) {
//     return h('p', null, props.text)
// }

// class ParentComponent {
//     constructor() {
//         this.localState = 'one';
//     }

//     mounted() {
//         setTimeout(() => {
//             this.localState = 'two';
//             this._update();
//         }, 2000);
//     }
    
//     render() {
//         return h(MyFunctionalComp, {
//             // 父组件向子组件传递的 props
//             text: this.localState,
//         });
//     }
// }

// render(h(ParentComponent), document.getElementById('app'));

const muitlChildrenBefore = h('div', null, [
    h('p', { key: 'a' }, 'old a'),
    // h('p', { key: 'b' }, 'old b'),
    h('p', { key: 'c' }, 'old c'),
    h('p', { key: 'd' }, 'old d'),
]);

const muitlChildrenAfter = h('div', null, [
    h('p', { key: 'b' }, 'new b'),
    h('p', { key: 'a' }, 'new a'),
    // h('p', { key: 'd' }, 'new d'),
    h('p', { key: 'c' }, 'new c'),
]);

render(muitlChildrenBefore, document.getElementById('app'));

setTimeout(() => {
    render(muitlChildrenAfter, document.getElementById('app'));
}, 2000);
