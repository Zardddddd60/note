# koa-router

koa-router从功能上可以划分成两个部分，第一部分是`use`，`get`，`post`等方法一层一层的**盖楼**，第二部分是当有请求进入时，请求像爬电梯一样一层一层的穿过楼层，**在每一个楼层中对`ctx`参数进行修饰，完成功能。**

从代码层面分为两个类，即`Router`类和`Layer`类，`Router`类负责提供API给用户并把用户注册的楼层存起来，而`Layer`是针对每一个楼层的封装，存储了每一个楼层的信息。

## 1. 注册（盖楼）

koa-router提供了`router.all`，`router.use`，`router.httpVerb`（get, post...），`router.register`等注册“楼层”的方法，其中`register`我们并不常用，但是却是注册“楼层”的核心方法，因为其他的注册方法内部最终都使用它完成了注册。所以首先先分析`router.register`的实现。

首先要思考一下，当一个请求进来时，如果判断这个**是否**要经过这个楼层，以及这个楼层**如何**对`ctx`参数做处理。

- 是否处理：什么方法的请求，什么路径的请求；
- 如何处理：回调函数；

这些都是一个楼层的信息，当注册楼层的时候，这些信息当然要知道。因此，`register`函数的参数也就很明了了。`path`指明针对什么路径的请求做处理，`methods`指明针对什么方法的请求做处理，`middleware`指明如何对请求做处理。

```js
Router.prototype.register = function (path, methods, middleware, opts) {
  var router = this;
  var stack = this.stack;

  // 生成楼层
  var route = new Layer(path, methods, middleware, {
    // 在use里设置成了false
    end: opts.end === false ? opts.end : true,
    name: opts.name,
    // 下边是一些给path-to-regexp的参数；
    sensitive: opts.sensitive || this.opts.sensitive || false,
    strict: opts.strict || this.opts.strict || false,
    prefix: opts.prefix || this.opts.prefix || "",
    ignoreCaptures: opts.ignoreCaptures
  });

  // 暂时不看一些对于楼层信息的补充的操作；记得这里有这些即可
  // if (this.opts.prefix) {
  //  route.setPrefix(this.opts.prefix);
  // }

  // add parameter middleware
  // Object.keys(this.params).forEach(function (param) {
  //   route.param(param, this.params[param]);
  // }, this);
  stack.push(route);

  return route;
};
```

可以看到，`register`就是生成一个`Layer`对象，并压入`Router`的`stack`属性中。

实际上，`all`，`httpVerb`注册的中间件和`use`注册的中间件是有区别的。通常使用`all`和`httpVerb`注册的都是**业务中间件**，即通常都是针对某个具体的请求做处理，而`use`注册的中间件**通常**都是**功能中间件**，即对所有的进入的请求都进行处理。因此，通过`all`和`httpVerb`注册的“楼层”可以拥有一个`name`，即`opts.name`参数。

```js
const Router = require('koa-router');
const app = new require('koa');
const router = new Router();

router.use(async (ctx, next) => {
    ctx.body = 'Hello World';
    next();
});

router.get('route1', '/route1', async (ctx, next) => {
    ctx.someData = 'from route1';
    next();
});

router.post('route2', '/route2', async (ctx, next) => {
    ctx.someData2 = 'from route1';
    next();
});

router.all('route3', '/route3', async (ctx) => {
    ctx.someData3 = 'from route1';
});

app.use(router.routes());

```

通过上述代码注册的楼层如下。

![](https://haitao.nos.netease.com/be0ec45e-2f43-42fa-a98e-c3e780b94dfa_764_322.png)

如果不做参数预解，路径嵌套等骚操作，楼层的注册就是这么简单。

## 2. 请求处理（ctx穿越楼层）

楼搭好以后，通过`app.use(router.routes())`使整个楼成为koa众多中间件的一个。因此，请求处理的逻辑在`routes`方法中。

```js
Router.prototype.routes = Router.prototype.middleware = function () {
    var dispatch = function dispatch(ctx, next) {
        // ...
    }
    return dispatch;
};
```

`router.routes()`执行后返回一个函数，接受`ctx`和`next`两个参数，符合koa中间件的规则。

假设请求的method是`get`，请求的路径是`route1`，那么实际上楼的顶上两层是不需要对这个请求做任何处理。

![](https://haitao.nos.netease.com/a377aa0d-5374-464b-95c8-d81ce015eac0_925_285.png)

因此，当请求进来时，`dispatch`函数要先过滤掉不应该有的楼层。

```js
function dispatch(ctx, next) {
    var path = router.opts.routerPath || ctx.routerPath || ctx.path;
    var matched = router.match(path, ctx.method);
}
```

其中，`router.match`方法就是用来取到**对于这次请求`path`和`method`对应的楼层**。基本上就是在注册楼层时，传入的`path`通过[path-to-regexp](https://www.npmjs.com/package/path-to-regexp)生成一个路径正则。如果这个正则匹配了本次请求的路径，则会被添加到`matched.path`数组中;如果正好有楼层`path`和`method`都匹配，或者通过`router.use`注册的不需要匹配特定`method`的楼层（比如上图中最底下那种楼层），则这个楼层被添加到`matched.pathAndMethod`中，如果有一个指定了`method`的楼层与这次请求匹配（即不能是use注册的），则`matched.route`置为true。

现在知道了所有`matched`属性的意义，就可以往下看了。

```js
function dispatch(ctx, next) {
    // ...
    var layerChain, layer, i;

    if (ctx.matched) {
      ctx.matched.push.apply(ctx.matched, matched.path);
    } else {
      ctx.matched = matched.path;
    }

    ctx.router = router;

    if (!matched.route) return next();

    var matchedLayers = matched.pathAndMethod
    var mostSpecificLayer = matchedLayers[matchedLayers.length - 1]
    ctx._matchedRoute = mostSpecificLayer.path;
    if (mostSpecificLayer.name) {
      ctx._matchedRouteName = mostSpecificLayer.name;
    }
    // ...
}
```

这一段基本上都是针对`matched`进行一系列的操作。比如会把所有匹配到的“楼层”都挂在`ctx.matched`上，把当前`router`对象挂在`ctx.router`上。**如果没有一个楼层的方法与本次请求的方法精确匹配**，则不再继续走整个楼。

即当`method`是`get`，`path`是`/route2`时，此时虽然最下边一层通过`use`注册的楼层匹配到了，但是koa-router认为针对这个请求，这个router没有对其做任何处理，直接`return next();`了。

再来看最后一部分。

```js
function dispatch(ctx, next) {
    layerChain = matchedLayers.reduce(function(memo, layer) {
      memo.push(function(ctx, next) {
        ctx.captures = layer.captures(path, ctx.captures);
        ctx.params = layer.params(path, ctx.captures, ctx.params);
        ctx.routerName = layer.name;
        return next();
      });
      return memo.concat(layer.stack);
    }, []);

    return compose(layerChain)(ctx, next);
}
```

通过数组的reduce方法重新整理了一下匹配到的所有楼层，最后经过`koa-compose`把它们组合在一起，根据之前的`koa-compose`分析，已知它能把一组接受`(ctx, next)`的函数串成洋葱圈，因此这里我们只看这组函数是怎么生成的。

首先它在每一个匹配到的楼层之前都插了一层。

![](https://haitao.nos.netease.com/936c409f-38bb-427f-9330-68a32876901c_764_322.png)

插入的这一层只负责在`ctx`对象上挂`captures`，`prams`和`routerName`三个属性。`ctx.params`经常用到，当注册了一个`/route/:id`这样的路由时，会把`/route/1`这样的实际请求的`ctx.params.id = 1`。`layer.captures`涉及到[path-to-regexp](https://www.npmjs.com/package/path-to-regexp)的知识，这里只需要知道，对于注册路径`/:foo/:bar`的楼层，针对请求路径是`/test/route`的请求，`layer.captures`生成的是`['test', 'route']`即可，也就是把匹配指定位置的参数值摘下来；

而`layer.params`的作用则是根据“摘”下来的值，生成日常使用的`{foo: 'test', bar: 'route'}`对象；

`routerName`就是楼层的`name`属性，可能会给别的中间件用到。