'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var litHtml = require('lit-html');
var reactivity = require('@vue/reactivity');

const error = console.error;
const toString = Object.prototype.toString;
const getExactType = (arg) => toString.call(arg).slice(8, -1);
function isType(type) {
    return function (arg) {
        return typeof arg === type;
    };
}
function isExactType(type) {
    return function (arg) {
        return getExactType(arg) === type;
    };
}
const isArray = Array.isArray;
const isFunction = isType('function');
const isString = isType('string');
const isNumber = isType('number');
const isBoolean = isType('boolean');
const isObject = isType('object');
const isExactObject = isExactType('Object');
function isNullOrUndefined(arg) {
    return arg === null || arg === undefined;
}
function toBoolean(value) {
    return value === 'false' ? false : !!value;
}
function isJSONString(value) {
    try {
        const result = JSON.parse(value);
        if (isObject(result)) {
            return result;
        }
    }
    catch {
    }
    return false;
}

function getDefaultValue(config) {
    return isFunction(config.default) && config.type !== Function ? config.default() : config.default;
}
function validateProp(key, config, props) {
    let value = props[key];
    if (isNullOrUndefined(value)) {
        if (config.default !== undefined) {
            value = getDefaultValue(config);
        }
        else if (config.required) {
            error(`props ${key} is required!`);
            return;
        }
    }
    function isBaseType(nowType, type, isType, transform) {
        !transform && (transform = type);
        config.transform && (transform = config.transform);
        if (nowType !== type) {
            return false;
        }
        if (isType(value)) {
            return true;
        }
        else {
            const transformResult = transform(value);
            if (type === Number && Number.isNaN(transformResult)) {
                return false;
            }
            value = transformResult;
            return true;
        }
    }
    function isJSONType(nowType, type, isType, str) {
        if (nowType !== type) {
            return false;
        }
        if (isType(value)) {
            return true;
        }
        else {
            const transform = config.transform ?? isJSONString;
            const jsonResult = transform(value);
            if (jsonResult && isType(jsonResult)) {
                value = jsonResult;
                return true;
            }
            str && error(`the ${key} is a ${str}, please give the ${str} or JSON string`);
            return false;
        }
    }
    function isFunctionType(nowType) {
        if (nowType !== Function) {
            return false;
        }
        if (isFunction(value)) {
            return true;
        }
        else {
            try {
                const toFunction = (value) => {
                    return new Function(`return ${value}`)();
                };
                const transform = config.transform ?? toFunction;
                const fn = transform(value);
                isFunction(fn) && (value = fn);
                return true;
            }
            catch (e) {
                error(e);
                return false;
            }
        }
    }
    if (config.type) {
        const noRepeatArray = isArray(config.type) ? [...new Set(config.type)] : [config.type];
        let transformFlag = false;
        for (let i = 0; i < noRepeatArray.length; i++) {
            const type = noRepeatArray[i];
            if (isBaseType(type, String, isString)
                || isBaseType(type, Number, isNumber)
                || isBaseType(type, Boolean, isBoolean, toBoolean)
                || isJSONType(type, Object, isExactObject, 'object')
                || isJSONType(type, Array, isArray)
                || isFunctionType(type)) {
                transformFlag = true;
                break;
            }
        }
        if (!transformFlag) {
            error(`the ${key} value does not hit all type rules`);
        }
    }
    props[key] = value;
}

let currentInstance;
function defineComponent(name, props, setup) {
    let propsKeys = [];
    let setupFn;
    let propsConfig = {};
    if (isFunction(props)) {
        setupFn = props;
    }
    else if (isFunction(setup)) {
        setupFn = setup;
        propsConfig = props;
        propsKeys = Object.keys(props);
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
            const propsInit = this.getProps();
            // run validate prop
            Object.keys(propsInit).forEach(key => validateProp(key, propsConfig[key], propsInit));
            console.log('validate props over', propsInit);
            const props = (this._props = reactivity.shallowReactive(propsInit));
            currentInstance = this;
            const template = setupFn.call(this, props, this);
            currentInstance = null;
            this._bm && this._bm.forEach((cb) => cb());
            this.emit('hook:beforeMount');
            this.$el = this.attachShadow({ mode: 'closed' });
            let isMounted = false;
            reactivity.effect(() => {
                if (!isMounted) {
                    this._bu && this._bu.forEach((cb) => cb());
                    this.emit('hook:beforeUpdate');
                }
                litHtml.render(template(), this.$el);
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
            for (const propName of propsKeys) {
                if (this.hasOwnProperty(propName)) {
                    const v = this[propName];
                    delete this[propName];
                    this[propName] = v;
                }
            }
        }
        static get observedAttributes() {
            return propsKeys;
        }
        emit(event, payload) {
            const customEvent = new CustomEvent(event, {
                bubbles: true,
                detail: payload,
            });
            this.dispatchEvent(customEvent);
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
        getProps() {
            // 用.传入的props 在getAttribute拿不到，需要从this.propName上进行取
            let obj = {};
            for (const propName of propsKeys) {
                obj[propName] = this.getAttribute(propName) || this[propName] || undefined;
            }
            return obj;
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
            this._props[name] = newValue;
            validateProp(name, propsConfig[name], this._props);
        }
    };
    for (const propName of propsKeys) {
        Object.defineProperty(Component.prototype, propName, {
            get() {
                if (!this._props)
                    return undefined;
                return this._props[propName];
            },
            set(v) {
                this._props[propName] = v;
                validateProp(propName, propsConfig[propName], this._props);
            }
        });
    }
    customElements.define(name, Component);
}
function createLifecycleMethod(name) {
    return (cb) => {
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

Object.keys(litHtml).forEach(function (k) {
  if (k !== 'default') Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () {
      return litHtml[k];
    }
  });
});
Object.keys(reactivity).forEach(function (k) {
  if (k !== 'default') Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () {
      return reactivity[k];
    }
  });
});
exports.defineComponent = defineComponent;
exports.onBeforeMount = onBeforeMount;
exports.onBeforeUpdate = onBeforeUpdate;
exports.onMounted = onMounted;
exports.onUnmounted = onUnmounted;
exports.onUpdated = onUpdated;
