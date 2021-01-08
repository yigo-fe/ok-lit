export declare type PropType<T = any> = T;
export declare type PropTypes<T = any> = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor | FunctionConstructor | PropType<T>;
export interface Prop<T = PropTypes> {
    type: PropTypes<T> | PropTypes<T>[];
    default?: string | number | boolean | object | Array<any> | Function;
    required?: boolean;
    transform?: (value: string) => any;
}
export interface PropsType {
    [key: string]: Prop;
}
export declare function getDefaultValue(config: Prop): any;
export declare function validateProp(key: string, config: Prop, props: {
    [key: string]: any;
}): void;
