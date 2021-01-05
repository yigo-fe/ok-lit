import { render } from 'lit-html';
export * from 'lit-html';
import { shallowReactive, effect } from '@vue/reactivity';
export * from '@vue/reactivity';

let currentInstance;
function defineComponent(name, props, factory) {
    let propsDefs = [];
    let setupFn;
    if (typeof props === 'function') {
        setupFn = props;
    }
    else if (factory) {
        propsDefs = props;
        setupFn = factory;
    }
    const Component = class extends HTMLElement {
        constructor() {
            super();
            this._bm = [];
            this._bu = [];
            this._u = [];
            this._m = [];
            this._um = [];
            this.$refs = {};
            const props = (this._props = shallowReactive({}));
            currentInstance = this;
            const template = setupFn.call(this, props, this);
            currentInstance = null;
            this._bm && this._bm.forEach((cb) => cb());
            this.emit('hook:beforeMount');
            this.$el = this.attachShadow({ mode: 'closed' });
            let isMounted = false;
            effect(() => {
                if (!isMounted) {
                    this._bu && this._bu.forEach((cb) => cb());
                    this.emit('hook:beforeUpdate');
                }
                render(template(), this.$el);
                if (isMounted) {
                    this.applyDirective();
                    this._u && this._u.forEach((cb) => cb());
                    this.emit('hook:updated');
                }
                else {
                    isMounted = true;
                }
            });
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
        static get observedAttributes() {
            return propsDefs;
        }
        applyDirective() {
            this.applyVShow();
            this.applyRef();
        }
        applyRef() {
            const refs = this.$el.querySelectorAll('[ref]');
            const refKeys = [];
            Array.from(refs).forEach((el) => {
                const refKey = el.getAttribute('ref');
                refKeys.push(refKey);
                if (this.$refs[refKey] !== el) {
                    this.$refs[refKey] = el;
                }
            });
            Object.keys(this.$refs).forEach(key => {
                if (!refKeys.includes(key)) {
                    delete this.$refs[key];
                }
            });
        }
        applyVShow() {
            const vShows = this.$el.querySelectorAll('[v-show]');
            Array.from(vShows).forEach((el) => {
                const show = toBoolean(el.getAttribute('v-show'));
                if (el.__prevShow !== show) {
                    if (show) {
                        el.style.display = el.__prevDisplay;
                    }
                    else {
                        el.__prevDisplay = el.style.display || '';
                        el.style.display = 'none';
                    }
                    el.__prevShow = show;
                }
            });
        }
        emit(event, payload) {
            const customEvent = new CustomEvent(event, {
                bubbles: true,
                detail: payload,
            });
            this.dispatchEvent(customEvent);
        }
        connectedCallback() {
            this.applyDirective();
            this._m && this._m.forEach((cb) => cb());
            this.emit('hook:mounted');
        }
        disconnectedCallback() {
            this._um && this._um.forEach((cb) => cb());
            this.emit('hook:unmount');
        }
        attributeChangedCallback(name, oldValue, newValue) {
            // @ts-ignore
            this._props[name] = newValue;
        }
    };
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
    customElements.define(name, Component);
}
function toBoolean(value) {
    return value === 'false' ? false : !!value;
}
function createLifecycleMethod(name) {
    return (cb) => {
        // @ts-ignore
        if (currentInstance) {
            (currentInstance[name] || (currentInstance[name] = [])).push(cb);
        }
    };
}
const onBeforeMount = createLifecycleMethod('_bm');
const onMounted = createLifecycleMethod('_m');
const onBeforeUpdate = createLifecycleMethod('_bu');
const onUpdated = createLifecycleMethod('_u');
const onUnmounted = createLifecycleMethod('_um');

export { defineComponent, onBeforeMount, onBeforeUpdate, onMounted, onUnmounted, onUpdated };
