import { TemplateResult } from 'lit-html';
declare type HookFn = () => unknown;
declare type SetupFn = (props: object, context: {
    $el: ShadowRoot;
    $refs: Record<string, HTMLElement>;
    emit(event: string, payload?: any): void;
}) => () => TemplateResult;
declare type PropTypes = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor | FunctionConstructor;
interface PropsType {
    [key: string]: {
        type: PropTypes | PropTypes[];
        default?: string | number | boolean | object | Array<any> | Function;
        required?: boolean;
        transform?: (value: string) => any;
    };
}
export declare function defineComponent(name: string, setup: SetupFn): void;
export declare function defineComponent(name: string, props: PropsType, setup: SetupFn): void;
export declare const onBeforeMount: (cb: HookFn) => void;
export declare const onMounted: (cb: HookFn) => void;
export declare const onBeforeUpdate: (cb: HookFn) => void;
export declare const onUpdated: (cb: HookFn) => void;
export declare const onUnmounted: (cb: HookFn) => void;
export * from 'lit-html';
export * from '@vue/reactivity';
