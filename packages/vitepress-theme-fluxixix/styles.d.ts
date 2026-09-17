/**
 * 让 TS 认识 CSS 副作用导入。
 *
 * 主题入口会 `import './styles/index.css'`，使用方也会 `import '.../fonts'`。
 * 纯 tsc 不认识 .css 扩展名，会报 TS2882；Vite 自己处理这些导入，类型层面
 * 只需要一个占位声明。
 */
declare module '*.css' {}
