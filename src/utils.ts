const emptyFn = () => {}
export const warn = process.env.NODE_ENV === 'development' ? console.warn : emptyFn
export const error = console.error
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
export const decamelizeKeyRegexp = /[A-Z]/g
export const camelizeKeyRegexp = /-([a-z])/g
/*
* 驼峰转中划线
* */
export function decamelizeKey(value: string): string {
	return value.replace(decamelizeKeyRegexp, (text) => '-' + text.toLowerCase()).replace(/^-/, '')
}

export function camelizeKey(value: string): string {
	return value.replace(camelizeKeyRegexp, (text, $1) => $1.toUpperCase())
}

export function getAllKeys(propsKeys: string[]): string[] {
	let result: string[] = []
	mapPropsKeys(propsKeys, ((propName, decamelizePropName) => {
		if (decamelizePropName) {
			result.push(decamelizePropName)
			return
		}
		result.push(propName)
	}))
	return result
}

/*
* 遍历propsKeys，如果是驼峰命名的话，就转成中划线再执行一遍，第二个参数是中划线以后的propName
* */
export function mapPropsKeys(propsKeys: string[], callback: (propName: string, decamelizePropName?: string) => void): void {
	for (const propName of propsKeys) {
		callback(propName)
		if (decamelizeKeyRegexp.test(propName)) {
			callback(propName, decamelizeKey(propName))
		}
	}
}
