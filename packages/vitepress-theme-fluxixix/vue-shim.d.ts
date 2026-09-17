/**
 * 让 TS 认识 .vue 单文件组件。
 *
 * 只有 Vue 那套工具（vue-tsc / Volar）才懂 .vue 的语法，纯 tsc 看到的是一个
 * 不认识的扩展名，所以 theme/index.ts 里 `import Layout from './Layout.vue'`
 * 会报「找不到模块」。这里描一个最小签名把类型补上——泛型全走 DefineComponent
 * 的默认值，够用就行，不必把组件的 props 一个个写出来。
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
