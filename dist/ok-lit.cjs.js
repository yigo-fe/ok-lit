'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var litHtml = require('lit-html');
var reactivity = require('@vue/reactivity');
var shadyCss = require('@webcomponents/shadycss');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

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
    catch (_a) {
    }
    return false;
}

function getDefaultValue(config) {
    return isFunction(config.default) && config.type !== Function ? config.default() : config.default;
}
const boolFn = () => true;
function validateProp(key, config, props) {
    const { default: defaultValue, required, validator, transform: userTransform } = config;
    let value = props[key];
    if (isNullOrUndefined(value)) {
        if (defaultValue !== undefined) {
            value = getDefaultValue(config);
        }
        else if (required) {
            error(`props ${key} is required!`);
            return;
        }
        else {
            return;
        }
    }
    function isBaseType(nowType, type, isType, transform) {
        !transform && (transform = type);
        userTransform && (transform = userTransform);
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
            const transform = userTransform !== null && userTransform !== void 0 ? userTransform : isJSONString;
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
                const transform = userTransform !== null && userTransform !== void 0 ? userTransform : toFunction;
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
    callValidator(validator, key, value);
}
function callValidator(validator, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        const validatorFn = validator !== null && validator !== void 0 ? validator : boolFn;
        let validateResult;
        try {
            validateResult = yield validatorFn(value);
        }
        catch (err) {
            error(err.message);
        }
        if (!validateResult) {
            error(`the props.${key} validate error`);
        }
    });
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
const EMPTY_OBJ =  {};
const NOOP = () => { };
const isArray$1 = Array.isArray;
const isMap = (val) => toTypeString(val) === '[object Map]';
const isSet = (val) => toTypeString(val) === '[object Set]';
const isFunction$1 = (val) => typeof val === 'function';
const isObject$1 = (val) => val !== null && typeof val === 'object';
const isPromise = (val) => {
    return isObject$1(val) && isFunction$1(val.then) && isFunction$1(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
// compare whether a value has changed, accounting for NaN.
const hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);

// Simple effect.
function watchEffect(effect, options) {
    return doWatch(effect, null, options);
}
// initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {};
const callWithErrorHandling = (source, args) => args ? source(...args) : source();
function callWithAsyncErrorHandling(fn, args) {
    if (isFunction$1(fn)) {
        const res = callWithErrorHandling(fn, args);
        if (res && isPromise(res)) {
            res.catch(err => {
                console.error(err);
            });
        }
        return res;
    }
    const values = [];
    for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], args));
    }
    return values;
}
// implementation
function watch(source, cb, options) {
    return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, onTrack, onTrigger } = EMPTY_OBJ) {
    let getter;
    let forceTrigger = false;
    if (reactivity.isRef(source)) {
        getter = () => source.value;
        forceTrigger = !!source._shallow;
    }
    else if (reactivity.isReactive(source)) {
        getter = () => source;
        deep = true;
    }
    else if (isArray$1(source)) {
        getter = () => source.map(s => {
            if (reactivity.isRef(s)) {
                return s.value;
            }
            else if (reactivity.isReactive(s)) {
                return traverse(s);
            }
            else if (isFunction$1(s)) {
                return callWithErrorHandling(s);
            }
        });
    }
    else if (isFunction$1(source)) {
        if (cb) {
            // getter with cb
            getter = () => callWithErrorHandling(source);
        }
        else {
            // no cb -> simple effect
            getter = () => {
                if (cleanup) {
                    cleanup();
                }
                return callWithErrorHandling(source, [onInvalidate]);
            };
        }
    }
    else {
        getter = NOOP;
    }
    if (cb && deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }
    let cleanup;
    const onInvalidate = (fn) => {
        cleanup = runner.options.onStop = () => {
            callWithErrorHandling(fn);
        };
    };
    let oldValue = isArray$1(source) ? [] : INITIAL_WATCHER_VALUE;
    const job = () => {
        if (!runner.active) {
            return;
        }
        if (cb) {
            // watch(source, cb)
            const newValue = runner();
            if (deep || forceTrigger || hasChanged(newValue, oldValue)) {
                // cleanup before running cb again
                if (cleanup) {
                    cleanup();
                }
                callWithAsyncErrorHandling(cb, [
                    newValue,
                    // pass undefined as the old value when it's changed for the first time
                    oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
                    onInvalidate
                ]);
                oldValue = newValue;
            }
        }
        else {
            // watchEffect
            runner();
        }
    };
    // important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger (#1727)
    job.allowRecurse = !!cb;
    let scheduler;
    scheduler = job;
    const runner = reactivity.effect(getter, {
        lazy: true,
        onTrack,
        onTrigger,
        scheduler
    });
    // initial run
    if (cb) {
        if (immediate) {
            job();
        }
        else {
            oldValue = runner();
        }
    }
    else {
        runner();
    }
    return () => {
        reactivity.stop(runner);
    };
}
function traverse(value, seen = new Set()) {
    if (!isObject$1(value) || seen.has(value)) {
        return value;
    }
    seen.add(value);
    if (reactivity.isRef(value)) {
        traverse(value.value, seen);
    }
    else if (isArray$1(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    }
    else if (isSet(value) || isMap(value)) {
        value.forEach((v) => {
            traverse(v, seen);
        });
    }
    else {
        for (const key in value) {
            traverse(value[key], seen);
        }
    }
    return value;
}

let currentInstance;
function defineComponent(name, props, setup, mode) {
    let propsKeys = [];
    let setupFn;
    let propsConfig = {};
    let modeConfig = 'open';
    if (isFunction(props)) {
        setupFn = props;
        if (typeof setup === 'string') {
            modeConfig = setup;
        }
    }
    else if (isFunction(setup)) {
        setupFn = setup;
        propsConfig = props;
        propsKeys = Object.keys(props);
        if (mode) {
            modeConfig = mode;
        }
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
            const propsInit = this._getProps();
            // run validate prop
            Object.keys(propsInit).forEach(key => validateProp(key, propsConfig[key], propsInit));
            const props = (this._props = reactivity.shallowReactive(propsInit));
            currentInstance = this;
            const template = setupFn.call(null, props, this);
            shadyCss.prepareTemplate(template().getTemplateElement(), name);
            currentInstance = null;
            this._bm && this._bm.forEach((cb) => cb());
            this.emit('hook:beforeMount');
            this.$el = this.attachShadow({ mode: modeConfig });
            let isMounted = false;
            reactivity.effect(() => {
                if (!isMounted) {
                    this._bu && this._bu.forEach((cb) => cb());
                    this.emit('hook:beforeUpdate');
                }
                litHtml.render(template(), this.$el);
                if (isMounted) {
                    this._applyDirective();
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
        _applyDirective() {
            this._applyVShow();
            this._applyRef();
        }
        _applyRef() {
            const refs = this.$el.querySelectorAll('[ref]');
            this.$refs = {};
            Array.from(refs).forEach((el) => {
                const refKey = el.getAttribute('ref');
                if (this.$refs[refKey]) {
                    if (Array.isArray(this.$refs[refKey])) {
                        this.$refs[refKey].push(el);
                    }
                    else {
                        this.$refs[refKey] = [this.$refs[refKey], el];
                    }
                }
                else {
                    this.$refs[refKey] = el;
                }
            });
        }
        _applyVShow() {
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
        _getProps() {
            // 用.传入的props 在getAttribute拿不到，需要从this.propName上进行取
            let obj = {};
            for (const propName of propsKeys) {
                obj[propName] = this.getAttribute(propName) || this[propName] || undefined;
            }
            return obj;
        }
        connectedCallback() {
            shadyCss.styleElement(this);
            this._applyDirective();
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
exports.watch = watch;
exports.watchEffect = watchEffect;
