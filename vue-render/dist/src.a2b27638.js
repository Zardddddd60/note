// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/flags.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChildrenFlags = exports.VNodeFlags = void 0;
var VNodeFlags = {
  ELEMENT_HTML: 1,
  ELEMENT_SVG: 1 << 1,
  COMPONENT_STATEFUL_NORAMAL: 1 << 2,
  COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3,
  COMPONENT_STATEFUL_KEPT_ALIVE: 1 << 4,
  COMPONENT_FUNCTIONAL: 1 << 5,
  TEXT: 1 << 6,
  FRAGMENT: 1 << 7,
  PORTAL: 1 << 8
};
exports.VNodeFlags = VNodeFlags;
VNodeFlags.ELEMENT = VNodeFlags.ELEMENT_HTML | VNodeFlags.ELEMENT_SVG;
VNodeFlags.COMPONENT_STATEFUL = VNodeFlags.COMPONENT_STATEFUL_NORAMAL | VNodeFlags.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE;
VNodeFlags.COMPONENT_STATEFUL_KEPT_ALIVE;
VNodeFlags.COMPONENT = VNodeFlags.COMPONENT_STATEFUL | VNodeFlags.COMPONENT_FUNCTIONAL;
var ChildrenFlags = {
  UNKNOWN_CHILDREN: 0,
  NO_CHILDREN: 1,
  SINGLE_VNODE: 1 << 2,
  KEYED_VNODES: 1 << 3,
  NONE_KEYED_VNODES: 1 << 4
};
exports.ChildrenFlags = ChildrenFlags;
ChildrenFlags.MULTI_VNODES = ChildrenFlags.KEYED_VNODES | ChildrenFlags.NONE_KEYED_VNODES;
},{}],"src/h.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = h;
exports.createTextVNode = createTextVNode;
exports.Portal = exports.Fragment = void 0;

var _flags = require("./flags");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var Fragment = Symbol();
exports.Fragment = Fragment;
var Portal = Symbol(); // 根据tag，data，children，推到flag和childFlag，得到一个VNode

exports.Portal = Portal;

function h(tag) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var flag = null;

  if (typeof tag === 'string') {
    flag = tag === 'svg' ? _flags.VNodeFlags.ELEMENT_SVG : _flags.VNodeFlags.ELEMENT_HTML;
  } else if (tag === Fragment) {
    flag = _flags.VNodeFlags.FRAGMENT;
  } else if (tag === Portal) {
    flag = _flags.VNodeFlags.PORTAL;
    tag = data && data.target;
  } else {
    if (tag !== null && _typeof(tag) === 'object') {
      flag = tag.functional ? _flags.VNodeFlags.COMPONENT_FUNCTIONAL : _flags.VNodeFlags.COMPONENT_STATEFUL_NORAMAL;
    } else if (typeof tag === 'function') {
      flag = tag.prototype.render ? _flags.VNodeFlags.COMPONENT_STATEFUL_NORAMAL : _flags.VNodeFlags.COMPONENT_FUNCTIONAL;
    }
  }

  var childFlag = null;

  if (Array.isArray(children)) {
    var len = children.length;

    if (len === 0) {
      childFlag = _flags.ChildrenFlags.NO_CHILDREN;
    } else if (len === 1) {
      childFlag = _flags.ChildrenFlags.SINGLE_VNODE;
      children = children[0];
    } else {
      childFlag = _flags.ChildrenFlags.KEYED_VNODES;
      children = normalizeVNodes(children);
    }
  } else if (children == null) {
    childFlag = _flags.ChildrenFlags.NO_CHILDREN;
  } else if (children._isVnode) {
    childFlag = _flags.ChildrenFlags.SINGLE_VNODE;
  } else {
    childFlag = _flags.ChildrenFlags.SINGLE_VNODE;
    children = createTextVNode(children + '');
  }

  return {
    tag: tag,
    flag: flag,
    childFlag: childFlag,
    children: children,
    data: data,
    _isVnode: true,
    el: null,
    key: data && data.key ? data.key : null
  };
}

function normalizeVNodes(children) {
  return children.map(function (child, index) {
    return _objectSpread({}, child, {
      key: child.key == null ? "|".concat(index) : child.key
    });
  });
}

function createTextVNode(text) {
  return {
    _isVnode: true,
    flag: _flags.VNodeFlags.TEXT,
    children: text,
    childFlag: _flags.ChildrenFlags.NO_CHILDREN,
    data: null,
    tag: null
  };
}
},{"./flags":"src/flags.js"}],"src/patchData.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.patchData = patchData;
var domPropsRE = /\W|^(?:value|checked|seleted|muted)$/;

function patchData(el, key, prevValue, nextValue) {
  switch (key) {
    case 'style':
      for (var _key in nextValue) {
        el['style'][_key] = nextValue[_key];
      }

      for (var _key2 in prevValue) {
        if (!nextValue.hasOwnProperty(_key2)) {
          el['style'][_key2] = '';
        }
      }

      break;

    case 'class':
      el.className = nextValue;
      break;

    default:
      if (key[0] === 'o' && key[1] === 'n') {
        if (prevValue) {
          el.removeEventListener(key.slice(2), prevValue);
        }

        if (nextValue) {
          el.addEventListener(key.slice(2), nextValue);
        }
      } else if (domPropsRE.test(key)) {
        el[key] = nextValue;
      } else {
        el.setAttribute(key, nextValue);
      }

  }
}
},{}],"src/util.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lis = lis;

function lis(arr) {
  var len = arr.length;
  var table = [];

  for (var i = 0; i < len; i++) {
    table.push(1);
  }

  var index = len - 2;

  while (index >= 0) {
    var arrIndex = arr[index];

    for (var start = index + 1; start < len; start++) {
      if (arrIndex < arr[start] && table[index] < table[start] + 1) {
        table[index] = table[start] + 1;
      }
    }

    index--;
  } // console.log(table);
  // 找最后一个


  var res = [];
  var count = 1;
  var dLen = len - 1;

  while (dLen >= 0) {
    if (count === table[dLen]) {
      count++;
      res.unshift(dLen);
    }

    dLen--;
  }

  return res;
}
},{}],"src/render.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _flags = require("./flags");

var _patchData = require("./patchData");

var _h = require("./h");

var _util = require("./util");

function render(vnode, container) {
  var prevVNode = container.vnode;

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
  var prevFlag = prevVNode.flag;
  var nextFlag = nextVNode.flag;

  if (prevFlag !== nextFlag) {
    replaceVNode(prevVNode, nextVNode, container);
  } else if (prevFlag === _flags.VNodeFlags.ELEMENT_HTML) {
    patchELement(prevVNode, nextVNode, container);
  } else if (prevFlag & _flags.VNodeFlags.TEXT) {
    patchText(prevVNode, nextVNode);
  } else if (prevFlag & _flags.VNodeFlags.FRAGMENT) {
    patchFragment(prevVNode, nextVNode, container);
  } else if (prevFlag & _flags.VNodeFlags.PORTAL) {
    patchPortal(prevVNode, nextVNode);
  } else if (prevFlag & _flags.VNodeFlags.COMPONENT) {
    patchComponent(prevVNode, nextVNode, container);
  }
}

function mount(vnode, container, isSvg, refNode) {
  if (vnode.flag & _flags.VNodeFlags.ELEMENT) {
    mountElement(vnode, container, isSvg, refNode);
  } else if (vnode.flag & _flags.VNodeFlags.TEXT) {
    mountText(vnode, container);
  } else if (vnode.flag & _flags.VNodeFlags.FRAGMENT) {
    mountFragment(vnode, container, isSvg);
  } else if (vnode.flag & _flags.VNodeFlags.PORTAL) {
    mountPortal(vnode, container);
  } else if (vnode.flag & _flags.VNodeFlags.COMPONENT) {
    mountComponent(vnode, container, isSvg);
  }
}

function mountElement(vnode, container, isSvg, refNode) {
  isSvg = isSvg || vnode.flag & _flags.VNodeFlags.ELEMENT_SVG;
  var el = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag) : document.createElement(vnode.tag);
  vnode.el = el;
  var data = vnode.data;

  if (data) {
    for (var key in data) {
      (0, _patchData.patchData)(el, key, null, data[key]);
    }
  }

  if (vnode.childFlag !== _flags.ChildrenFlags.NO_CHILDREN) {
    if (vnode.childFlag & _flags.ChildrenFlags.SINGLE_VNODE) {
      mount(vnode.children, el, isSvg);
    } else if (vnode.childFlag & _flags.ChildrenFlags.MULTI_VNODES) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = vnode.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var child = _step.value;
          mount(child, el, isSvg);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  } // container.appendChild(el);


  if (refNode) {
    container.insertBefore(el, refNode);
  } else {
    container.appendChild(el);
  }
}

function mountText(vnode, container) {
  var el = document.createTextNode(vnode.children);
  vnode.el = el;
  container.appendChild(el);
}

function mountFragment(vnode, container, isSVG) {
  var childFlag = vnode.childFlag,
      children = vnode.children;

  if (childFlag & _flags.ChildrenFlags.MULTI_VNODES) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var child = _step2.value;
        mount(child, container, isSVG);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    vnode.el = children[0].el;
  } else if (childFlag & _flags.ChildrenFlags.SINGLE_VNODE) {
    mount(children, container, isSVG);
    vnode.el = children.el;
  } else if (childFlag & _flags.ChildrenFlags.NO_CHILDREN) {
    var placeholder = (0, _h.createTextVNode)('');
    mountText(placeholder, container);
    vnode.el = placeholder;
  }
}

function mountPortal(vnode, container) {
  var tag = vnode.tag,
      children = vnode.children,
      childFlag = vnode.childFlag;
  var target = typeof tag === 'string' ? document.querySelector(tag) : tag;

  if (childFlag & _flags.ChildrenFlags.SINGLE_VNODE) {
    mount(children, target);
  } else if (childFlag & _flags.ChildrenFlags.MULTI_VNODES) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var child = _step3.value;
        mount(child, target);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  }

  var placeholder = (0, _h.createTextVNode)('');
  mountText(placeholder, container);
  vnode.el = placeholder;
}

function mountComponent(vnode, container, isSVG) {
  var flag = vnode.flag;

  if (flag & _flags.VNodeFlags.COMPONENT_STATEFUL) {
    mountStatefulComponent(vnode, container, isSVG);
  } else {
    mountFunctionalComponent(vnode, container, isSVG);
  }
}

function mountStatefulComponent(vnode, container, isSVG) {
  // 暂时还不知道vnode.children是干嘛的，为什么把组件实例作为vnode.children
  var instance = vnode.children = new vnode.tag();

  instance._update = function () {
    if (instance._mounted) {
      var prevVNode = instance.$vnode;
      var nextVNode = instance.$node = instance.render(); // 这里是el的parentNode

      patch(prevVNode, nextVNode, prevVNode.el.parentNode);
      instance.$el = vnode.el = instance.$vnode.el;
    } else {
      instance._mounted = true;
      instance.$props = vnode.data;
      instance.$vnode = instance.render();
      mount(instance.$vnode, container, isSVG);
      instance.$el = vnode.el = instance.$vnode.el; // 暂时加在这里

      instance.mounted && instance.mounted();
    }
  };

  instance._update();
}

function mountFunctionalComponent(vnode, container, isSVG) {
  vnode.handle = {
    container: container,
    prev: null,
    next: vnode,
    update: function update() {
      // 非初次挂载
      if (vnode.handle.prev) {
        var prevVNode = vnode.handle.prev;
        var nextVNode = vnode.handle.next;
        var prevVTree = prevVNode.children;
        var nextVTree = nextVNode.children = nextVNode.tag(nextVNode.data);
        patch(prevVTree, nextVTree, vnode.handle.container);
      } else {
        // 初次挂载
        var props = vnode.data;
        var $vnode = vnode.children = vnode.tag(props);
        mount($vnode, container, isSVG);
        vnode.el = $vnode.el;
      }
    }
  };
  vnode.handle.update();
}

function replaceVNode(prevVNode, nextVNode, container) {
  container.removeChild(prevVNode.el);

  if (prevVNode.flag & _flags.VNodeFlags.COMPONENT_STATEFUL_NORAMAL) {
    var instance = prevVNode.children;

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

  var el = nextVNode.el = prevVNode.el;
  var prevData = prevVNode.data;
  var nextData = nextVNode.data;

  if (nextData) {
    for (var key in nextData) {
      (0, _patchData.patchData)(el, key, prevData[key], nextData[key]);
    }
  }

  if (prevData) {
    for (var _key in prevData) {
      if (!nextData.hasOwnProperty(_key)) {
        (0, _patchData.patchData)(el, _key, prevData[_key], null);
      }
    }
  }

  patchChildren(prevVNode.childFlag, nextVNode.childFlag, prevVNode.children, nextVNode.children, el);
}

function patchText(prevVNode, nextVNode) {
  var el = nextVNode.el = prevVNode.el;

  if (nextVNode.children !== prevVNode.children) {
    el.nodeValue = nextVNode.children;
  }
}

function patchFragment(prevVNode, nextVNode, container) {
  patchChildren(prevVNode.childFlag, nextVNode.childFlag, prevVNode.children, nextVNode.children, container);

  switch (nextVNode.childFlag) {
    case _flags.ChildrenFlags.MULTI_VNODES:
      nextVNode.el = nextVNode.children[0].el;
      break;

    case _flags.ChildrenFlags.SINGLE_VNODE:
      nextVNode.el = nextVNode.children.el;
      break;

    default:
      nextVNode.el = prevVNode.el;
  }
}

function patchPortal(prevVNode, nextVNode) {
  patchChildren(prevVNode.childFlag, nextVNode.childFlag, prevVNode.children, nextVNode.children, prevVNode.tag);
  nextVNode.el = prevVNode.el;

  if (prevVNode.tag !== nextVNode.tag) {
    var tag = nextVNode.tag;
    var container = typeof tag === 'string' ? document.querySelector(tag) : tag;

    switch (nextVNode.childFlag) {
      case _flags.ChildrenFlags.SINGLE_VNODE:
        container.appendChild(nextVNode.children.el);
        break;

      case _flags.ChildrenFlags.MULTI_VNODES:
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = nextVNode.children[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var child = _step4.value;
            container.appendChild(child.el);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        break;

      default:
        break;
    }
  }
}

function patchComponent(prevVNode, nextVNode, container) {
  if (prevVNode.tag !== nextVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container);
  } else if (nextVNode.flag & _flags.VNodeFlags.COMPONENT_STATEFUL_NORAMAL) {
    // 取到实例，并赋给nextVNode，不再new一个了；
    var instance = nextVNode.children = prevVNode.children; // 更新data给render用

    instance.$props = nextVNode.data;
    instance.render();
  } else {
    // 更新handle数据，在update的时候直接从上边拿；
    var handle = nextVNode.handle = prevVNode.handle;
    handle.prev = prevVNode;
    handle.next = nextVNode;
    handle.container = container;
    handle.update();
  }
}

function patchChildren(prevChildFlag, nextChildFlag, prevChildren, nextChildren, container) {
  switch (prevChildFlag) {
    case _flags.ChildrenFlags.SINGLE_VNODE:
      switch (nextChildFlag) {
        case _flags.ChildrenFlags.SINGLE_VNODE:
          patch(prevChildren, nextChildren, container);
          break;

        case _flags.ChildrenFlags.NO_CHILDREN:
          container.removeChild(prevChildren.el);
          break;

        default:
          container.removeChild(prevChildren.el);
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = nextChildren[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var child = _step5.value;
              mount(child, container);
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          break;
      }

      break;

    case _flags.ChildrenFlags.NO_CHILDREN:
      switch (nextChildFlag) {
        case _flags.ChildrenFlags.SINGLE_VNODE:
          mount(nextChildren, container);
          break;

        case _flags.ChildrenFlags.NO_CHILDREN:
          break;

        default:
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = nextChildren[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var _child = _step6.value;
              mount(_child, container);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          break;
      }

      break;

    default:
      switch (nextChildFlag) {
        case _flags.ChildrenFlags.SINGLE_VNODE:
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = prevChildren[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var _child2 = _step7.value;
              container.removeChild(_child2.el);
            }
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
                _iterator7.return();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }

          mount(nextChildren, container);
          break;

        case _flags.ChildrenFlags.NO_CHILDREN:
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = prevChildren[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var _child3 = _step8.value;
              container.removeChild(_child3.el);
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
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
  var prevLen = prevChildren.length;
  var nextLen = nextChildren.length;
  var lessLen = Math.min(prevLen, nextLen);

  for (var _i = 0; _i < lessLen; _i++) {
    patch(prevChildren[_i], nextChildren[_i], container);
  }

  if (prevLen > nextLen) {
    for (var _i2 = lessLen; _i2 < prevLen; _i2++) {
      container.removeChild(prevChildren[_i2]);
    }
  } else if (nextLen > prevLen) {
    mount(nextChildren[i], container);
  }
}

function simplePatch(prevChildren, nextChildren, container) {
  var _iteratorNormalCompletion9 = true;
  var _didIteratorError9 = false;
  var _iteratorError9 = undefined;

  try {
    for (var _iterator9 = prevChildren[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
      var child = _step9.value;
      container.removeChild(child.el);
    }
  } catch (err) {
    _didIteratorError9 = true;
    _iteratorError9 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
        _iterator9.return();
      }
    } finally {
      if (_didIteratorError9) {
        throw _iteratorError9;
      }
    }
  }

  var _iteratorNormalCompletion10 = true;
  var _didIteratorError10 = false;
  var _iteratorError10 = undefined;

  try {
    for (var _iterator10 = nextChildren[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
      var _child4 = _step10.value;
      mount(_child4, container);
    }
  } catch (err) {
    _didIteratorError10 = true;
    _iteratorError10 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
        _iterator10.return();
      }
    } finally {
      if (_didIteratorError10) {
        throw _iteratorError10;
      }
    }
  }
}

function reactPatch(prevChildren, nextChildren, container) {
  var maxIndex = 0;

  for (var _i3 = 0; _i3 < nextChildren.length; _i3++) {
    var nextVNode = nextChildren[_i3];
    var found = false;

    for (var j = 0; j < prevChildren.length; j++) {
      var prevVNode = prevChildren[j];

      if (prevVNode.key == nextVNode.key) {
        found = true;
        patch(prevVNode, nextVNode, container);

        if (j < maxIndex) {
          var refNode = nextChildren[_i3 - 1].el.nextSibling;
          container.insertBefore(prevVNode.el, refNode);
        } else {
          maxIndex = j;
        }

        break;
      }
    } // 新元素


    if (!found) {
      var _refNode = _i3 - 1 < 0 ? prevChildren[0].el : nextChildren[_i3 - 1].el.nextSibling;

      mount(nextVNode, container, false, _refNode);
    }
  } // 删除元素


  var _loop = function _loop(_i4) {
    var prevVNode = prevChildren[_i4];
    var has = nextChildren.find(function (node) {
      return node.key === prevVNode.key;
    });

    if (!has) {
      container.removeChild(prevVNode.el);
    }
  };

  for (var _i4 = 0; _i4 < prevChildren.length; _i4++) {
    _loop(_i4);
  }
}

function vue2Patch(prevChildren, nextChildren, container) {
  var prevStartIdx = 0;
  var nextStartIdx = 0;
  var prevEndIdx = prevChildren.length - 1;
  var nextEndIdx = nextChildren.length - 1;
  var prevStartVNode = prevChildren[prevStartIdx];
  var nextStartVNode = nextChildren[nextStartIdx];
  var prevEndVNode = prevChildren[prevEndIdx];
  var nextEndVNode = nextChildren[nextEndIdx];

  while (prevStartIdx <= prevEndIdx && nextStartIdx <= nextEndIdx) {
    if (!prevStartVNode) {
      prevStartIdx++;
      prevStartVNode = prevChildren[prevStartIdx];
    } else if (!prevEndVNode) {
      prevEndIdx--;
      prevEndVNode = prevChildren[prevEndIdx];
    } else if (prevStartVNode.key === nextStartVNode.key) {
      patch(prevStartVNode, nextStartVNode, container);
      prevStartIdx++;
      nextStartIdx++;
      prevStartVNode = prevChildren[prevStartIdx];
      nextStartVNode = nextChildren[nextStartIdx];
    } else if (prevEndVNode.key === nextEndVNode.key) {
      patch(prevEndVNode, nextEndVNode, container);
      prevEndIdx--;
      nextEndIdx--;
      prevEndVNode = prevChildren[prevEndIdx];
      nextEndVNode = nextChildren[nextEndIdx];
    } else if (prevStartVNode.key === nextEndVNode.key) {
      patch(prevStartVNode, nextEndVNode, container);
      container.insertBefore(nextEndVNode.el, prevEndVNode.el.nextSibling);
      prevStartIdx++;
      nextEndIdx--;
      prevStartVNode = prevChildren[prevStartIdx];
      nextEndVNode = nextChildren[nextEndIdx];
    } else if (prevEndVNode.key === nextStartVNode.key) {
      patch(prevEndVNode, nextStartVNode, container);
      container.insertBefore(nextStartVNode.el, prevStartVNode.el);
      prevEndIdx--;
      nextStartIdx++;
      prevEndVNode = prevChildren[prevEndIdx];
      nextStartVNode = nextChildren[nextStartIdx];
    } else {
      var idxInPrev = prevChildren.findIndex(function (child) {
        return child.key === nextStartVNode.key;
      }); // 找到了

      if (idxInPrev >= 0) {
        var vnodeToMove = prevChildren[idxInPrev];
        patch(vnodeToMove, nextStartVNode, container);
        container.insertBefore(vnodeToMove.el, prevStartVNode.el); // 当遇到已经移动了的prev元素，直接跳过

        prevChildren[idxInPrev] = undefined;
      } else {
        mount(nextStartVNode, container, false, prevStartVNode.el);
      }

      nextStartIdx++;
      nextStartVNode = nextChildren[nextStartIdx];
    }
  }

  if (prevEndIdx < prevStartIdx) {
    for (var _i5 = nextStartIdx; _i5 <= nextEndIdx; _i5++) {
      mount(nextChildren[_i5], container, false, prevStartVNode.el);
    }
  } else if (nextEndIdx < nextStartIdx) {
    for (var _i6 = prevStartIdx; _i6 <= prevEndIdx; _i6++) {
      container.removeChild(prevChildren[_i6].el);
    }
  }
}

function vue3Patch(prevChildren, nextChildren, container) {
  var start = 0;
  var prevVNode = prevChildren[start];
  var nextVNode = nextChildren[start];
  var prevEnd = prevChildren.length - 1;
  var nextEnd = nextChildren.length - 1;

  outer: {
    while (prevVNode.key === nextVNode.key) {
      patch(prevVNode, nextVNode, container);
      start++;

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
      prevEnd--;
      nextEnd--;

      if (start > prevEnd || start > nextEnd) {
        break outer;
      }

      prevVNode = prevChildren[prevEnd];
      nextVNode = prevChildren[nextEnd];
    }
  }

  if (start > prevEnd && start <= nextEnd) {
    var refNode = nextEnd + 1 < nextChildren.length ? nextChildren[nextEnd + 1].el : null;

    for (var _i7 = start; _i7 <= nextEnd; _i7++) {
      mount(nextChildren[_i7], container, false, refNode);
    }
  } else if (start > nextEnd && start <= prevEnd) {
    for (var _i8 = start; _i8 <= prevEnd; _i8++) {
      container.removeChild(prevChildren[_i8].el);
    }
  } else {
    var prevStart = start;
    var nextStart = start;
    var nextLeft = nextEnd - nextStart + 1;
    var nextMap = {};
    var source = [];
    var moved = false;
    var pos = 0;
    var patched = 0;

    for (var _i9 = 0; _i9 < nextLeft; _i9++) {
      source.push(-1);
    }

    for (var _i10 = nextStart; _i10 <= nextEnd; _i10++) {
      nextMap[nextChildren[_i10].key] = _i10;
    } // 使用react的更新方式


    for (var _i11 = prevStart; _i11 <= prevEnd; _i11++) {
      var _prevVNode = prevChildren[_i11];

      if (patched < nextLeft) {
        var nextNodeIndex = nextMap[_prevVNode.key];

        if (nextNodeIndex !== undefined) {
          patch(_prevVNode, nextChildren[nextNodeIndex], container);
          patched++; // 更新source

          source[nextNodeIndex - nextStart] = _i11;

          if (nextNodeIndex < pos) {
            moved = true;
          } else {
            pos = nextNodeIndex;
          }
        } else {
          // 老的有，新的没有，移除
          container.removeChild(_prevVNode.el);
        }
      } else {
        container.removeChild(_prevVNode.el);
      }
    }

    if (moved) {
      var seq = (0, _util.lis)(source);
      var currentSeq = seq.length - 1;

      for (var _i12 = nextLeft - 1; _i12 >= 0; _i12--) {
        if (source[_i12] === -1) {
          // 没找到的 mount
          var _pos = nextStart + _i12;

          var _nextVNode = nextChildren[_pos];

          var _refNode2 = _pos + 1 < nextChildren.length ? nextChildren[_pos + 1].el : null;

          mount(_nextVNode, container, false, _refNode2);
        } else if (_i12 !== seq[currentSeq]) {
          // 移动
          var _pos2 = nextStart + _i12;

          var _nextVNode2 = nextChildren[_pos2];

          var _refNode3 = _pos2 + 1 < nextChildren.length ? nextChildren[_pos2 + 1].el : null;

          container.insertBefore(_nextVNode2.el, _refNode3);
        } else {
          // 不需移动
          currentSeq--;
        }
      }
    }

    var _loop2 = function _loop2(_i13) {
      var has = prevChildren.find(function (node) {
        return node.key === nextChildren[_i13].key;
      });

      if (!has) {
        var _refNode4 = _i13 + 1 > nextChildren.length ? null : nextChildren[_i13 + 1].el;

        mount(nextChildren[_i13], container, false, _refNode4);
      }
    };

    for (var _i13 = nextEnd; _i13 >= nextStart; _i13--) {
      _loop2(_i13);
    }
  }
}
},{"./flags":"src/flags.js","./patchData":"src/patchData.js","./h":"src/h.js","./util":"src/util.js"}],"src/index.js":[function(require,module,exports) {
"use strict";

var _h = require("./h");

var _render = _interopRequireDefault(require("./render"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var muitlChildrenBefore = (0, _h.h)('div', null, [(0, _h.h)('p', {
  key: 'a'
}, 'old a'), // h('p', { key: 'b' }, 'old b'),
(0, _h.h)('p', {
  key: 'c'
}, 'old c'), (0, _h.h)('p', {
  key: 'd'
}, 'old d')]);
var muitlChildrenAfter = (0, _h.h)('div', null, [(0, _h.h)('p', {
  key: 'b'
}, 'new b'), (0, _h.h)('p', {
  key: 'a'
}, 'new a'), // h('p', { key: 'd' }, 'new d'),
(0, _h.h)('p', {
  key: 'c'
}, 'new c')]);
(0, _render.default)(muitlChildrenBefore, document.getElementById('app'));
setTimeout(function () {
  (0, _render.default)(muitlChildrenAfter, document.getElementById('app'));
}, 2000);
},{"./h":"src/h.js","./render":"src/render.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "49926" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map