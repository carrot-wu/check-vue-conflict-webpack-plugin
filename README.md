# check-conflict-babel-plugin
[![NPM Version][npm-image]][npm-url]

一个能够检测.vue单文件template模板中是否存在遗留的合并冲突代码的webpack插件

## 安装

```
npm install @carrotwu/check-vue-conflict-webpack-plugin -D
or
yarn add @carrotwu/check-vue-conflict-webpack-plugins -D
```

## 使用

使用的方式十分简单，只需要在webpack配置中引入实例化当前插件即可，插件内部判断了只会在production模式下才进行插件的注册

### vue-cli中使用

> 下面展示在vue-cli启动的仙姑中如何使用当前插件



## 插件是如何检测冲突代码的呢

我们都知道的是在react中，所有的jsx代码最终都会被react转移成`react.createElement`的代码形式，所以我们只需要通过babel对生成的语法树做语法分析即可。这样子我们就能获取到渲染函数中的合并冲突代码。如果想更加深入的了解插件的内在原理，可以查看我之前写的一篇[`博客文章`](https://github.com/timarney/react-app-rewired/)
