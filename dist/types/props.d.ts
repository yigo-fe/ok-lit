export declare type PropTypes = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor | FunctionConstructor;
export interface Prop {
    type: PropTypes | PropTypes[];
    default?: string | number | boolean | object | Array<any> | Function;
    required?: boolean;
    transform?: (value: string) => any;
}
export interface PropsType {
    [key: string]: Prop;
}
export declare function getDefaultValue(config: Prop): string | number | boolean | object | Function | any[] | undefined;
export declare function validateProp(key: string, config: Prop, props: {
    [key: string]: any;
}): void;
