import { render, TemplateResult } from 'lit-html'
import { shallowReactive, effect } from '@vue/reactivity'

type HookFn = () => unknown
type HookName = '_bm' | '_bu' | '_u' | '_m' | '_um'
type Hooks = Array<HookFn>

let currentInstance: any | null

type SetupFn = (props: object, context: {
  $el: ShadowRoot
  $refs: Record<string, HTMLElement>
  emit(event: string, payload?: any): void
}) => () => TemplateResult
export function defineComponent(name: string, setup: SetupFn): void
export function defineComponent(name: string, props: string[], setup: SetupFn): void
export function defineComponent(name: string, props: string[] | SetupFn, setup?: SetupFn) {
  let propsDefs: string[] = []
  let setupFn: SetupFn
  if (typeof props === 'function') {
    setupFn = props
  } else if (setup) {
    propsDefs = props
    setupFn = setup
  }

  const Component = class extends HTMLElement {
    private readonly _props: object
    private readonly _bm: Hooks = []
    private readonly _bu: Hooks = []
    private readonly _u: Hooks = []
    private readonly _m: Hooks = []
    private readonly _um: Hooks = []
    public readonly $el: ShadowRoot
    public readonly $refs: Record<string, HTMLElement> = {}


    static get observedAttributes() {
      return propsDefs
    }
    constructor() {
      super()
      const props = (this._props = shallowReactive({}))
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
      for (const propName of propsDefs) {
        if (this.hasOwnProperty(propName)) {
          // @ts-ignore
          const v = this[propName];
          // @ts-ignore
          delete this[propName];
          // @ts-ignore
          this[propName] = v;
        }
      }
    }

    applyDirective() {
      this.applyVShow()
      this.applyRef()
    }

    applyRef() {
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

    applyVShow() {
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

    emit(event: string, payload?: any) {
      const customEvent = new CustomEvent(event, {
        bubbles: true,
        detail: payload,
      });
      this.dispatchEvent(customEvent)
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
      // @ts-ignore
      this._props[name] = newValue
    }
  }
  for (const propName of propsDefs) {
    Object.defineProperty(Component.prototype, propName, {
      get() {
        return this._props[propName];
      },
      set(v) {
        this._props[propName] = v;
      }
    });
  }

  customElements.define(
    name,
    Component
  )
}

function toBoolean(value: unknown): boolean {
  return value === 'false' ? false : !!value
}

function createLifecycleMethod(name: HookName) {
  return (cb: HookFn) => {
    // @ts-ignore
    if (currentInstance) {
      // @ts-ignore
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
