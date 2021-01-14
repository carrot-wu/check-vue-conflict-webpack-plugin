import { Compiler, Module } from 'webpack';
import { checkVue2IsConflict, checkVue3IsConflict } from './vueTraverse';

interface VueTemplateModule extends Module {
  resource?: string;
  _source: {
    _value: string;
  };
  userRequest?: string;
}

interface CheckVueConflictPluginOptions {
  // 是否强制开启进行模板冲突检测
  force?: boolean;
}

let vueVersion = '2';
try {
  // eslint-disable-next-line
  vueVersion = require('vue').version;
} catch (e) {
  throw new Error(e);
}
// 判断是否vue模板 注意的是 mac的路径为相对路径 所以不能实例化的URL方法形式
// 改用正则
function isVueTemplate(url: string) {
  if (/\.vue\?vue&type=template/.test(url)) {
    return true;
  }
}

class CheckVueConflictPlugin {
  private readonly options: CheckVueConflictPluginOptions;

  constructor(options?: CheckVueConflictPluginOptions) {
    this.options = options || {};
  }

  apply(compiler: Compiler) {
    const { force = false } = this.options;
    const pluginName = this.constructor.name;
    const { options } = compiler;
    const { mode } = options;
    // 非生产模式并且不需要强制执行直接退出即可
    if (mode !== 'production' && !force) {
      return;
    }
    // 注册实例化compilation之后的钩子
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.seal.tap(pluginName, () => {
        const newModule = Array.from(compilation.modules) as VueTemplateModule[];
        const templateModulesArray = newModule.filter(
          (module) => module.resource && isVueTemplate(module.resource) && module.resource !== module.userRequest,
        );
        // template模板有两种 一种是经过vue-loader模板处理的 template文件 这时候的request或者userRequest 引用路径其实就是vue-loader
        // 一种是经过vue-loader编译之后导出的
        // 我们要的是第儿2种即 经过vue-loader处理过后的 这时候的request与resource路径是不一样的
        if (templateModulesArray.length) {
          // 此时获取到的module模块内容就是经过vue-loader经过静态分析优化完的模板字符串内容
          for (let i = 0; i < templateModulesArray.length; i++) {
            if (templateModulesArray[i]._source._value) {
              if (Number(vueVersion[0]) > 2) {
                checkVue3IsConflict(templateModulesArray[i]);
              } else {
                checkVue2IsConflict(templateModulesArray[i]);
              }
            }
          }
        }
      });
    });
  }
}

export default CheckVueConflictPlugin;
