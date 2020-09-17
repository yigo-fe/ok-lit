import { render } from 'lit-html'
import {shallowReactive, effect} from '@vue/reactivity/dist/reactivity.esm-browser.js'

let currentInstance

export function defineComponent(name, propDefs, factory) {
  if (typeof propDefs === 'function') {
    factory = propDefs
    propDefs = []
  }

  const Component = class extends HTMLElement {
    static get observedAttributes() {
      return propDefs
    }
    constructor() {
      super()
      const props = (this._props = shallowReactive({}))
      currentInstance = this
      const template = factory.call(this, props)
      currentInstance = null
      this._bm && this._bm.forEach((cb) => cb())
      const root = this.attachShadow({ mode: 'closed' })
      let isMounted = false
      effect(() => {
        if (!isMounted) {
          this._bu && this._bu.forEach((cb) => cb())
        }
        render(template(), root)
        if (isMounted) {
          this._u && this._u.forEach((cb) => cb())
        } else {
          isMounted = true
        }
      })
      // Remove an instance properties that alias reactive properties which
      // might have been set before the element was upgraded.
      for (const propName of propDefs) {
        if (this.hasOwnProperty(propName)) {
          const v = this[propName];
          delete this[propName];
          this[propName] = v;
        }
      }
    }
    connectedCallback() {
      this._m && this._m.forEach((cb) => cb())
    }
    disconnectedCallback() {
      this._um && this._um.forEach((cb) => cb())
    }
    attributeChangedCallback(name, oldValue, newValue) {
      this._props[name] = newValue
    }
  }
  for (const propName of propDefs) {
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

function createLifecycleMethod(name) {
  return (cb) => {
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
export * from '@vue/reactivity/dist/reactivity.esm-browser.js'
