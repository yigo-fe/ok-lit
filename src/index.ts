import { render, TemplateResult } from 'lit-html'
import { effect, shallowReactive } from '@vue/reactivity'
import { PropType, PropsType, PropTypes, validateProp } from './props'
import {
	camelizeKey,
	decamelizeKey,
	getAllKeys,
	isFunction,
	mapPropsKeys,
	toBoolean, warn
} from './utils'
import * as shadyCss from '@webcomponents/shadycss';

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
    $refs: Record<string, HTMLElement | HTMLElement[]>
    emit(event: string, payload?: any): void
	  expose(exposeMap: Record<string, any>): void
  }): () => TemplateResult
}
export function defineComponent<Name extends Lowercase<string>>(name: Name, setup: SetupFn, mode?: ShadowRootMode): void
export function defineComponent<Name extends Lowercase<string>, Props extends PropsType = {}>(name: Name, props: Props, setup: SetupFn<Props>, mode?: ShadowRootMode): void

export function defineComponent<Name extends Lowercase<string>, Props extends PropsType = {}>(name: Name, props: Props | SetupFn<Props>, setup?: SetupFn<Props> | ShadowRootMode, mode?: ShadowRootMode) {
  let propsKeys: string[] = []
  let setupFn: SetupFn<Props>
  let propsConfig: PropsType = {}
  let modeConfig: ShadowRootMode = 'open'
  if (isFunction(props)) {
    setupFn = props
    if (typeof setup === 'string') {
      modeConfig = setup
    }
  } else if (isFunction(setup)) {
    setupFn = setup
    propsConfig = props
    propsKeys = Object.keys(props)
    if (mode) {
      modeConfig = mode
    }
  }
  const Component = class extends HTMLElement {
    private readonly _props: any
    private readonly _bm: Hooks = []
    private readonly _bu: Hooks = []
    private readonly _u: Hooks = []
    private readonly _m: Hooks = []
    private readonly _um: Hooks = []
	  private _exposed = false
    public readonly $el: ShadowRoot
    public $refs: Record<string, HTMLElement | HTMLElement[]> = {}

    static get observedAttributes() {
      return getAllKeys(propsKeys)
    }
    constructor() {
      super()
      const propsInit = this._getProps()
      // run validate prop
      Object.keys(propsInit).forEach(key => validateProp(key, propsConfig[key], propsInit))
      const props = (this._props = shallowReactive(propsInit))
      currentInstance = this
      const template = setupFn.call(null, props, this)
      shadyCss.prepareTemplate(template().getTemplateElement(), name)
      currentInstance = null
      this._bm && this._bm.forEach((cb) => cb())
      this.emit('hook:beforeMount')
      this.$el = this.attachShadow({ mode: modeConfig })
      let isMounted = false
      effect(() => {
        if (!isMounted) {
          this._bu && this._bu.forEach((cb) => cb())
          this.emit('hook:beforeUpdate')
        }
        render(template(), this.$el)
        if (isMounted) {
          this._applyDirective()
          this._u && this._u.forEach((cb) => cb())
          this.emit('hook:updated')
        } else {
          isMounted = true
        }
      })
      // Remove an instance properties that alias reactive properties which
      // might have been set before the element was upgraded.
	    mapPropsKeys(propsKeys, (propName, decamelizePropName) => {
	      if (decamelizePropName) {
		      if (this.hasOwnProperty(decamelizePropName)) {
			      const v = (this as any)[decamelizePropName];
			      delete (this as any)[decamelizePropName];
			      (this as any)[propName] = v;
		      }
	      } else if (this.hasOwnProperty(propName)) {
		      const v = (this as any)[propName];
		      delete (this as any)[propName];
		      (this as any)[propName] = v;
	      }
      })
    }

    public emit(event: string, payload?: any) {
      const customEvent = new CustomEvent(event, {
        bubbles: true,
        detail: payload,
      });
      this.dispatchEvent(customEvent)
    }

    public expose(exposeMap: Record<string, any>) {
    	if (this._exposed) {
    		return
	    }
    	this._exposed = true
	    Object.keys(exposeMap).forEach(key => {
	    	if (Object.hasOwnProperty.call(this, key)) {
	    		warn(`%o don't expose %o key, Because it already has this key`, this, key)
			    return
		    }
	    	Object.defineProperty(this, key, {
	    		value: exposeMap[key]
		    })
	    })
    }

    private _applyDirective() {
      this._applyVShow()
      this._applyRef()
    }

    private _applyRef() {
      const refs = this.$el.querySelectorAll<HTMLElement>('[ref]')
      this.$refs = {}
      Array.from(refs).forEach((el) => {
        const refKey = el.getAttribute('ref') as string
        if (this.$refs[refKey]) {
          if (Array.isArray(this.$refs[refKey])) {
            ;(this.$refs[refKey] as HTMLElement[]).push(el)
          } else {
            this.$refs[refKey] = [(this.$refs[refKey] as HTMLElement), el]
          }
        } else {
          this.$refs[refKey] = el
        }
      })
    }

    private _applyVShow() {
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

    private _getProps() {
      let obj: any = {}
      for (const propName of propsKeys) {
      	// 兼容中划线格式传入的props
      	const camelizePropName = decamelizeKey(propName)
        // 用.传入的props 在getAttribute拿不到，需要从this.propName上进行取
        obj[propName] = this.getAttribute(propName) || this.getAttribute(camelizePropName) || (this as any)[propName] || (this as any)[camelizePropName] || undefined
      }
      return obj
    }

    connectedCallback() {
      shadyCss.styleElement(this);
      this._applyDirective()
      this._m && this._m.forEach((cb) => cb())
      this.emit('hook:mounted')
    }
    disconnectedCallback() {
      this._um && this._um.forEach((cb) => cb())
      this.emit('hook:unmount')
    }
    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    	const propName = camelizeKey(name)
	    const validateTemp = { [propName]: newValue }
      validateProp(propName, propsConfig[propName], validateTemp)
	    this._props[propName] = validateTemp[propName]
    }
  }
	mapPropsKeys(propsKeys, (propName, decamelizePropName) => {
		function defineProperty(attribute: string) {
			Object.defineProperty(Component.prototype, attribute, {
				get() {
					if (!this._props) return undefined;
					return this._props[propName];
				},
				set(newValue) {
					const validateTemp = { [propName]: newValue }
					validateProp(propName, propsConfig[propName], validateTemp)
					this._props[propName] = validateTemp[propName]
				}
			});
		}
		if (decamelizePropName) {
			defineProperty(decamelizePropName)
		} else {
			defineProperty(propName)
		}
	})

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
export * from './watch'
export type {
  PropType
}
