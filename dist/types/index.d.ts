import { TemplateResult } from 'lit-html';
import { PropType, PropsType, PropTypes } from './props';
declare type HookFn = () => unknown;
declare type GetPropType<T> = T extends ObjectConstructor ? Record<string, any> : T extends BooleanConstructor ? boolean : T extends NumberConstructor ? number : T extends StringConstructor ? string : T extends ArrayConstructor ? Array<any> : T extends FunctionConstructor ? Function : PropType<T>;
interface SetupFn<Props extends PropsType = {}> {
    (props: {
        [key in keyof Props]: Props[key]['type'] extends PropType ? Props[key]['type'] : Props[key]['type'] extends Array<PropTypes> ? GetPropType<Props[key]['type'][0]> : GetPropType<Props[key]['type']>;
    }, context: HTMLElement & {
        $el: ShadowRoot;
        $refs: Record<string, HTMLElement | HTMLElement[]>;
        emit(event: string, payload?: any): void;
    }): () => TemplateResult;
}
export declare function defineComponent<Name extends Lowercase<string>>(name: Name, setup: SetupFn): void;
export declare function defineComponent<Name extends Lowercase<string>, Props extends PropsType = {}>(name: Name, props: Props, setup: SetupFn<Props>): void;
export declare const onBeforeMount: (cb: HookFn) => void;
export declare const onMounted: (cb: HookFn) => void;
export declare const onBeforeUpdate: (cb: HookFn) => void;
export declare const onUpdated: (cb: HookFn) => void;
export declare const onUnmounted: (cb: HookFn) => void;
export * from 'lit-html';
export * from '@vue/reactivity';
export type { PropType };
