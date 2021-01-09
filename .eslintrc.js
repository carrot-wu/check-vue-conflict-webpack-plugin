module.exports = {
  parser: '@typescript-eslint/parser', // 定义ESLint的解析器
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'eslint-config-prettier',
    'prettier/@typescript-eslint',
  ], // 定义文件继承的子规范
  plugins: ['@typescript-eslint', 'prettier'], // 定义了该eslint文件所依赖的插件
  env: {
    // 指定代码的运行环境
    browser: true,
    node: true,
  },
  rules: {
    // 缩进双空格
    '@typescript-eslint/indent': ['error', 2],
    // 允许下划线命令
    '@typescript-eslint/camelcase': 0,
    // 接口命名允许以I开头
    '@typescript-eslint/interface-name-prefix': 0,
    // 允许tslint
    '@typescript-eslint/ban-ts-ignore': 0,
    // 允许返回函数无类型
    '@typescript-eslint/explicit-module-boundary-types': 0,
    // 允许填写any
    '@typescript-eslint/no-explicit-any': 0,
    // 允许使用@ts-ignore
    '@typescript-eslint/ban-ts-comment': 0,
    // 允许非空断言
    '@typescript-eslint/no-non-null-assertion': 0,
    // 允许下划线_
    'no-underscore-dangle': 0,
    // 允许不添加分号
    semi: 0,
    // 不检测花括号后是否要换行
    'object-curly-newline': 0,
    // import引入文件允许不添加后缀
    'import/extensions': 0,
    // 允许匿名function声明
    'func-names': 0,
    // 允许添加console
    'no-console': 0,
    // 禁止有最大长度检查
    'max-len': 0,
    // 允许export一个模块
    'import/prefer-default-export': 0,
    // class类型方法允许不使用this
    'class-methods-use-this': 0,
    // 允许对函数参数再赋值 类似于reduce方法就需要
    'no-param-reassign': 0,
    // 不严格控制数组结构
    'prefer-destructuring': 0,
    'comma-dangle': ['error', 'only-multiline'],
    'consistent-return': 0,
    // 允许使用++
    'no-plusplus': 0,
    'linebreak-style': ['off', 'windows'],
    // 引号
    quotes: [0, 'single'],
    camelcase: 0,
    'prettier/prettier': 1,
  },
  settings: {
    // 解决路径引用ts文件报错的问题
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
      // 解决tsconfig下的path别名导致eslint插件无法解决的bug
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
