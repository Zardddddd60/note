# koa-compose

koa-compose的代码非常简单，去掉注释和参数检查也就只有十几行，但是包含了很多js的基础知识。这里不直接从源代码开始说，而是从自己实现一个koa-compose的角度去说。

koa-compose的目的就是把**执行一个数组里的所有函数，前一个函数可以动态的决定后一个函数的执行时机。**现在假设我们有一组函数，我们希望在第一个函数执行时调用第二个函数，然后在第二个内执行时调用第三个函数。

```js
function f1() {
    console.log('in f1');
    f2();
    console.log('after in f1');
}

function f2() {
    console.log('in f2');
    f3();
    console.log('after in f2');
}

function f3() {
    console.log('in f3');
    console.log('after in f3');
}

f1();

// in f1
// in f2
// in f3
// after in f3
// after in f2
// after in f1
```

可以看到这就与koa的**洋葱圈**模型很相似了，加上`async`和`await`支持异步的话就更像了。但是这里还不能满足需求。因为它不够**“动态”**，必须在函数内指定要调用的方法（f1内的`f2()`，f2内的`f3()`），现在想在不知道是**下一个函数是啥的情况下也能正确的调用**。因此，把要调用的函数作为参数传入的执行函数内，执行函数本身并不知道传入的参数是啥，只知道要执行以下它即可。

```js
function f1(funcIndex) {
    console.log('in f1');
    const next = funcArr[funcIndex];
    typeof next === 'function' && next(funcIndex + 1);
    console.log('after in f1');
}

function f2(funcIndex) {
    console.log('in f2');
    const next = funcArr[funcIndex];
    typeof next === 'function' && next(funcIndex + 1);
    console.log('after in f2');
}

function f3(funcIndex) {
    console.log('in f3');
    const next = funcArr[funcIndex];
    typeof next === 'function' && next(funcIndex + 1);
    console.log('after in f3');
}

const funcArr = [f1, f2, f3];
let nextIndex = 1;

f1(nextIndex);

```

可以看到，现在f1在执行时已经完全不知道下一个函数是啥了，它接收一个index参数，用来从`funcArr`中取下对应的`next`函数，并执行即可。

走到这里依然有优化的空间，可以看到每一个函数都有一段相同的，**与实际业务没有关系的代码**，当然要把这部分代码抽出来。最好的情况是只接受一个函数，我们执行这个函数即可。

```js
const funcArr = [f1, f2, f3];
// 使用一个dispatch外边的变量控制要执行的函数
let index = 0;
function dispatch() {
    // 取当前要执行的函数；
    const fn = funcArr[index];
    if (!fn) {
        // 当是最后一个时，不执行；
        return;
    }
    index ++;
    // 注入下一个函数；
    fn(dispatch);
}

// 开始函数的执行；
dispatch();

```

可以看到，给执行函数注入调用函数的操作已经封装成一个函数，当执行dispatch时，可以对`funcArr`内的几个函数进行依次执行的操作。

看起来功能已经完成了，但是依然有优化的空间。当前情况下使用一个外部变量`index`来确定要被调用的函数，但是如果`index`被无意篡改了，就不能正确的按顺序执行了。比如在`f1`中操作了index。

```js
function f1(next) {
    console.log('in f1');
    index ++;
    next();
    console.log('after in f1');
}

// in f1
// in f3
// after in f3
// after in f1
```

现在需要找到一种不依赖于外部变量的方法，这是需要利用到`bind`方法的**柯里化**特性。

```js
function a(arg) {
    console.log(arg);
}

const b = a.bind(null, 'b')

b(); // b
```

可以看到，`b()`在执行时已经提前被注入了一个参数，使用这个特性，我们可以在`next`，也就是`dispatch`被执行时，提前把index注入进去。这样就不依赖一个外部属性了。也就不存在外部属性被篡改的问题了。

```js
const funcArr = [f1, f2, f3];
function dispatch(index) {
    const fn = funcArr[index];
    if (!fn) {
        return;
    }
    // 注入dispatch函数的唯一参数，后边调用时传的参数全部作废了。
    fn(dispatch.bind(null, index + 1));
}

dispatch(0);
```

至此，已经和koa-compose的实现差不多了，`funcArr`变量作为参数传入进来，使用闭包依次访问`funcArr`的各个函数。完成funcArr中所有函数的依次执行。





