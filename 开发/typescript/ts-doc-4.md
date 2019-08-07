# ts文档—4

记录[ts文档](https://www.typescriptlang.org/docs/handbook/basic-types.html)学习时一些之前开发时可能没有注意到的问题。

- [Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html#)
- [Namespaces and Modules](https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html)
- [Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

## 1. Modules

只要文件中有顶级的`import`或`export`，则这个文件会被认为是一个模块，它里边的内容必须通过`export`导出才能被访问到。而没有`import`或者`export`的文件中的内容**被认为是全局域的**。

1. `export = `和`import = rquire()`

    由于ts采用的是类似于`ES Module`的模块体系，为了适应`CommonJS`和`AMD`的模块体系，主要是适应直接给`exports`对象赋一个`class`或者`function`值的情况。

    在`ESM`中，使用`import path from 'path';`通常引入的是模块的默认导出。但是通常`CommonJS`开发者并不会给`default`属性赋值，所以ts引入了`export = `和`import = require()`。既然模块开发者按照 `CommonJS`的开发习惯，也能使引用者方便使用。

    但是对于引用者来说需要区别对待`CommonJS`模块肯定是不好的，所以有两个tsconfig设置项可以帮助我们抹平这个差异。

    - `allowSyntheticDefaultImports`: 在typechecking阶段允许**对没有默认导出的模块进行默认导出，不会实际上影响代码的生成**；
    - `esModuleInterop`: 真正生成抹平差异的代码，它认为`allowSyntheticDefaultImports`被设为true。

    因此，没设置`allowSyntheticDefaultImports`，那么进行类型检查时会报错；而没设置`esModuleInterop`，则运行时会报错（找不到exports.default）。

2. 动态加载模块

    虽然`ESM`是不支持动态加载的，但是`CommonJS`和其他加载方式支持，所以ts也要支持。首先要明白的是，如果引入的模块没有被使用或者只是用作类型，那么真正生成的代码会剥离对这个模块引用。其次，`typeof`作为type时，生成一个值的类型，用在这里就是生成引入module的类型。

    ```ts
    // 仅仅作为类型引入
    import path from 'path';
    
    if (Math.random() < 0.5) {
        const p: typeof path = require('path');
        p.resolve(__dirname, './');
    }
    ```

    生成的CommonJS代码。可以看到就是我们日常使用的语句内require引入。

    ```ts
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (Math.random() < 0.5) {
        var p = require('path');
        p.resolve(__dirname, './');
    }
    ```

3. 与其他js库使用

    需要声明其他库暴露出的API的声明。这些声明没有实现（在库中实现），通常定义在一个`.d.ts`文件中。

    ```ts
    declare module "url" {
        export interface Url {
            protocol?: string;
            hostname?: string;
            pathname?: string;
        }
    
        export function parse(urlStr: string, parseQueryString?, slashesDenoteHost?): Url;
    }
    
    declare module "path" {
        export function normalize(p: string): string;
        export function join(...paths: any[]): string;
        export var sep: string;
    }
    ```

4. 模块结构指南

    1. 尽量不要到处嵌套太深的方法或者类；
    2. 尽量不要到处一个namespace；
    3. 尽量不要到处静态方法，换普通方法；
    4. 如果到处的是一个单一的`class`或者`function`，使用`export default`；



## 2. Namespaces

在**任何**使用`module`声明内在模块的地方，都可以且**应该**使用`namespace`来定义。

实际上namespace编译之后就是一个对象。它本身就是文件内部的，放在变量被文件中其他变量访问的自执行函数，这个自执行函数生成了在文件中可访问的对象，`namespace`所`export`出的内容就是对象的属性。

当然`namespace`也可以定义在多个文件中，“合并”成一个namespace。但是需要非常丑陋的加符号。

```ts
// Validation.ts
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }
}

// LettersOnlyValidator.ts
// "合成"了一个namespace
/// <reference path="Validation.ts" />
namespace Validation {
    const lettersRegexp = /^[A-Za-z]+$/;
    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string) {
            return lettersRegexp.test(s);
        }
    }
}
// ZipCodeValidator.ts
/// <reference path="Validation.ts" />
namespace Validation {
    const numberRegexp = /^[0-9]+$/;
    export class ZipCodeValidator implements StringValidator {
        isAcceptable(s: string) {
            return s.length === 5 && numberRegexp.test(s);
        }
    }
}

// 实际上在使用时还是需要全部引入
// Test.ts
/// <reference path="Validation.ts" />
/// <reference path="LettersOnlyValidator.ts" />
/// <reference path="ZipCodeValidator.ts" />

// Some samples to try
let strings = ["Hello", "98052", "101"];

// Validators to use
let validators: { [s: string]: Validation.StringValidator; } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();

// Show whether each string passed each validator
for (let s of strings) {
    for (let name in validators) {
        console.log(`"${ s }" - ${ validators[name].isAcceptable(s) ? "matches" : "does not match" } ${ name }`);
    }
}
```

可以使用`import`来引用`namespace`导出的方法或类。

```ts
import A = Validation.LettersOnlyValidator;
```

通常来说，对于d3或者jQuery这种，全局引入（通过script标签）的，需要添加`D3.d.ts`文件，并在全局下声明一个变量，告诉编译器它是某个类型的。

```ts
declare namespace D3 {
    export interface Selectors {
        select: {
            (selector: string): Selection;
            (element: EventTarget): Selection;
        };
    }

    export interface Event {
        x: number;
        y: number;
    }

    export interface Base extends Selectors {
        event: Event;
    }
}

// 全局下有一个d3变量，它的类型是D3.Base，区中D3.Base的定义在上边
declare var d3: D3.Base;
```

## 3. 命名空间和模块

1. 当输出模块`compileOptions.module`是`commonjs`或`umd`时，不能设置`outFile`选项，因为不能把多个文件结合成一个文件，必须是一个ts文件生成一个js文件的一对一关系；（`amd`和`system`可以）、

2. 不要乱使用`namespace`，多使用`module`，即`import`和`export`，它自带避免命名冲突的功能。

    ```ts
    export namespace Shapes {
        export class Triangle { /* ... */ }
        export class Square { /* ... */ }
    }
    
    import * as shapes from "./shapes";
    let t = new shapes.Shapes.Triangle(); // shapes.Shapes?
    ```

## 4. 模块解析

1. 相对模块引用和非相对模块引用（Relative vs. Non-relative module imports）

    路径以`/`，`./`，`../`开头的称为相对引用；其它的称为非相对引用。

    相对引用**不会解析环境模块声明**。应该使用这种方法引用自己写的模块，保证在运行时就会出现在这个相对路径上。

    非相对引用的引用是基于`baseUrl`或者路径映射的，它们**可以解析环境模块声明**。非相对引用用于引用外部依赖。

2. 模块解析策略（Module Resolution Strategies）

    通过设置`moduleResolution`来设置模块解析策略，有`node`和`classic`两种值。

    - classsic：现如今，`classic`主要是为了向后兼容。

    - node：模拟了nodejs的模块加载策略。对于相对引用，它的顺序是：

        1. `/root/src/moduleB.ts`

        2. `/root/src/moduleB.tsx`
        3. `/root/src/moduleB.d.ts`
        4. `/root/src/moduleB/package.json` (if it specifies a `"types"` property)
        5. `/root/src/moduleB/index.ts`
        6. `/root/src/moduleB/index.tsx`
        7. `/root/src/moduleB/index.d.ts`

        首先注意到它的文件扩展名的查找顺序是`.ts`，`.tsx`，`.d.ts`。然后他会**认为引用的是一个文件夹**，从而按照文件夹的方式查找（4-7）。注意它检查的是`types`字段。

    而`node`的非相对引用会**直接去node_modules**中找。它会从本目录的node_modules开始，查找：

    	1. `/root/src/node_modules/moduleB.ts`
     	2. `/root/src/node_modules/moduleB.tsx`
     	3. `/root/src/node_modules/moduleB.d.ts`
    	4. `/root/src/node_modules/moduleB/package.json` (if it specifies a `"types"` property)
    	5. **`/root/src/node_modules/@types/moduleB.d.ts`**
    	6. `/root/src/node_modules/moduleB/index.ts`
    	7. `/root/src/node_modules/moduleB/index.tsx`
    	8. `/root/src/node_modules/moduleB/index.d.ts` 

    **它会查找node_modules/@types里的`.d.ts`文件**，这里正是从[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)安装依赖放置的地方。

3. 一些模块解析的配置

    1. `baseUrl`

        baseUrl决定了非相对引用的根路径，正常来说使用node的解析方式也应该能找到，不用设置也可以吧。

    2. 路径映射（`baseUrl`+`paths`）

        感觉文档上是错的啊。。。醉了。

        试了下应该是baseUrl+path决定了当引用这个模块时，它的类型文件所在，和运行时并没有什么关系。。

        另一个`baseUrl`+`paths`的作用是可以设置根目录，

        ```ts
        {
            "compilerOptions": {
                "baseUrl": ".",
                "paths": {
                    "@root/*": [
                        "./client-vue/*"
                    ],
                    "@rooth5/*": [
                        "./client-h5/*"
                    ]
                }
            }
        }
        ```

        

    

    

    

