import {
  toBoolean,
  isNullOrUndefined,
  isNumber,
  isBoolean,
  isString,
  error,
  isJSONString,
  isExactObject, isArray, isFunction
} from "./utils";

export type PropType<T = any> = T
export type PropTypes<T = any> = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor | FunctionConstructor | PropType<T>
export interface Prop<T = PropTypes> {
  type: PropTypes<T> | PropTypes<T>[]
  default?: string | number | boolean | object | Array<any> | Function
  required?: boolean
  transform?: (value: string) => any
  validator?: (value: unknown) => boolean | never | Promise<boolean>
}
export interface PropsType {
  [key: string]: Prop
}

export function getDefaultValue(config: Prop) {
  return isFunction(config.default) && config.type !== Function ? config.default() : config.default
}
const boolFn = () => true
export function validateProp(key: string, config: Prop, props: { [key: string]: any }) {
  const { default: defaultValue, required, validator, transform: userTransform } = config
  let value = props[key]
  if (isNullOrUndefined(value)) {
    if (defaultValue !== undefined) {
      value = getDefaultValue(config)
    } else if (required) {
      error(`props ${key} is required!`)
      return
    } else {
      return
    }
  }
  function isBaseType(nowType: PropTypes, type: BooleanConstructor | NumberConstructor | StringConstructor, isType: Function, transform?: Function) {
    !transform && (transform = type)
    userTransform && (transform = userTransform)
    if (nowType !== type) {
      return false
    }
    if (isType(value)) {
      return true
    } else {
      const transformResult = transform(value)
      if (type === Number && Number.isNaN(transformResult)) {
        return false
      }
      value = transformResult
      return true
    }
  }
  function isJSONType(nowType: PropTypes, type: ObjectConstructor | ArrayConstructor, isType: Function, str?: 'object' | 'array') {
    if (nowType !== type) {
      return false
    }
    if (isType(value)) {
      return true
    } else {
      const transform = userTransform ?? isJSONString
      const jsonResult = transform(value)
      if (jsonResult && isType(jsonResult)) {
        value = jsonResult
        return true
      }
      str && error(`the ${key} is a ${str}, please give the ${str} or JSON string`)
      return false
    }
  }
  function isFunctionType(nowType: PropTypes) {
    if (nowType !== Function) {
      return false
    }
    if (isFunction(value)) {
      return true
    } else {
      try {
        const toFunction = (value: string) => {
          return new Function(`return ${value}`)()
        }
        const transform = userTransform ?? toFunction
        const fn = transform(value)
        isFunction(fn) && (value = fn)
        return true
      } catch (e) {
        error(e)
        return false
      }
    }
  }
  if (config.type) {
    const noRepeatArray = isArray(config.type) ? [...new Set(config.type)] : [config.type]
    let transformFlag = false
    for (let i = 0; i < noRepeatArray.length; i++) {
      const type =noRepeatArray[i]
      if (
        isBaseType(type, String, isString)
        || isBaseType(type, Number, isNumber)
        || isBaseType(type, Boolean, isBoolean, toBoolean)
        || isJSONType(type, Object, isExactObject, 'object')
        || isJSONType(type, Array, isArray)
        || isFunctionType(type)
      ) {
        transformFlag = true
        break
      }
    }
    if (!transformFlag) {
      error(`the ${key} value does not hit all type rules`)
    }
  }
  props[key] = value
  callValidator(validator, key, value)
}


async function callValidator(validator: Prop['validator'], key: string, value: unknown) {
  const validatorFn = validator ?? boolFn
  let validateResult
  try {
    validateResult = await validatorFn(value)
  } catch (err) {
    error(err.message)
  }
  if (!validateResult) {
    error(`the props.${key} validate error`)
  }
}
