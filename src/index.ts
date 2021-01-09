import { URL } from 'url';
import { Compiler, Module } from 'webpack';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as babelTypes from '@babel/types';
import { StringLiteral } from '@babel/types';

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
const newVueToken = ['_vm'];
const vuePropertyKey = ['_v'];

function isVueTemplate(url: string) {
  const vueUrl = new URL(url);
  if (vueUrl.searchParams.get('type') === 'template') {
    return true;
  }
}

function checkIsConflict(module: VueTemplateModule) {
  const { _source, resource } = module;
  const vueTemplateAst = parse(_source._value, {
    sourceType: 'module',
  });
  traverse(vueTemplateAst, {
    CallExpression(path) {
      const { callee } = path.node;
      if (
        !(
          babelTypes.isMemberExpression(callee) &&
          babelTypes.isIdentifier(callee.object) &&
          newVueToken.includes(callee.object.name) &&
          babelTypes.isIdentifier(callee.property) &&
          vuePropertyKey.includes(callee.property.name)
        )
      ) {
        return;
      }
      // get the component type name and it's extra props options
      const childrenArray = path.node.arguments;
      const stringLiteralChildArray = childrenArray.filter((children) =>
        babelTypes.isStringLiteral(children),
      ) as StringLiteral[];

      const stringLiteralValArray = stringLiteralChildArray.map((child) => child.value);

      const conflictText = stringLiteralValArray.find((strText) => strText.match(/(={7})|(>{7})|(<{7})/));
      if (conflictText) {
        // 检测到合并冲突 直接抛出错误
        throw new Error(
          `在 【${resource}】 文件中检测到疑似合并冲突，请处理完之后重新提交
            出现合并冲突内容为${conflictText}
          `,
        );
      }
    },
  });
}

class CheckVueConflictPlugin {
  private readonly options: CheckVueConflictPluginOptions;

  constructor(options: CheckVueConflictPluginOptions) {
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
              checkIsConflict(templateModulesArray[i]);
            }
          }
        }
      });
    });
  }
}

export default CheckVueConflictPlugin;
