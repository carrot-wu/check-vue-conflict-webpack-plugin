# check-vue-conflict-webpack-plugin
[![NPM Version][npm-image]][npm-url]

一个能够检测.vue单文件template模板中是否存在遗留的合并冲突代码的webpack插件

## 安装

```
npm install @carrotwu/check-vue-conflict-webpack-plugin -D
or
yarn add @carrotwu/check-vue-conflict-webpack-plugin -D
```

## 使用

使用的方式十分简单，只需要在webpack配置中引入实例化当前插件即可，插件内部判断了只会在production模式下才进行插件的注册,如果强制需要在开发环境中也进行检测只需设置`force`为true即可。
```js
new VueConflictPlugin({force: true})
```

### vue-cli中使用

> 下面展示在vue-cli启动的项目中如何使用当前插件


对于使用`vue-cli`启动的项目，只需要在vue.config.js添加webpack配置即可

```js
const VueConflictPlugin = require('@carrotwu/check-vue-conflict-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [new VueConflictPlugin()]
  }
}

```


## 插件是如何检测冲突代码的呢

本来呢想通过babel插件的形式来对vue单文件模板中的template编译的内容进行ast语法树的分析来进行检测，思路跟我之前写的react冲突babel插件一样。

问题是在实际调试的过程中发现.vue单文件在经过vue-loader进行编译的时候：
1. script中的js代码是会经过babel的编译解析，这部分没问题
2. template中的渲染模板是由vue官方维护的`vue-template-compiler`进行静态分析编译成vue特定的ast语法树，类似于这种
```js
{
  ast: {
    type: 1,
    tag: 'div',
    attrsList: [ [Object] ],
    attrsMap: { id: 'test' },
    rawAttrsMap: {},
    parent: undefined,
    children: [ [Object], [Object], [Object] ],
    plain: false,
    attrs: [ [Object] ],
    static: false,
    staticRoot: false
  },
  render: `with(this){return _c('div',{attrs:{"id":"test"}},[
        _m(0),          // 上述提到的静态子树，索引为0 <div><p>This is my vue render test</p></div>
        _v(" "),        // 空白节点 </div> <p> 之间的换行内容
        _c('p',[_v("my name is "+_s(myName))])  // <p>my name is {{myName}}</p>
    ])}`,
  staticRenderFns: [
    `with(this){return _c('div',[_c('p',[_v("This is my vue render test")])])}`
  ],
  errors: [],
  tips: []
}
```

编译优化过后的模板代码并不走babel编译所以babel插件的想法无法实现。

所以换了一种思路，不管vue的template如何折腾最终都是要经由webpack打包成一个module，最后交由webpack进行组装输出成相应的js。

**所以可以通过webpack插件进行监听相关的生命周期钩子获取vue-template-compiler编译好的模板module，自己手动的引入babel进行ast语法分析即可**

具体的实现可以查看我的另外一篇[`博客文章`](https://ssr.carrotwu.com/post?id=39)
