# ts文档—4

记录[ts文档](https://www.typescriptlang.org/docs/handbook/basic-types.html)学习时一些之前开发时可能没有注意到的问题。

- [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)

## 1. 什么是decorator

decorator是一种可以加在类，类方法，类访问器和类属性和参数上的一种特殊的声明。它使用`@expression`这种形式，其中，expression在求值后必须是一个函数，函数在运行时被调用且decorator的声明信息作为参数传入。

对于一个声明上的多个装饰器，它的调用顺序是

```ts
function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("g(): called");
    }
}

class C {
    @f()
    @g()
    method() {}
}

// f(): evaluated
// g(): evaluated
// g(): called
// f(): called
```

## 2. method decorator

最好的学习方式还是看tsc是把ts代码转成什么样的js代码。拿一个比较简单的例子。

```ts
function f() {
    console.log("f(): evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("g(): called");
    }
}

class C {
    @f()
    @g()
    method() {}
}
```

```js
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey, descriptor) {
        console.log("f(): called");
    };
}

function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey, descriptor) {
        console.log("g(): called");
    };
}
class C {
    // @f @g 装饰器标识没了
    method() {}
}

// 进行额外处理；
__decorate([
    f(),
    g()
], C.prototype, "method", null);
```

1. 首先当给一个类中的方法加decorator时，编译后的js代码首先声明了一个类，被加了decorator的成员函数变成了没加装饰器的样子；
2. 在类声明完之后，对加了修饰符的方法进行了额外处理，即调用添加装饰器函数`__decorate`，注意到**它是按照decorator声明顺序，在函数执行之前执行的**；
3. 看到`__decorate`函数的参数有四个，第一个是多个decorator函数**执行**返回结果的数组，第二第三个分别是`类的原型链对象`和被修饰的`成员名`，最后一个参数是null。因为这里是ts编译后的结果，所以实际上我们并不能自己给null付赋值或者不传值，它就是一个null。如果`__decorate`函数本身对传参就行判断并进行了不同操作，那一定是tsc还会把别的ts语法编译成调用`__decorate`函数的形式；
4. 直接看`__decorate`的实现。参数`c`是参数长度，本例中是4；参数`r`根据参数长度不同取不同的值，对于本例来说，它的值是`Object.getOwnPropertyDescriptor(C.prototype, 'method')`，即得到被修饰方法的属性描述符；
5. 不看`Reflect.decorate`，直接走else分支。可以看到，对于`decorate`数组的遍历，是**从后往前的，即先执行g()的返回值函数，再执行f()的返回值函数**。执行的参数也是根据`__decorate`函数的参数的不同有所区分的。针对本例的参数是`d(target, key, r)`，即第一个参数依然是`C.prototype`，第二个参数依然是`'method'`，第三个参数是`Object.getOwnPropertyDescriptor(C.prototype, 'method')`。**注意它会把第一个函数的返回作为成员修饰符作为下一个decorate函数的修饰符参数（第三个参数）**。如果不返回，则把之前的成员修饰符传入到下一个`decorate`函数。**`decorate`函数可以直接修改成员修饰符，也可以返回一个新的成员修饰符，这些修改都会被记录**；
6. 最后把新的成员修饰符真正赋给成员。

> 可以看到，method decorator的真实意义就在于对成员修饰符的改变。

## 3. Property Decorator

还是直接看代码。

```ts
function f() {
    console.log("f(): evaluated");
    return function (target: any, propertyKey: string) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target: any, propertyKey: string) {
        console.log("g(): called");
    }
}

class C2 {
    @f()
    @g()
    prop: string = '1';

    method() {}
}
```

```js
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length,
        // 这里的r是不一样的undefined了
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            // tsc会对decorator做显示，所以decorator的返回值实际上
            if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey) {
        console.log("f(): called");
    };
}

function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey) {
        console.log("g(): called");
    };
}
class C2 {
    constructor() {
        this.prop = '1';
    }
    method() {}
}
__decorate([
    f(),
    g()
], C2.prototype, "prop", void 0);
//# sourceMappingURL=index3.js.map
```

可以看到，**除了`__decorate`函数的第四个参数从null变成undefined之外**，没有任何改变。首先确定显示的传了`undefined`和不传会不会对`arguments.length`造成不同的影响。

```js
function foo(a, b) {
    console.log(arguments.length);
}
foo(1); // 1
foo(1, undefined); // 2
```

可以看到显式的传一个`undefined`也会算一个参数长度。因此`__decorator`函数的参数长度依然是4。

因此直接分析`__decorate`函数，当第四个参数不是`null`而是`undefined`的表现。首先变量`r`的初始值变为`undefined`，然后在执行每一个`decorate`函数时，它的第三个参数也是undefined的，这里有一点要注意，就是如果前一个`decorate`函数有返回，那么就会用作下一个`decorate`函数的第三个参数，并且最后会用的成员修饰符赋给被修饰的属性。**所以，Property Decorator千万不要有返回**。（虽然tsc会报错 The return type of a property decorator function must be either 'void' or 'any'.）

## 4. Parameter Decorator

```ts
function f() {
    console.log("f(): evaluated");
    return function (target: any, propertyKey: string, index: number) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target: any, propertyKey: string, index: number) {
        console.log("g(): called");
    }
}

class C3 {
    prop: string = '1';

    method(@f() @g() arg1: number) {
        console.log(arg1);
    }
}
```

```js
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) {
        decorator(target, key, paramIndex);
    }
};

function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey, index) {
        console.log("f(): called");
    };
}

function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey, index) {
        console.log("g(): called");
    };
}
class C3 {
    constructor() {
        this.prop = '1';
    }
    method(arg1) {
        console.log(arg1);
    }
}
__decorate([
    __param(0, f()), __param(0, g())
], C3.prototype, "method", null);
//# sourceMappingURL=index3.js.map
```

可以看到，`Parameter Decorator`与`Method Decorator`最大的区别就是对传入`__decorate`函数的每一个参数都做了一层包装，即用`__param`函数包装，实际上`__param`仅仅是为了拿`paramIndex`参数做的一个闭包。。剩下的就和`Method Decorator`一样了。因为传入的是`C3.prototype`和`method`。可以看到，**它并不能改变参数**，而是和`Method Decorator`一样改变这个函数的行为（通过修改descriptor.value）。

## 5. Class Decorator

```ts
function f() {
    console.log("f(): evaluated");
    return function (target: Function) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target: Function) {
        console.log("g(): called");
    }
}

@f()
@g()
class C {
    
}
```

```js
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length,
        // r = target;
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            // r = d(r) || r;如果不返回r的话基本就没啥意义了~
            if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    // return r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

function f() {
    console.log("f(): evaluated");
    return function (target) {
        console.log("f(): called");
    };
}

function g() {
    console.log("g(): evaluated");
    return function (target) {
        console.log("g(): called");
    };
}
let C = class C {};
C = __decorate([
    f(),
    g()
], C);
//# sourceMappingURL=index2.js.map
```

1. 首先，**`__decorate`的返回值是会替代掉原来的构造函数**，也就是可以生成一个新的构造函数代替老的；
2. 传入`__decorate`的参数只有两个，因此`__decorate`的行为和其他的都不一样；
3. `__decorate`的执行也很简单，即对于每一个`decorate`，都把`Target`类（或者经过前一个`decorate`函数`decorate(i - 1)(Target)`）作为参数传入，并在最后把生成的新的类赋值给类名，替代原来的类。