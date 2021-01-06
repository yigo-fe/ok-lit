import {
  toBoolean,
  isNullOrUndefined,
  isNumber,
  isBoolean,
  isString,
  warn,
  error,
  isJSONString,
  isExactObject, isArray, isFunction
} from "./utils";

export type PropTypes = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor | FunctionConstructor
export interface Prop {
  type: PropTypes | PropTypes[]
  default?: string | number | boolean | object | Array<any> | Function
  required?: boolean
  transform?: (value: string) => any
}
export interface PropsType {
  [key: string]: Prop
}

export function getDefaultValue(config: Prop) {
  return config.default
}

export function validateProp(key: string, config: Prop, props: { [key: string]: any }) {
  let value = props[key]
  if (isNullOrUndefined(value)) {
    if (config.default) {
      value = isFunction(config.default) && config.type !== Function ? config.default() : config.default
    } else if (config.required) {
      error(`props ${key} is required!`)
    }
    return
  }
  function isBaseType(type: BooleanConstructor | NumberConstructor | StringConstructor, isType: Function, transform?: Function) {
    if (!transform) {
      transform = type
    }
    if (config.transform) {
      transform = config.transform
    }
    if (config.type === type && !isType(value)) {
      value = transform(value)
    }
  }
  function isJSONType(type: ObjectConstructor | ArrayConstructor, isType: Function, str: 'object' | 'array') {
    if (config.type === type && !isType(value)) {
      const transform = config.transform ?? isJSONString
      const jsonResult = transform(value)
      if (jsonResult && isType(jsonResult)) {
        value = jsonResult
      } else {
        warn(`the ${key} is a ${str}, please give the ${str} or JSON string`)
      }
    }
  }
  isBaseType(String, isString)
  isBaseType(Number, isNumber)
  isBaseType(Boolean, isBoolean, toBoolean)
  isJSONType(Object, isExactObject, 'object')
  isJSONType(Array, isArray, 'array')
  if (config.type === Function && !isFunction(value)) {
    try {
      const toFunction = (value: string) => {
        return new Function(`return ${value}`)()
      }
      const transform = config.transform ?? toFunction
      const fn = transform(value)
      isFunction(fn) && (value = fn)
    } catch (e) {
      console.error(e)
    }
  }
  props[key] = value
}

