# ts文档—1

记录[ts文档](https://www.typescriptlang.org/docs/handbook/basic-types.html)学习时一些之前开发时可能没有注意到的问题。

- [Basic Types](https://www.typescriptlang.org/docs/handbook/basic-types.html)
- [Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [Classes](https://www.typescriptlang.org/docs/handbook/classes.html)
- [Functions](https://www.typescriptlang.org/docs/handbook/functions.html)
- [Generics](https://www.typescriptlang.org/docs/handbook/generics.html)



## 1. Basic Types

1. enum

    enum既可以作为类型（类型空间），也可以作为变量（变量空间）。

2. void

    被标记为void类型的变量，只可以用`null`或`undefined`赋值。通常void用于没有返回值的函数。

    ```ts
    function foo(): void {
        console.log(123);
    }
    ```

3. null和undefined

    null和undefined是任何类型的**子类型**，所以它们能赋值给**任何**其他类型。

    ```ts
    let npc: number = null; // allowed
    ```

    当设置了`strictNullChecks`时，就不再可以把`null`和`undefined`赋值给其他类型了，只能赋值给`any`以及它们自己的类型（`undefined`可以赋值给`void`类型）。

    ```ts
    // Type 'null' is not assignable to type 'number'.ts(2322)
    let npc: number = null;
    ```

4. object

    `object`类型代表了它是一个**非基础类型（string, number, boolean, symbol, null, undefined）**。我个人的感觉object用来形容一个左值时用处比较大，

    ```ts
    declare function create(o: object | null): void;
    
    create({prop: 0}); // allowed
    create(null); // allowed
    
    create('string'); // not allowed
    ```

## 2. Interfaces

1. readonly

    interface也是支持`readonly`修饰符的；

    ```ts
    interface IInter {
        readonly ro: string;
    }
    ```

    除了对一个基础类型设置`readonly`防止被更改之外，使用`ReadonlyArray<T>`这种新类型可以防止数组被更改，并且可以通过类型声明的方式把它赋值给普通数组。

    ```ts
    let roArr: ReadonlyArray<number> = [1, 2, 3];
    
    // Property 'push' does not exist on type 'readonly number[]'.ts(2339)
    roArr.push(123);
    
    // Index signature in type 'readonly number[]' only permits reading.ts(2542)
    roArr[1] = 60;
    
    // allowed
    let arr: number[] = roArr as number[];
    ```

2. 对于对象字面量的特殊检查

    ```ts
    interface SquareConfig {
        color?: string;
        width?: number;
    }
    
    function createSquare(config: SquareConfig): { color: string; area: number } {
        // ...
        return {
            color: '',
            area: 0,
        };
    }
    
    // Argument of type '{ colour: string; width: number; }' is not assignable to parameter of type 'SquareConfig'.
    // 对于对象字面量的特殊检查，即使有width这个属性，看起来符合SquareConfig的设置，
    // 只要有一个属性(colour)不存在在interface里，就失败；
    let mySquare = createSquare({ colour: "red", width: 100 });
    
    // allowed
    let squareOptions = { colour: "red", width: 100 };
    let mySquare2 = createSquare(squareOptions);
    
    // allowed
    let squareOptions2 = { colour: "red", width1: 100 };
    let mySquare3 = createSquare(squareOptions);
    ```

    对于对象字面量，只要有一个属性不在接口里，视为失败。因为squareOptions在作为参数时不是一个对象字面量，所以跳过了针对对象字面量的检查。但是，如果没有一个属性与interface一样的话，依然会报错。（**文档上说会报错，但是实际试过之后发现并没有。应该是要设置某个compilerOption吧**）

3. 函数类型

    interface除了能够定义对象的“样子”，也可以描述函数应该是什么样的。

    给函数一个**调用签名（call signature）**，既可使interface描述函数。

    ```ts
    interface IFunc {
        // call signature
        (source: string, subString: string): boolean;
    }
    
    let func: IFunc = (sou, sub) => {
        return true;
    };
    ```

    注意函数定义时的参数名可以不同于接口定义的参数名，但是类型一定要一样。

4. 索引类型

    索引签名（index signature）的类型应是`string`或者`number`的一种，且`number`索引的属性**必须**是`string`索引的**子类型（subtype）**。

    ```ts
    class Animal {
        constructor(public name: string) {};
    }
    class Dog extends Animal {
        constructor(public breed: string) {
            super('dog');
        };
    }
    interface NotOkay {
        // Numeric index type 'Animal' is not assignable to string index type 'Dog'.ts(2413)
        [x: number]: Animal;
        [x: string]: Dog;
    }
    ```

    从报错上可以看出，是因为最后要**把数字索引类型的赋值给字符串索引类型**，因此数字索引的类型必须要字符串索引的类型的子集才能赋值。

    并且，定义了索引后，其他的所有属性的类型**必须也是这个索引属性的类型或者子类型**。

5. 类接口

    **类本身有两种类型：实例类型和静态类型，其中构造函数处于静态类型。当类“实现”（implement）接口时，只有实例类型才会被检查。**

    ```ts
    interface ClockConstructor {
        // not allowed
        new (hour: number, minute: number);
    }
    
    // not allowed
    class Clock implements ClockConstructor {
        currentTime: Date;
        constructor(h: number, m: number) { }
    }
    ```

    如果实在想要设置构造函数的类型，应该这样。

    ```ts
    interface ClockConstructor {
      new (hour: number, minute: number);
    }
    
    interface ClockInterface {
      tick();
    }
    
    const Clock: ClockConstructor = class Clock implements ClockInterface {
      constructor(h: number, m: number) {}
      tick() {
          console.log("beep beep");
      }
    }
    
    ```

6. 接口支持多继承

7. 混合类型

    之前js很多库都是返回一个函数并且在函数又挂了很多属性或者函数，这时就用到了混合类型。

    ```ts
    interface Counter {
        // 是一个函数，可执行
        (start: number): string;
    	// 又在上边挂了属性和方法；
        interval: number;
        reset(): void;
    }
    
    function getCounter(): Counter {
        // 本身是一个函数
        let counter = (function (start: number) { }) as Counter;
        // 往函数上加属性和方法；
        counter.interval = 123;
        counter.reset = function () { };
        return counter;
    }
    
    let c = getCounter();
    c(10);
    c.reset();
    c.interval = 5.0;
    ```

8. 接口对于类的继承

    首先，类即使一个变量，又是一个类型，所以可以被继承。

    ```ts
    class Control {
        publi state: number = 123;
    }
    interface SelectableControl extends Control {
        select(): void;
    }
    ```

    但是如果这个被继承的类有私有属性（private）或者保护属性（protected），那么只有这个类的子类才能“实现”这个接口。因为继承了类的接口“得到了”类所有的属性，包括私有属性，和保护属性。**只有这个类的子类的保护属性或私有属性才与这个被继承类的保护或私有属性源自同一个声明**，其他的就算是长的像，也不是同一个声明。

    ```ts
    class Control {
        private state: any;
    }
    
    interface SelectableControl extends Control {
        select(): void;
    }
    
    // Class 'Image1' incorrectly implements interface 'SelectableControl'.
    // Types have separate declarations of a private property 'state'.ts(2420)
    class Image1 implements SelectableControl {
        private state: any;
        select() { }
    }
    ```

## 3. Classes

1. 子类方法父类的构造函数和方法。

    在子类的`constructor`通过`super()`来调用父类的构造函数，在普通方法中，通过`super.methodName`访问被“覆盖的”父类方法。

2. 类实例相互赋值

    当两个类中没有`private`或者`protected`属性时，只要两个类的实例类型完全相同，两个类就可以相互赋值。或者一个子类实例（不一定是子类，只要包含所有父实例类型即可）赋值给一个父类实例。

    ```ts
    class Base {
        public a: string = '';
    }
    
    class Child {
        public a: string  = '123';
    }
    
    class Child2 {
        public a: string = '123';
        public b: string = '222';
    }
    
    let a: Base = new Base();
    let b: Child = new Child();
    let c: Child2 = new Child2();
    
    a = b;
    b = a;
    ```

    但是当出现`private`或者`protected`时，必须要求两者有通过一个`起源`，即在同一个地方进行声明。

    ```ts
    class Base {
        private a: string = '';
    }
    
    class Child extends Base {
        public b: string = '';
    }
    
    class Child3 {
        private a: string = '';
    }
    
    let a = new Base();
    let b = new Child();
    let c = new Child3();
    
    // allowed
    // a = b;
    
    // Type 'Child3' is not assignable to type 'Base'.
    //  Types have separate declarations of a private property 'a'.ts(2322)
    a = c;
    
    ```

3. `protected`类型的构造函数

    如果一个类的构造函数用`protected`修饰，那它不能在外部new，而只能在被继承的子类的构造函数中被`super()`调用。

4. getter/setter

    没有setter，有getter的属性和`readonly`没什么不同。

5. 使用`typeof`得到类的静态类型

    ```ts
    class Greeter {
        static standardGreeting = "Hello, there";
        greeting: string;
        greet() {
            if (this.greeting) {
                return "Hello, " + this.greeting;
            }
            else {
                return Greeter.standardGreeting;
            }
        }
    }
    
    // 实例类型，用来限定实例的类型
    let greeter1: Greeter;
    greeter1 = new Greeter();
    
    // typeof Greeter得到类的静态类型
    let greeterMaker: typeof Greeter = Greeter;
    greeterMaker.standardGreeting = "Hey there!";
    
    let greeter2: Greeter = new greeterMaker();
    ```

    使用`typeof name`作为一个类型时，它的意思是：**得到name的所有类型**。对于类来说，它的typeof就是得到它的静态类型，即它本身的类型。

## 4. Generics

1. 声明是泛型

    可以把泛型想象成类型空间的参数，在实例化一个泛型类，继承一个泛型接口，调用泛型函数时（可不传，推导），把这个**类型空间**的参数传入。

2. 限制泛型

    又是虽然传入的是任意的泛型，但是可能会访问到参数的某个属性（比如访问传入参数的length属性），这时需要对传入的泛型进行限制。

    ```ts
    interface Lengthwise {
        length: number;
    }
    
    function loggingIdentity<T extends Lengthwise>(arg: T): T {
        console.log(arg.length);  // Now we know it has a .length property, so no more error
        return arg;
    }
    ```

    通过`<T extends Lengthwise>`使得这个泛型必须有某个属性，从而允许在函数内部访问这个属性而不报错。

3. 基于某个泛型的泛型参数

    可以定义多个泛型，并且可以针对某个泛型定制另一个泛型的类型。

    ```ts
    function getProperty<T, K extends keyof T>(obj: T, key: K) {
        return obj[key];
    }
    
    let x = { a: 1, b: 2, c: 3, d: 4 };
    
    getProperty(x, "a"); // okay
    getProperty(x, "m"); // error: Argument of type 'm' isn't assignable to 'a' | 'b' | 'c' | 'd'.
    ```

4. 如何写一个构造函数的类型

    1. 使用`tyoepf`：上文已经介绍过

        ```ts
        class A {}
        
        const B: typeof A = A;
        ```

    2. 构造签名(construct signature)

        构造签名和调用签名（call signature）一样。用`{}`包起来。

        ```ts
        class A {
            static test = 123;
        }
        
        const B: { new (): A, test: number} = A;
        ```

        注意如果A有静态属性，可以在new旁边补齐，使B更加“准确”。

