import { Ref, ComputedRef, ReactiveEffectOptions } from '@vue/reactivity';
export declare type WatchEffect = (onInvalidate: InvalidateCbRegistrator) => void;
export declare type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T);
export declare type WatchCallback<V = any, OV = any> = (value: V, oldValue: OV, onInvalidate: InvalidateCbRegistrator) => any;
declare type MapSources<T, Immediate> = {
    [K in keyof T]: T[K] extends WatchSource<infer V> ? Immediate extends true ? (V | undefined) : V : T[K] extends object ? Immediate extends true ? (T[K] | undefined) : T[K] : never;
};
declare type InvalidateCbRegistrator = (cb: () => void) => void;
export interface WatchOptionsBase {
    flush?: 'pre' | 'post' | 'sync';
    onTrack?: ReactiveEffectOptions['onTrack'];
    onTrigger?: ReactiveEffectOptions['onTrigger'];
}
export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
    immediate?: Immediate;
    deep?: boolean;
}
export declare type WatchStopHandle = () => void;
export declare function watchEffect(effect: WatchEffect, options?: WatchOptionsBase): WatchStopHandle;
declare type MultiWatchSources = (WatchSource<unknown> | object)[];
export declare function watch<T extends MultiWatchSources, Immediate extends Readonly<boolean> = false>(sources: [...T], cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchStopHandle;
export declare function watch<T extends Readonly<MultiWatchSources>, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchStopHandle;
export declare function watch<T, Immediate extends Readonly<boolean> = false>(source: WatchSource<T>, cb: WatchCallback<T, Immediate extends true ? (T | undefined) : T>, options?: WatchOptions<Immediate>): WatchStopHandle;
export declare function watch<T extends object, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<T, Immediate extends true ? (T | undefined) : T>, options?: WatchOptions<Immediate>): WatchStopHandle;
export {};
