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
<todo-list></todo-list>
</body>
</html>
<script src="../dist/ok-lit.umd.js"></script>
<script>
  const {
    defineComponent,
    reactive,
    ref,
    html,
    onMounted,
    onUpdated,
    onUnmounted,
  } = window.okLit

  defineComponent('my-component', {
    count: {
      type: [Number, String],
      required: true,
      default: 1,
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

  defineComponent('todo-list', () => {
    const list = ref([{ key: 1, label: '第一项' }, { key: 2, label: '第二项' }, { key: 3, label: '第三项' }])

    const classObj = {
      selected: true
    }

    return () => html`
      <ul class="${classMap(classObj)}">
        ${repeat(list.value, (item) => item.key, item => html`<li>${item.label}</li>`) }
      </ul>
    `
  })
</script>
```

## html[编写模版api参考](https://lit-html.polymer-project.org/guide/writing-templates)
#### 1. v-show 同Vue的v-show
#### 2. ref    同Vue的ref，可以通过context.$refs取到
#### 3. 需要判断的dom可以使用三目表达式，或者在函数中定义变量，基本等同于jsx
#### 4. 需要循环遍历的dom，可以使用map，也可以使用lit-html内置的repeat方法：Repeating templates with the repeat directive
#### 5. 在Vue2、React或者HTML中，在DOM上传参，如果是复杂类型(对象，数组，函数等)，对象，数组需要传JSON字符串，函数需要传函数字符串(`function () {} 或者 () => {}`)
#### 6. 在Vue2、React或者HTML中，如果不想让props显示到元素的attribute上（Vue3可以直接使用v-bind，不会有该问题），可以通过js的方式给组件设置props值，仅限外部引用组件时可以这么使用，使用ok-lit开发组件时，需要在attribute上不展示的属性，请使用.attr=value代替， 例如： 
```html
<body>
  <my-component></my-component>
</body>
<script>
  // 外部使用组件
  const myComponent = document.querySelector('my-component')
  myComponent.count = 1
  myComponent.callback = function(a, b) {
    return a + b
  }
  
  // 开发组件
  defineComponent('test-component', () => {
    const count = 1
    const add = (a, b) => {
      return a + b
    }
    
    return () => html`
      <my-component .count="${count}" .callback="${add}"></my-component>
    `
  })
</script>
```


## API🖖
#### defineComponent
```typescript
// name参数是注册的组件名， props 组件接收的参数类型定义， setup 类似于Vue3的setup函数，在内部执行@vue/reactivity的内容，并return一个返回htmlTemplate的函数(参考上例)
declare function defineComponent(name: string, props: PropsType | SetupFn, setup?: SetupFn)
```

#### props
Props会有一定的类型推导能力，如果需要指定精确的类型，请使用PropType
```typescript
import { PropType, defineComponent } from 'ok-lit'

interface Item {
  name: string
  type: string
}
defineComponent('my-component', { prop: {
  type: Array as unknown as PropType<Array<Item>>
  } }, props => {
  console.log(props.prop[0].name) // 可以正确的进行typescript类型推导
})
```
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
