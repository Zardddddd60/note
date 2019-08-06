# ts文档—3

记录[ts文档](https://www.typescriptlang.org/docs/handbook/basic-types.html)学习时一些之前开发时可能没有注意到的问题。

- [Advanced Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html)

## 1. Advanced Types

1. 交叉类型（intersection Types）

    交叉类型把多个类型合成一个，交叉类型通常用于mixin以及一些非传统的面向对象方法中。

    ```ts
    // 不extends object的话hasOwnProperty会报错；
    function extend<First extends object, Second extends object>(first: First, second: Second): First & Second {
        // Partial是ts内置的类似于类型函数的东西；
        const result: Partial<First & Second> = {};
        for (const prop in first) {
            if (first.hasOwnProperty(prop)) {
                (result as First)[prop] = first[prop];
            }
        }
    
        for (const prop in second) {
            if (second.hasOwnProperty(prop)) {
                (result as Second)[prop] = second[prop];
            }
        }
        // 强行as回来，因为能够确保类型；
        return result as First & Second;
    }
    
    extend({a: 1}, {b: 2});
    ```

2. 联合类型（Union Types）

    联合类型表示这个类型是几个类型中的这一种。

    **我们只能访问到联合类型中都存在的成员，因为只有这些都存在的成员才确保是一定存在的**。

    ```ts
    interface A {
        x: string;
        y: string;
    }
    
    interface B {
        x: number;
        z: string;
    }
    
    function getSth(): A | B {
        return Math.random() < 0.5 ? {
            x: '1',
            y: '1',
        } : {
            x: 1,
            z: '1',
        };
    }
    
    const sth = getSth();
    
    sth.x; // string | number 都有可能
    
    // Property 'y' does not exist on type 'A | B'.
    // Property 'y' does not exist on type 'B'.ts(2339)
    sth.y;
    
    ```

3. 类型保护（type guard）

    类型守护是**在运行时（runtime）进行类型检查的**的表达式。也就是说，这些代码实际上不会被tsc剥离，会存在于最终的代码中。

    - 使用类型断言（type predicates）

        需要定义一个返回类型是类型断言的函数。

        ```ts
        function isA(sth: A | B): sth is A {
            return (sth as A).y !== undefined;
        }
        ```

        其中，`sth is A`是类型断言。一个类型断言的基本格式是`parameterName is Type`，`parameterName`必须是当前函数签名的**某一个参数**，也就是本例中的`sth`。ts在检测到类型断言函数后会**缩小**变量的类型为这个类型。**最厉害的是它也知道else分支就是另一个类型**。

        ```ts
        if (isA(sth)) {
            // type A
            sth.x;
        } else {
            // type B
            sth.z;
        }
        ```

    - 使用`in`操作符

        `in`操作符也可以被ts用来所有类型的范围。

        ```ts
        if ('y' in sth) {
            // type A
            sth.y
        } else {
            // type B
            sth.z
        }
        
        ```

        同时，它也能识别另一个分支一个是B类型。

    - 使用`typeof`

        `typeof`也可以被用作类型保护的表达式。注意`typeof `不能通过对对象成员的判断决定对象的类型。(感觉有点鸡肋了啊)

        ```ts
        if (typeof sth.x === 'string') {
            // Property 'y' does not exist on type 'A | B'.
          	// Property 'y' does not exist on type 'B'.ts(2339)
            sth.y;
        }
        ```

        只能用于简单类型的判断。

        ```ts
        function re(a: string | number) {
            if (typeof a === 'string') {
                a.trim();
            } else {
                a.toFixed(2);
            }
        }
        ```

        注意typeof检查的类型必须是`string`，`number`，`boolean`，`symbol`中的一种，如果是其他的字符串，则ts不会认为它是类型保护的一种。

    - `instanceof`类型保护

        与typeof基本一致，用于对象是否是某个类的判断。

4. Nullable类型

    `Nullable`包含两种类型`null`和`undefined`。在没有设置`strictNullChecks`的情况下，null和undefined是可以赋值给任何类型的变量的。

    主要可选参数实际上就是给参数在原类型基础上加了一个`undefined`类型。

    Nullable参数可以通过类型守护来剥离`null`值，使它成为一个纯粹的值（string，number等）。

    ```ts
    function f(sn: string | null): string {
        // 剥离null值
        return sn || "default";
    }
    ```

    也可以通过类型断言的方式来“剥离”null值，其中有一个简写。

    ```ts
    function f(str: string | null) {
        return str!.charAt(0);
    }
    ```

5. 字符串字面量类型（String Literal Types）和数字字面量类型（Numeric Literal Types）

    字符串字面量类型指定一个字符串类型必须有的值，与联合类型结合使用能起到类似于枚举的行为。

6. 可辨识联合（Discriminated Unions）

    可辨识联合三要素：

    - 所有类型都有相同的，属性值不重复的属性；（也就是说联合类型中每一个都要有某一个key值相同属性，且属性值不同。）；
    - 联合了多个类型；
    - 对相同的属性实施了类型保护；

    ```ts
    interface Square {
        kind: "square";
        size: number;
    }
    interface Rectangle {
        kind: "rectangle";
        width: number;
        height: number;
    }
    interface Circle {
        kind: "circle";
        radius: number;
    }
    
    type Shape = Square | Rectangle | Circle;
    
    function area(s: Shape): number {
        switch (s.kind) {
            case "square": return s.size * s.size;
            case "rectangle": return s.height * s.width;
            case "circle": return Math.PI * s.radius ** 2;
        }
    }
    ```

    其中，`kind`就是相同key的属性值，且所有联合成员的`kind`值都不相同。类型`Shape`联合了多个类，且在`area`函数中对`kind`属性进行了类型保护。

7. 穷举检查（Exhaustiveness checking）

    tsc会告诉我们是否对可辨析联合的所有可能都做了处理。

    ```ts
    type Shape = Square | Rectangle | Circle | Triangle;
    
    // Function lacks ending return statement and return type does not include 'undefined'.ts(2366)
    function area(s: Shape): number {
        switch (s.kind) {
            case "square": return s.size * s.size;
            case "rectangle": return s.height * s.width;
            case "circle": return Math.PI * s.radius ** 2;
        }
    }
    ```

    在开发过程中，如果遇到某种没有指定的类型，但是它传入了，应该抛出一个Error，是的在runtime时注意到这个问题。

    ```ts
    function assertNever(x: any): never {
        throw new Error("Unexpected object: " + x);
    }
    function area(s: Shape) {
        switch (s.kind) {
            case "square": return s.size * s.size;
            case "rectangle": return s.height * s.width;
            case "circle": return Math.PI * s.radius ** 2;
            default: return assertNever(s); // error here if there are missing cases
        }
    }
    ```

8. 索引类型（Index Types）

    索引类型可以让tsc动态的检查属性名。

    ```ts
    function pluck<T, K extends keyof T>(obj: T, names: K[]): T[K][] {
        return names.map(name => obj[name]);
    }
    ```

    其中，`keyof T`成为索引属性查询操作符，对于任何类型T，`keyof T`返回的是`T`中公共的（public），已知的（knowd）的属性名。`T[K]`是索引访问操作符，表明的是属性的类型。

9. 索引类型和索引签名

    索引签名的参数类型必须是`string`或者`number`，如果类型是`string`，那么`keyof T`的值是`string | number`，因为`obj[1]`和`obj['1']`都能访问到；如果类型是`number`，`keyof T`必须是`number`。

10. 映射类型（Mapping Types）

    映射类型用于把对象中所有的成员变为`optional`或`readonly`的。ts本身提供了这样的泛型类型给我们。也就是`Partial`和`Readonly`。

    ```ts
    type PersonPartial = Partial<Person>;
    type ReadonlyPerson = Readonly<Person>;
    
    // 原理
    type Partial<T> = {
        [P in keyof T]?: T[P];
    };
    type Readonly<T> = {
        readonly [P in keyof T]: T[p];
    };
    ```

    注意这种语法是用`type`而不是`member`的，如果想要给类型添加一个属性，应该使用交叉类型。

    ```ts
    type PartialWithNewMember<T> = {
      [P in keyof T]?: T[P];
    } & { newMember: boolean }
    
    // This is an error!
    type PartialWithNewMember<T> = {
      [P in keyof T]?: T[P];
      newMember: boolean;
    }
    ```

    与映射类型相似的内置类型是`Pick`和`Record`，它们的原理如下。

    ```ts
    type Pick<T, K extends keyof T> = {
        [P in K]: T[p];
    };
    
    type Record<K extends keypf any, T> = {
        [P in K]: T;
    };
    ```

    因此对于axios的返回，可以这么做了。

    ```ts
    type getResType<T> = Pick<AxiosResponse & T, keyof T>;
    
    type typeRes = getResType<IRes>;
    ```

11. 条件类型（Conditional Types）

    条件类型用于表达非单一的类型映射，它可以基于一个条件表达式选择一种类型作为自己的类型。

    条件类型`T extends U ? X : Y`可以被解析成`X`或者`Y`或者**延迟**解析，比如在编译时并不知道条件判断的值时就会延迟解析，此时它的类型是`X | Y`。

    ```ts
    declare function f<T extends boolean>(x: T): T extends true ? string : number;
    
    // 只有在运行时才知道是否满足，所以是string | number
    let x = f(Math.random() < 0.5)
    ```

12. 分配条件类型（Distributive conditional types）

    像数学中的分配率一样，针对`T extendx U ? X : Y`，其中参数类型`type T = A | B | C`，那么最终它会被解析成`(A extends U ? X | Y) | (B extends U ? X | Y) | (C extends U ? X | Y) `。

    ```ts
    type Diff<T, U> = T extends U ? never : T;
    
    type Filter<T, U> = T extends U ? T : never;
    
    type T30 = Diff<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "b" | "d"
    type T33 = Filter<string | number | (() => void), Function>;  // () => void
    ```

    条件类型与映射类型的结合非常有用，可以用一定的条件过滤出映射类型的一下值。

    ```ts
    type FunctionPropertyNames<T> = {
        [K in keyof T]: T[K] extends Function ? K : never;
    }[keyof T];
    
    interface Part {
        id: number;
        name: string;
        subparts: Part[];
        updatePart(newName: string): void;
    }
    
    type T40 = FunctionPropertyNames<Part>; // "updatePart"
    
    type T41 = Pick<Part, T40>; // { updatePart: (newName: string) => void;}
    ```

13. 条件类型中的类型推断（Type inference in conditional types）

    在条件类型中，可以使用`infer`关键字来引入一个用来推断的类型变量。这个用于推断的类型变量必须在true分支中使用。

    ```ts
    type Unpacked<T> =
        T extends (infer U)[] ? U :
        T extends (...args: any[]) => infer U ? U :
        T extends Promise<infer U> ? U :
        T;
    
    type T0 = Unpacked<string>;  // string
    type T1 = Unpacked<string[]>;  // string
    type T2 = Unpacked<() => string>;  // string
    type T3 = Unpacked<Promise<string>>;  // string
    type T4 = Unpacked<Promise<string>[]>;  // Promise<string>
    type T5 = Unpacked<Unpacked<Promise<string>[]>>;  // string
    ```

    TODO: Covariance and Contravariance

14. 一些预定义的条件类型

    - `Exclude<T, U>`：返回T中的，不能属性赋值给U的类型；

        ```ts
        type T00 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "b" | "d"
        ```

    - `Extract<T, U>`：返回T中的，能够属性赋值给U的类型；

        ```ts
        type T03 = Extract<string | number | (() => void), Function>;  // () => void
        ```

    - `NonNullable<T>`：返回T中不能`null`或`undefined`的类型；

        ```ts
        type T04 = NonNullable<string | number | undefined>;  // string | number
        ```

    - `ReturnType<T>`：得到函数类型的返回值；

        ```ts
        function f1(s: string) {
            return { a: 1, b: s };
        }
        // 要对函数使用typeof才可以！f1是函数声明，并不是一个类型；
        type T14 = ReturnType<typeof f1>;  // { a: number, b: string }
        ```

    - `InstanceType<T>`：得到构造函数类型的实例类型；

        ```ts
        class C {
            x = 0;
            y = 0;
        }
        // typeof得到构造函数类型
        type T20 = InstanceType<typeof C>; // C
        
        type T43 = typeof C;
        // allow,C是实例类型，typeof一个实例类型得到构造函数类型。
        let C1: T43 = C;
        ```

        