export declare const warn: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
export declare const error: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
export declare const isArray: (arg: any) => arg is any[];
export declare const isFunction: (arg: unknown) => arg is Function;
export declare const isString: (arg: unknown) => arg is string;
export declare const isNumber: (arg: unknown) => arg is number;
export declare const isBoolean: (arg: unknown) => arg is boolean;
export declare const isObject: (arg: unknown) => arg is object;
export declare const isExactObject: (arg: unknown) => arg is unknown;
export declare function isNullOrUndefined(arg: unknown): arg is undefined | null;
export declare function toBoolean(value: unknown): boolean;
export declare function JSONCopy<T extends object>(value: T): T;
export declare function isJSONString(value: string): boolean | object;
export declare const decamelizeKeyRegexp: RegExp;
export declare const camelizeKeyRegexp: RegExp;
export declare function decamelizeKey(value: string): string;
export declare function camelizeKey(value: string): string;
export declare function getAllKeys(propsKeys: string[]): string[];
export declare function mapPropsKeys(propsKeys: string[], callback: (propName: string, decamelizePropName?: string) => void): void;
