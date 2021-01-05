# ok-lit 🖖🔥



## 示例🔥

```html
<my-component></my-component>

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

  defineComponent('my-component', (props, context) => {
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

    const mountedCallback = () => {
      console.log('child mounted', context.$refs)
    }

    return () => html`
      <button @click=${toggle}>toggle child</button>
      <p>
      ${state.text} <input value=${state.text} @input=${onInput}>
      </p>
      <p v-show="${state.show}">style display v-show</p>
      <p ref="p">A: ${state.childData.text}</p>
      ${state.show ? html`<my-child @hook:mounted="${mountedCallback}" ref="myChild" msg=${state.text} .data=${state.childData} @increase="${onIncrease}"></my-child>` : ``}
    `
  })

  defineComponent('my-child', ['msg', 'data'], (props, context) => {
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
      console.log('child unmounted')
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

## html新增
1. v-show 同Vue的v-show
2. ref    同Vue的ref，可以通过context.$refs取到

## API🖖
#### defineComponent
```typescript
declare function defineComponent(name: string, props: string[] | FactoryFn, factory?: FactoryFn)
```

name 组件名
props 组件接收的参数
factory 等同于Vue3的setup函数，在内部执行@vue/reactivity的内容，并return一个返回htmlTemplate的函数(参考上例)

#### factory
```typescript
FactoryFn = (props: object, context: {
     $el: ShadowRoot;
     $refs: Record<string, HTMLElement>;
     emit(event: string, payload?: any): void;
 }) => () => TemplateResult;
```
props 外部传入的属性对象
context 当前的CustomElement实例

context.$el 是shadowRoot
context.$refs 是所有TemplateResult上边的ref的dom
context.emit 是事件发布，第一个参数是事件名称，第二个参数是携带的值
```typescript
declare function emit(event: string, payload?: any): void
```


#### 其余api参考
1. [lit-html](https://lit-html.polymer-project.org/guide)
2. [@vue/reactivity](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/index.ts)



## Types🔥
```typescript
declare type FactoryFn = (props: object, context: {
    $el: ShadowRoot;
    $refs: Record<string, HTMLElement>;
    emit(event: string, payload?: any): void;
}) => () => TemplateResult;
export declare function defineComponent(name: string, factory: FactoryFn): void;
export declare function defineComponent(name: string, props: string[], factory: FactoryFn): void;
export declare const onBeforeMount: (cb: HookFn) => void;
export declare const onMounted: (cb: HookFn) => void;
export declare const onBeforeUpdate: (cb: HookFn) => void;
export declare const onUpdated: (cb: HookFn) => void;
export declare const onUnmounted: (cb: HookFn) => void;
export * from 'lit-html';
export * from '@vue/reactivity';
```
