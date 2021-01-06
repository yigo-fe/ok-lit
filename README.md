# ok-lit 🖖🔥

## npm scripts 
`yarn serve | npm run serve` 本地运行项目

`yarn build | npm run build` 打包项目

## 示例🔥

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
<my-component count="1.23123" callback="function add(a,b) { return a+b }"></my-component>
</body>
</html>
<script src="../dist/ok-lit.umd.js"></script>
<script>
    const {
        defineComponent,
        reactive,
        html,
        onMounted,
        onUpdated,
        onUnmounted
    } = window.okLit

    defineComponent('my-component', {
        count: {
            type: Number,
            required: true,
            transform(value) {
                return parseInt(value)
            }
        },
        callback: {
            type: Function
        }
    }, (props, context) => {
        const state = reactive({
            text: 'hello',
            show: true,
            childData: {
                text: 'hola'
            }
        })
        const toggle = () => {
            state.show = !state.show
        }
        const onInput = e => {
            state.text = e.target.value
        }

        const onIncrease = e => {
            console.log('child increase', e.detail)
        }

        onMounted(() => {
            console.log(context.$refs)
        })

        onUpdated(() => {
            console.log(context.$refs)
        })

        const mountedCallback = () => {
            console.log('child mounted in parent', '此时并拿不到$refs.myChild')
        }

        return () => html`
          <button @click=${toggle}>toggle child</button>
          <p>
          ${state.text} <input value=${state.text} @input=${onInput}>
          </p>
          <p v-show="${state.show}">style display v-show</p>
          <p ref="p">A: ${state.childData.text}</p>
          ${state.show ? html`<my-child @hook:mounted="${mountedCallback}" ref="myChild" .msg=${state.text} .data=${state.childData} @increase="${onIncrease}"></my-child>` : ``}
        `
        // 在defineComponent里边使用子组件传参时，使用.可以直接传入对象
    })

    defineComponent('my-child', {
        msg: {
            type: String,
        },
        data: {
            type: Object
        }
    }, (props, context) => {
        const state = reactive({ count: 0 })
        const increase = () => {
            state.count++
            context.emit('increase', state.count)
        }
        onMounted(() => {
            console.log('child mounted')
        })

        onUpdated(() => {
            console.log('child updated')
        })

        onUnmounted(() => {
            console.log('html child unmounted')
        })

        return () => html`
          <p>${props.msg}</p>
          <p>X: ${props.data?.text}<p>
          <p>${state.count}</p>
          <button @click=${increase}>increase</button>
        `
    })
</script>
```

## html[编写模版api参考](https://lit-html.polymer-project.org/guide/writing-templates)
#### 1. v-show 同Vue的v-show
#### 2. ref    同Vue的ref，可以通过context.$refs取到
#### 3. 需要判断的dom可以使用三目表达式，或者在函数中定义变量，基本等同于jsx
#### 4. 需要循环遍历的dom，可以使用map，也可以使用lit-html内置的repeat方法：Repeating templates with the repeat directive

## API🖖
#### defineComponent
```typescript
// name参数是注册的组件名， props 组件接收的参数类型定义， setup 类似于Vue3的setup函数，在内部执行@vue/reactivity的内容，并return一个返回htmlTemplate的函数(参考上例)
declare function defineComponent(name: string, props: PropsType | SetupFn, setup?: SetupFn)
```

#### props
```typescript
export declare type PropTypes = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor | FunctionConstructor;
export interface Prop {
  // 当前属性类型， 同Vue
  type: PropTypes | PropTypes[];
  // 默认值， 同Vue，复杂数据类型可以使用函数返回值的方式
  default?: string | number | boolean | object | Array<any> | Function;
  // 是否必填，同Vue，但是不会阻止运行，会在console给一个error警告
  required?: boolean;
  // 自定义转换函数，用于替换内置的转换函数，仅当传入的值与定义的类型不一致时会被调用
  transform?: (value: string) => any;
}
export interface PropsType {
  [key: string]: Prop;
}
```

#### setup
```typescript
// props是外部传入的属性对象， context 当前的CustomElement实例
type SetupFn = (props: object, context: {
  // 当前的shadow dom
  $el: ShadowRoot
  // 当前TemplateResult上边的ref的dom
  $refs: Record<string, HTMLElement>
  // 事件发布，event参数是事件名称，payload参数是携带的值
  emit(event: string, payload?: any): void
}) => () => TemplateResult
```

#### 其余api参考
1. [lit-html](https://lit-html.polymer-project.org/guide)
2. [@vue/reactivity](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/index.ts)



## Types🔥
```typescript
export declare type PropTypes = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor | FunctionConstructor;
export interface Prop {
  type: PropTypes | PropTypes[];
  default?: string | number | boolean | object | Array<any> | Function;
  required?: boolean;
  transform?: (value: string) => any;
}
export interface PropsType {
  [key: string]: Prop;
}
declare type HookFn = () => unknown;
declare type SetupFn = (props: object, context: {
  $el: ShadowRoot;
  $refs: Record<string, HTMLElement>;
  emit(event: string, payload?: any): void;
}) => () => TemplateResult;
export declare function defineComponent(name: string, setup: SetupFn): void;
export declare function defineComponent(name: string, props: PropsType, setup: SetupFn): void;
export declare const onBeforeMount: (cb: HookFn) => void;
export declare const onMounted: (cb: HookFn) => void;
export declare const onBeforeUpdate: (cb: HookFn) => void;
export declare const onUpdated: (cb: HookFn) => void;
export declare const onUnmounted: (cb: HookFn) => void;
export * from 'lit-html';
export * from '@vue/reactivity';

```
