import { render, TemplateResult } from 'lit-html'
import { effect, shallowReactive } from '@vue/reactivity'
import { getDefaultValue, PropType, PropsType, PropTypes, validateProp } from './props'
import { isFunction, toBoolean } from './utils'

type HookFn = () => unknown
type HookName = '_bm' | '_bu' | '_u' | '_m' | '_um'
type Hooks = Array<HookFn>

let currentInstance: any | null

type GetPropType<T> = T extends ObjectConstructor ? Record<string, any> : T extends BooleanConstructor ? boolean : T extends NumberConstructor ? number : T extends StringConstructor ? string : T extends ArrayConstructor ? Array<any> : T extends FunctionConstructor ? Function : PropType<T>

interface SetupFn<Props extends PropsType = {}>{
  (props: {
    [key in keyof Props]: Props[key]['type'] extends PropType ? Props[key]['type'] :Props[key]['type'] extends Array<PropTypes> ? GetPropType<Props[key]['type'][0]> : GetPropType<Props[key]['type']>
  }, context: HTMLElement & {
    $el: ShadowRoot
    $refs: Record<string, HTMLElement>
    emit(event: string, payload?: any): void
  }): () => TemplateResult
}
export function defineComponent<Name extends Lowercase<string>>(name: Name, setup: SetupFn): void
export function defineComponent<Name extends Lowercase<string>, Props extends PropsType = {}>(name: Name, props: Props, setup: SetupFn<Props>): void
export function defineComponent<Name extends Lowercase<string>, Props extends PropsType = {}>(name: Name, props: Props | SetupFn<Props>, setup?: SetupFn<Props>) {
  let propsKeys: string[] = []
  let setupFn: SetupFn<Props>
  let propsConfig: PropsType = {}
  if (isFunction(props)) {
    setupFn = props
  } else if (isFunction(setup)) {
    setupFn = setup
    propsConfig = props
    propsKeys = Object.keys(props)
  }

  const Component = class extends HTMLElement {
    private readonly _props: any
    private readonly _bm: Hooks = []
    private readonly _bu: Hooks = []
    private readonly _u: Hooks = []
    private readonly _m: Hooks = []
    private readonly _um: Hooks = []
    public readonly $el: ShadowRoot
    public readonly $refs: Record<string, HTMLElement> = {}

    static get observedAttributes() {
      return propsKeys
    }
    constructor() {
      super()
      const propsInit = this.getProps()
      // run validate prop
      Object.keys(propsInit).forEach(key => validateProp(key, propsConfig[key], propsInit))
      console.log('validate props over', propsInit)
      const props = (this._props = shallowReactive(propsInit))
      currentInstance = this
      const template = setupFn.call(this, props, this)
      currentInstance = null
      this._bm && this._bm.forEach((cb) => cb())
      this.emit('hook:beforeMount')
      this.$el = this.attachShadow({ mode: 'closed' })
      let isMounted = false
      effect(() => {
        if (!isMounted) {
          this._bu && this._bu.forEach((cb) => cb())
          this.emit('hook:beforeUpdate')
        }
        render(template(), this.$el)
        if (isMounted) {
          this.applyDirective()
          this._u && this._u.forEach((cb) => cb())
          this.emit('hook:updated')
        } else {
          isMounted = true
        }
      })
      // Remove an instance properties that alias reactive properties which
      // might have been set before the element was upgraded.
      for (const propName of propsKeys) {
        if (this.hasOwnProperty(propName)) {
          const v = (this as any)[propName];
          delete (this as any)[propName];
          (this as any)[propName] = v;
        }
      }
    }

    public emit(event: string, payload?: any) {
      const customEvent = new CustomEvent(event, {
        bubbles: true,
        detail: payload,
      });
      this.dispatchEvent(customEvent)
    }

    private applyDirective() {
      this.applyVShow()
      this.applyRef()
    }

    private applyRef() {
      const refs = this.$el.querySelectorAll<HTMLElement>('[ref]')
      const refKeys: string[] = []
      Array.from(refs).forEach((el) => {
        const refKey = el.getAttribute('ref') as string
        refKeys.push(refKey)
        if (this.$refs[refKey] !== el) {
          this.$refs[refKey] = el
        }
      })
      Object.keys(this.$refs).forEach(key => {
        if (!refKeys.includes(key)) {
          delete this.$refs[key]
        }
      })
    }

    private applyVShow() {
      const vShows = this.$el.querySelectorAll<HTMLElement& { __prevShow: boolean, __prevDisplay: string }>('[v-show]')
      Array.from(vShows).forEach((el) => {
        const show = toBoolean(el.getAttribute('v-show'))
        if (el.__prevShow !== show) {
          if (show) {
            el.style.display = el.__prevDisplay
          } else {
            el.__prevDisplay = el.style.display || ''
            el.style.display = 'none'
          }
          el.__prevShow = show
        }
      })
    }

    private getProps() {
      // 用.传入的props 在getAttribute拿不到，需要从this.propName上进行取
      let obj: any = {}
      for (const propName of propsKeys) {
        obj[propName] = this.getAttribute(propName) || (this as any)[propName] || undefined
      }
      return obj
    }

    connectedCallback() {
      this.applyDirective()
      this._m && this._m.forEach((cb) => cb())
      this.emit('hook:mounted')
    }
    disconnectedCallback() {
      this._um && this._um.forEach((cb) => cb())
      this.emit('hook:unmount')
    }
    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
      this._props[name] = newValue
      validateProp(name, propsConfig[name], this._props)
    }
  }
  for (const propName of propsKeys) {
    Object.defineProperty(Component.prototype, propName, {
      get() {
        if (!this._props) return undefined;
        return this._props[propName];
      },
      set(v) {
        this._props[propName] = v;
        validateProp(propName, propsConfig[propName], this._props)
      }
    });
  }

  customElements.define(
    name,
    Component
  )
}

function createLifecycleMethod(name: HookName) {
  return (cb: HookFn) => {
    if (currentInstance) {
      ;(currentInstance[name] || (currentInstance[name] = [])).push(cb)
    }
  }
}

export const onBeforeMount = createLifecycleMethod('_bm')
export const onMounted = createLifecycleMethod('_m')
export const onBeforeUpdate = createLifecycleMethod('_bu')
export const onUpdated = createLifecycleMethod('_u')
export const onUnmounted = createLifecycleMethod('_um')

export * from 'lit-html'
export * from '@vue/reactivity'
export type {
  PropType
}