const emptyFn = () => {}
export const warn = process.env.NODE_ENV === 'development' ? console.warn : emptyFn
export const error = process.env.NODE_ENV === 'development' ? console.error : emptyFn
const toString = Object.prototype.toString
const getExactType = (arg: unknown) => toString.call(arg).slice(8, -1)
function isType<T>(type: string): (arg: unknown) => arg is T {
  return function(arg: unknown): arg is T {
    return typeof arg === type
  }
}
function isExactType<T>(type: string): (arg: unknown) => arg is T {
  return function(arg: unknown): arg is T {
    return getExactType(arg) === type
  }
}
export const isArray = Array.isArray
export const isFunction = isType<Function>('function')
export const isString = isType<string>('string')
export const isNumber = isType<number>('number')
export const isBoolean = isType<boolean>('boolean')
export const isObject = isType<object>('object')
export const isExactObject = isExactType('Object')
export function isNullOrUndefined(arg: unknown): arg is undefined | null {
  return arg === null || arg === undefined
}

export function toBoolean(value: unknown): boolean {
  return value === 'false' ? false : !!value
}

export function JSONCopy<T extends object>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function isJSONString(value: string): boolean | object {
  try {
    const result = JSON.parse(value)
    if (isObject(result)) {
      return result;
    }
  } catch {
  }
  return false
}