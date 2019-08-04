# ts文档—12

记录[ts文档](https://www.typescriptlang.org/docs/handbook/basic-types.html)学习时一些之前开发时可能没有注意到的问题。

- [Enums](https://www.typescriptlang.org/docs/handbook/enums.html#computed-and-constant-members)
- [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)



## 1. Enums

1. 运行时的枚举

    普通的枚举在运行时就是一个对象，因此

    ```ts
    enum E {
        X, Y, Z
    }
    
    function f(obj: { X: number }) {
        return obj.X;
    }
    
    // Works, since 'E' has a property named 'X' which is a number.
    f(E);
    ```

    这样是能够通过的，`E.X`的确存在。

2. 编译时的枚举

    想要得到所有枚举的键值，需要使用`keyof typeof`，而不是`keyof`。

3. 反映射（reverse mappings）

    字符串枚举成员是没有反映射的。

4. 常数枚举

    1. 使用

        ```ts
        // 直接使用const enum定义
        const enum Enum {
            A = 1,
            B = A * 2
        }
        ```

        

    2. 与普通枚举的不同点

        常数枚举在编译之后不会像普通枚举一样留下一个对象（因此性能上有优势），但是它的成员只能是常量枚举表达式。（字面量，其他枚举或者自己枚举已定义的值，`+/-/~`等一元操作符，`+/-/*//%`和一些位操作符）。

5. 环境枚举

    环境枚举用来声明项目中已经存在的枚举类型。使用`declare enum`来声明。

    它与`enum`的不同点在于，`enum`中没有初始值的成员被认为是常量，而环境枚举的总是被认为是计算成员。

## 2. 类型推断

1. 基本类型推断

    基本类型推断发生在`变量和成员初始化`，`给参数赋默认值`，`推断函数函数返回类型`等。

2. 最相同类型（best common type）

    在给有多个类型表达式的变量推断类型时，使用best common type这种类型。它根据所有表达式得到一个适用于所有表达式的类型。

    ```ts
    let x = [0, 1, null];  // typeof x: (number | null)[]
    
    let zoo = [new Rhino(), new Elephant(), new Snake()]; // type: (Rhino | Elephant | Snake)[]
    // 并不会被推到成 Animal[]，需要手动的给类型
    ```

3. 环境类型推断

    又是ts会根据函数所处的环境，自动给函数的参数附上一定的类型。比如：

    ```ts
    window.onmousedown = function(ev) {
        // ev是一个MouseEvent
        console.log(ev.button);
    }
    window.onscroll = function(ev) {
        //Error, Property 'button' does not exist on type 'UIEvent'.ts(2339)
        console.log(ev.button); 
    }
    ```

## 3. 类型兼容（structural subtyping）

1. ts类型兼容简介

    ts的类型兼容是基于结构类型的。不同于通过名称来区分类型（nominal typing），它仅仅是根据成员来决定类型的。实际上就是鸭子类型吧，长得像能发声就是。

    ```ts
    interface Named {
        name: string;
    }
    
    class Person {
        name: string;
    }
    
    let p: Named;
    // OK, because of structural typing
    p = new Person();
    ```

2. 简单的类型兼容

    **如果y有所有x有的属性（y的属性个数可以多于x的），那么就认为y兼容于x。**

    ```ts
    interface Named {
        name: string;
    }
    
    let x: Named;
    // y's inferred type is { name: string; location: string; }
    let y = { name: "Alice", location: "Seattle" };
    x = y;
    ```

    可以这么想，就是当把y赋给x时，对于x的所有成员的访问都是可行的，因为y有且和x的类型相同。但是y有x没有的成员，所以访问这些成员就会报错，所以不能`y = x`。

    同理，**在普通的**函数中传参中，这种规律也支持，即这个参数可以多很多很多属性。

3. 函数类型的比较

    - 基于函数参数的比较，参数多的可以接受参数少的，即**必须每一个参数都要有另一个函数的参数做对应**。原因就在于：

        ```ts
        let items = [1, 2, 3];
        
        // 不需要强制把不需要的参数补齐
        items.forEach((item, index, array) => console.log(item));
        
        // Should be OK!
        items.forEach(item => console.log(item));
        ```

    - 基于返回值的比较，返回成员少的返回类型可以兼容返回类型多的。因为拿到返回值操作，必须要有声明有的类型，和简单的类型兼容的规则一样。

        ```ts
        let x = (a: number) => 0;
        let y = (b: number, s: string) => 0;
        
        y = x; // OK
        x = y; // Error
        ```

    - 当把函数作为参数时的特殊表现（Function Parameter Bivariance）。在回调函数中，不能给一个范围较小的类型一个较大范围的值。

        ```ts
        enum EventType { Mouse, Keyboard }
        
        interface Event { timestamp: number; }
        interface MouseEvent extends Event { x: number; y: number }
        function listenEvent(eventType: EventType, handler: (n: Event) => void) {
            /* ... */
        }
        listenEvent(EventType.Mouse, (e: MouseEvent) => console.log(e.x + "," + e.y));
        ```

        正常的函数调用是期望你能给一个较大的类型，但是在回调函数时恰好相反，并且文档上给的例子完全不能说明为什么这么做啊。。

4. 枚举兼容性

    枚举是与number相互兼容兼容的，但是两个枚举之间是不兼容的。

    ```ts
    // let a: number;
    enum E1 {
        a,
    }
    
    enum E2 {
        a,
    }
    
    // a现在是type E1，可以强制转成number，就可以接受E2的枚举值了。
    let a = E1.a;
    
    // Error: Type 'E2' is not assignable to type 'E1'.ts(2322)
    a = E2.a;
    
    ```

5. 类的兼容性

    类的兼容性和对象类似，但是如果对象中有`private`或者`protected`属性的话，根据上节的记录，这些属性必须来自于统一类，即必须有“血缘”关系，且这些属性来自于同一祖先。

6. 泛型兼容性

    很难用语言解释。。。

    ```ts
    interface Empty<T> {
    }
    let x: Empty<number>;
    let y: Empty<string>;
    
    x = y; // 兼容的额，因为生成的实际类型并没有number和string的区分
    
    interface NotEmpty<T> {
        data: T;
    }
    let x: NotEmpty<number>;
    let y: NotEmpty<string>;
    
    x = y;  // 不兼容，生成的类型一个string一个number。
    ```

    