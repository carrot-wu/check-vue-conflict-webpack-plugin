import traverse from '@babel/traverse';
import { parse } from '@babel/parser';
import * as babelTypes from '@babel/types';
import { StringLiteral } from '@babel/types';
import { VueTemplateModule } from './types';

const oldVueToken = ['_vm'];
const oldVuePropertyKey = ['_v'];

export function checkVue2IsConflict(module: VueTemplateModule) {
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
          oldVueToken.includes(callee.object.name) &&
          babelTypes.isIdentifier(callee.property) &&
          oldVuePropertyKey.includes(callee.property.name)
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

export function checkVue3IsConflict(module: VueTemplateModule) {
  const { _source, resource } = module;
  const vueTemplateAst = parse(_source._value, {
    sourceType: 'module',
  });
  traverse(vueTemplateAst, {
    CallExpression(path) {
      // @ts-ignore
      const { callee } = path.node;
      const nodeArguments = path.node.arguments;
      const isCreateVNode =
        babelTypes.isIdentifier(callee) &&
        callee.name === '_createVNode' &&
        babelTypes.isStringLiteral(nodeArguments[2]);
      const isCreateTextVNode =
        babelTypes.isIdentifier(callee) &&
        callee.name === '_createTextVNode' &&
        babelTypes.isStringLiteral(nodeArguments[0]);
      if (!(isCreateVNode || isCreateTextVNode)) {
        return;
      }
      const pendingCheckStr = nodeArguments[isCreateVNode ? 2 : 0] as StringLiteral;

      const conflictText = pendingCheckStr.value.match(/(={7})|(>{7})|(<{7})/);
      if (conflictText) {
        // 检测到合并冲突 直接抛出错误
        throw new Error(
          `在 【${resource}】 文件中检测到疑似合并冲突，请处理完之后重新提交
            出现合并冲突内容为${pendingCheckStr.value}
          `,
        );
      }
    },
  });
}
