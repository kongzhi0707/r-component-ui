
### React 搭建组件库

#### 一：项目初始化

##### 1) 初始化项目
```
mkdir r-component-ui
cd r-component-ui
npm init -y
mkdir src && cd src && touch index.ts
```
##### 2) 代码规范

使用 <a href="https://github.com/umijs/fabric">@umijs/fabric</a> 的配置。
```
yarn add @umijs/fabric --dev

// 因为@umijs/fabric没有将prettier作为依赖 所以我们需要手动安装
yarn add prettier --dev 
```
##### .eslintrc.js

在项目的根目录下新建 .eslintrc.js，配置如下：
```
module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
};
```
##### .prettierrc.js

在项目的根目录下新建 .prettierrc.js，配置如下：
```
const fabric = require('@umijs/fabric');

module.exports = {
  ...fabric.prettier,
};
```
##### .stylelintrc.js

在项目的根目录新建 .stylelintrc.js，配置如下：
```
module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/stylelint')],
};
```
##### Commit Lint

进行 pre-commit 代码规范检测
```
yarn add husky lint-staged --dev
```
##### 进行 Commit Message 检测。
```
yarn add @commitlint/cli @commitlint/config-conventional commitizen cz-conventional-changelog --dev
```
在项目的根目录下 新增.commitlintrc.js写入以下内容：
```
module.exports = { extends: ['@commitlint/config-conventional'] };
```
##### package.json

package.json 写入如下内容：
```
{
  "scripts": {
    "commit": "git-cz",
  },
  "lint-staged": {
    "src/**/*.ts?(x)": [
      "prettier --write",
      "eslint --fix",
       "git add"
    ],
    "src/**/*.less": [
      "stylelint --syntax less --fix",
      "git add"
    ]
  },
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "pre-commit": "lint-staged"
    }
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```
后面可以使用 yarn commit 代替 git commit 生成规范的 Commit Message。

##### 安装TypeScript
```
yarn add typescript --dev
```
在项目的根目录下新建 tsconfig.json，并添加如下配置：
```
{
  "compilerOptions": {
    "baseUrl": "./",
    "target": "esnext",
    "module": "commonjs",
    "jsx": "react",
    "declaration": true,
    "declarationDir": "lib",
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noImplicitAny": false
  },
  "include": ["src", "typings.d.ts"],
  "exclude": ["node_modules"]
}
```
#### 注意：上面配置一定要加上 "noImplicitAny": false，否则在编译打包的时候会报错，会报类似的错误：Could not find a declaration file for module 'history'。

##### 新增组件

在 src 文件夹下 新建 alert 文件夹，目录结构如下：
```
｜--- src
｜ |--- alert
｜ | |--- index.tsx        # 源文件
｜ | |--- style
｜ | | |--- index.less     # 样式文件
｜ | | |--- index.ts       # 样式文件为什么存在 index.ts ，目的按需加载样式，管理样式依赖
```
安装 React 依赖
```
yarn add react react-dom @types/react @types/react-dom --dev # 开发时依赖，宿主环境一定存在
yarn add prop-types            # 运行时依赖，宿主环境可能不存在 安装本组件库时一起安装
```
src/alert/index.tsx 添加如下代码
```
import React from 'react';
import t from 'prop-types';

export interface AlertProps {
  kind?: 'info' | 'positive' | 'negative' | 'warning';
}

export type KindMap = Record<Required<AlertProps>['kind'], string>;

const prefixCls = 'happy-alert';

const kinds: KindMap = {
  info: '#5352ED',
  positive: '#2ED573',
  negative: '#FF4757',
  warning: '#FFA502',
};

const Alert: React.FC<AlertProps> = ({ children, kind = 'info', ...rest }) => (
  <div
    className={prefixCls}
    style={{
      background: kinds[kind],
    }}
    {...rest}
  >
    {children}
  </div>
);

Alert.propTypes = {
  kind: t.oneOf(['info', 'positive', 'negative', 'warning']),
};

export default Alert;
```
src/alert/style/index.less 代码如下：
```
@popupPrefix: happy-alert;

.@{popupPrefix} {
  padding: 20px;
  background: white;
  border-radius: 3px;
  color: white;
}
```
src/alert/style/index.less 代码如下：
```
@popupPrefix: happy-alert;

.@{popupPrefix} {
  padding: 20px;
  background: white;
  border-radius: 3px;
  color: white;
}
```
src/alert/style/index.ts 代码如下：
```
import './index.less';
```
src/index.ts 代码如下：
```
export { default as Alert } from './alert'; 
```
现在我们使用 git 提交一版本，可以看到控制台已经进行钩子检测了。
```
git add .
yarn commit 'feat: chapter-1 准备工作'
git push
```
#### 二：集成 dumi 工具

##### 1）集成 dumi

安装命令如下：
```
yarn add dumi serve --dev
```
增加 npm scripts 到 package.json 中
```
"scripts": {
  "dev": "dumi dev",  // 启动开发环境，在文档站点中调试组件
  "build:site": "rimraf doc-site && dumi build", // 构建文档站点 后续会部署到 github pages
  "preview:site": "npm run build:site && serve doc-site" // 本地预览构建后的文档站点
}
```
##### 2) 新建 .umirc.ts 配置文件

在项目的根目录下，新建 .unirc.ts 配置文件，并写入如下内容:
```
import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'React Component UI', // 站点名称
  mode: 'site',
  outputPath: 'doc-site', // 输出文件夹
  exportStatic: {}, // 后续会部署到 github pages 直接全部生成静态页面 不走前端路由
  dynamicImport: {}, // 拆包 站点过大时可以优化首屏加载速度
});
```
##### 3) 搭建站点骨架

在项目的根目录新建一个docs文件夹，最主要实现 站点首页，快速开始，贡献指南等导航

docs/index.md 添加如下内容
```
---
title: React Component UI
hero:
  title: React Component UI
  desc: 文档站点基于 dumi 生成
  actions:
    - text: 快速上手
      link: /getting-started
features:
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/881dc458-f20b-407b-947a-95104b5ec82b/k79dm8ih_w144_h144.png
    title: 特性 1
    desc: 测试1
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/d60657df-0822-4631-9d7c-e7a869c2f21c/k79dmz3q_w126_h126.png
    title: 特性 2
    desc: 测试2
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/d1ee0c6f-5aed-4a45-a507-339a4bfe076c/k7bjsocq_w144_h144.png
    title: 特性 3
    desc:  测试3
footer: Open-source MIT Licensed | Copyright © 2020<br />Powered by [dumi](https://d.umijs.org)
---
```
上面具体的含义，可以参考 dumi 文档进行配置。现在我们接下来使用 dumi 来帮助我们完成组件的开发调试。

##### 4）调试开发

新建 src/alert/demo/basic.tsx, 引入编写好的组件
```
import React from 'react';
import Alert from '../';
import '../style';

export default () => <Alert kind="warning">这是一条警告提示</Alert>
```
接着，让这个demo在浏览器跑起来，当我们修改 Alert源码时，页面能够及时热刷新，帮助我们调试组件。

新建 src/alert/index.md, 并添加如下内容：
```
---
title: Alert 警告提示
nav:
  title: 组件
  order: 2
group:
  title: 反馈
  order: 1
---

# Alert 警告提示

警告提示，展现需要关注的信息。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx"></code>
```
我们在项目的根目录中 运行 yarn dev 后，我们访问 http://localhost:8000/ 后看到如下界面：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/1.png"/>

当我们点击导航的组件，可以看到 Alert 组件对应的文档，如下图所示：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/2.png"/>

如上看到 <code src="./demo/basic.tsx"></code> 将我们编写的组件渲染到了 markdown 页面中，当然我们还有其他的方式，我们可以参考 <a href="https://d.umijs.org/zh-CN/guide/basic#%E5%86%99%E7%BB%84%E4%BB%B6-demo">dumi 文档</a>

##### 文档补全

我们可以直接通过 markdown 语法手写组件的API。

src/alert/index.md 添加如下代码：
```
## API

| 属性 | 说明     | 类型                                         | 默认值 |
| ---- | -------- | -------------------------------------------- | ------ |
| kind | 警告类型 | 'info'/'positive'/'negative'/'warning'非必填 | 'info' |
```
然后在页面上显示如下：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/3.png"/>

##### 自动补全

dumi 提供了一种方式 <a href="https://d.umijs.org/zh-CN/guide/advanced#%E7%BB%84%E4%BB%B6-api-%E8%87%AA%E5%8A%A8%E7%94%9F%E6%88%90">组件API自动生成</a>

因此我们需要在 Alert 组件的类型定义 加上注释 即可。

src/alert/index.tsx
```
export interface AlertProps {
  /**
   * @description      Alert 的类型
   * @default          'info'
   */
  kind?: 'info' | 'positive' | 'negative' | 'warning';
}
```
description 是属性字段的描述，default 是属性字段的默认值。dumi就能根据这些信息生成API了。因此这里我们需要使用另外一个内置组件 API。

src/alert/index.md 改成如下代码
```
---
title: Alert 警告提示
nav:
  title: 组件
  order: 2
group:
  title: 反馈
  order: 1
---

# Alert 警告提示

警告提示，展现需要关注的信息。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx"></code>

<API src="./index.tsx"></API>
```
效果如下：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/4.png"/>

#### 部署文档站点

我们可以直接把文档部署到 Github Pages.

##### 配置路由 和 publicPath

托管在 Github Pages , 因此我们的应用是挂在 ${username}.github.io/${repo} 下面。因此我们的站点应用的静态资源路径 publicPath 和 路由 basename 都需要进行适配。

在项目的根目录 .umirc.ts 代码改成如下：
```
import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'React Component UI', // 站点名称
  mode: 'site',
  outputPath: 'doc-site', // 输出文件夹
  exportStatic: {}, // 后续会部署到 github pages 直接全部生成静态页面 不走前端路由
  dynamicImport: {}, // 拆包 站点过大时可以优化首屏加载速度
  base: '/r-component-ui',  // 此处需要更换为自己的仓库名
  publicPath: '/r-component-ui/', // 此处需要更换为自己的仓库名
});
```
在 base 和 publicPath 未改之前，当我们 运行 yarn run preview:site 后，也是会重启一个服务器的，我们可以访问 http://localhost:3000/ 也是可以
访问到的，如下效果：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/5.png"/>

在我们的项目根目录下会生成 doc-site 文件夹。是因为我上面的 .umirc.ts 配置文件 outputPath 指定为 doc-site, 有对应的文件。如下：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/6.png"/>

但是当我把 base 和 publicPath ，如下这个配置加上 再 运行 yarn run preview:site 运行后，就访问不了。

base: '/r-component-ui',  // 此处需要更换为自己的仓库名
publicPath: '/r-component-ui/', // 此处需要更换为自己的仓库名

因此我们需要进行适配。yarn run preview:site 里的 serve doc-site是基于根目录预览. 因此我们可以通过环境变量来区分一下。
```
yarn add cross-env --dev
```
##### package.json 

"scripts": {
  "preview:site": "cross-env SITE_BUILD_ENV=PREVIEW npm run build:site && serve doc-site",
}

##### .umirc.ts 

.umirc.ts 代码改成如下：
```
import { defineConfig } from 'dumi';

// 此处需要更换为自己的仓库名
let base = '/r-component-ui';
let publicPath = '/r-component-ui/';

if (process.env.SITE_BUILD_ENV === 'PREVIEW') {
  base = undefined;
  publicPath = undefined;
}

export default defineConfig({
  title: 'React Component UI', // 站点名称
  mode: 'site',
  outputPath: 'doc-site', // 输出文件夹
  exportStatic: {}, // 后续会部署到 github pages 直接全部生成静态页面 不走前端路由
  dynamicImport: {}, // 拆包 站点过大时可以优化首屏加载速度
  base,
  publicPath,
});
```
如上配置完成后，我们再运行 yarn run preview:site 就可以访问了。

#### 部署站点应用

通过 gh-pages 一键部署
```
yarn add gh-pages --dev
```
##### package.json

打包添加 deploy:site 命令，如下：
```
"scripts": {
  "deploy:site": "npm run build:site && gh-pages -d doc-site",
}
```
执行 yarn deploy:site 命令成功后就可以在 ${username}.github.io/${repo} 看到自己的组件库文档站点啦。

因此 访问我的站点 https://kongzhi0707.github.io/r-component-ui/ 就可以访问的到了

#### 使用 Github Actions 自动触发部署

在项目的根目录新建 .github/workflows/gh-pages.yml 文件。后面当我们master触发push操作时，会自动触发站点部署。

```
name: github pages
on:
  push:
    branches:
      - master

jobs: 
  deploy:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@v2
      - run: yarn
      - run: yarn build:site
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.ACCESS_TOKEN }}
          publish_dir: ./doc-site
```

#### 三：编译打包

需要做如下事情：
```
1）导出类型声明文件；
2）导出 UMD/CommonJS module / ES module 等3种形式产物供使用者引入；
3）支持样式文件 css 引入，而不仅仅是 less。
4）支持按需加载
```
#### 3.1）导出类型声明文件

我们可以生成类型声明文件，在 package.json 中定义入口，package.json 代码如下：
```
{
  "typings": "lib/index.d.ts", // 定义类型入口文件
  "scripts": {
    "build:types": "tsc -p tsconfig.build.json && cpr lib esm" // 执行tsc命令生成类型声明文件
  }
}
```
因此我们需要安装 cpr ， 如下命令：
```
yarn add cpr -D
```
如上是使用 cpr 将 lib 的声明文件拷贝了一份，并将文件夹重命名为 esm，用于后面存放 ES module 形式的组件。

#### tsconfig.build.json
```
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "emitDeclarationOnly": true }, // 只生成声明文件
  "exclude": ["**/__tests__/**", "**/demo/**", "node_modules", "lib", "esm"] // 排除示例、测试以及打包好的文件夹
}
```
当我们执行 yarn build:types 命令时，根目录下会生成 lib 文件夹 (tsconfig.json 中定义的 declarationDir 字段) 及 esm 文件夹拷贝过来的。目录结构
和 src 文件夹保持一致。
```
yarn build:types
```
然后在项目的根目录会生成 lib 文件夹。如下结构：
```
|---lib
| |--- index.d.ts
| |--- alert
| | |--- index.d.ts
| | |--- style
| | | |--- index.d.ts
```
接下来我们需要将 ts(x) 等文件处理成 js 文件。

#### 导出 Commonjs 模块

#### babel 配置

首先安装babel及其相关依赖：
```
yarn add @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-proposal-class-properties  @babel/plugin-transform-runtime --dev

yarn add @babel/runtime
```
再在项目的根目录下 新建 .babelrc.js 文件，写入如下配置代码：
```
module.exports = {
  presets: ['@babel/env', '@babel/typescript', '@babel/react'],
  plugins: ['@babel/plugin-transform-runtime', '@babel/proposal-class-properties'],
};
```
#### 配置目标环境

为了避免转译浏览器原生支持的语法，新建 .browserslistrc文件, 根据适配的要求，写入支持浏览器范围，作用于@babel/preset-env。

.browserslistrc 文件代码如下：
```
>0.2%
not dead
not op_mini all
```
#### gulp 配置

安装gulp相关的依赖 
```
yarn add gulp gulp-babel --dev
```
在项目的根目录下新建 gulpfile.js 文件，写入以下内容：
```
const gulp = require('gulp');
const babel = require('gulp-babel');

const paths = {
  dest: {
    lib: 'lib', // commonjs 文件存放的目录名 - 本块关注
    esm: 'esm', // ES module 文件存放的目录名 - 暂时不关心
    dist: 'dist', // umd文件存放的目录名 - 暂时不关心
  },
  styles: 'src/**/*.less', // 样式文件路径 - 暂时不关心
  scripts: ['src/**/*.{ts,tsx}', '!src/**/demo/*.{ts,tsx}'], // 脚本文件路径
};

function compileCJS() {
  const { dest, scripts } = paths;
  return gulp
    .src(scripts)
    .pipe(babel()) // 使用gulp-babel处理
    .pipe(gulp.dest(dest.lib));
}

// 并行任务 后续加入样式处理 可以并行处理
const build = gulp.parallel(compileCJS);

exports.build = build;

exports.default = build;
```
package.json 改为如下：
```
{
  - "main": "index.js",
  + "main": "lib/index.js",
    "scripts": {
      ...
      "clean": "rimraf lib esm dist",
      "build": "npm run clean && npm run build:types && gulp",
    }
}
```
当我们运行 yarn build 命令，就会得到如下内容：
```
|--- lib
| |--- alert
| | |--- style
| | | |--- index.js
| | | |--- index.d.ts
| | |--- index.js
| | |--- index.d.ts
| |--- index.js
| |--- index.d.ts
```
#### 导出 ES module

生成 ES module 可以更好的进行 tree shaking。因此我们的babel配置改成如下：

1）配置 @babel/preset-env 的 modules 选项为 false，关闭模块转换。
2）配置 @babel/plugin-transform-runtime的 useESModules 选项为true， 使用 ES module 形式引入helper函数。

#### .babelrc.js 配置如下：
```
module.exports = {
  presets: ['@babel/env', '@babel/typescript', '@babel/react'],
  plugins: ['@babel/plugin-transform-runtime', '@babel/proposal-class-properties'],
  // 使用环境变量来区分 esm 和 cjs (执行任务时设置对应的环境变量即可)
  env: {
    esm: {
      presets: [
        [
          '@babel/env',
          {
            modules: false,
          }
        ],
      ],
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            useESModules: true,
          },
        ]
      ]
    }
  }
};
```
然后我们需要修改 gulp 相关的配置，抽离 compileScripts 任务， 增加 compileESM 的任务。

#### gulpfile.js 配置更新如下：
```
const gulp = require('gulp');
const babel = require('gulp-babel');

const paths = {
  dest: {
    lib: 'lib', // commonjs 文件存放的目录名 - 本块关注
    esm: 'esm', // ES module 文件存放的目录名 - 暂时不关心
    dist: 'dist', // umd文件存放的目录名 - 暂时不关心
  },
  styles: 'src/**/*.less', // 样式文件路径 - 暂时不关心
  scripts: ['src/**/*.{ts,tsx}', '!src/**/demo/*.{ts,tsx}'], // 脚本文件路径
};

/**
 * 编译脚本文件
 * @param { string } babelEnv babel 环境变量
 * @param { string } destDir 目标目录
 */
function compileScripts(babelEnv, destDir) {
  const { scripts } = paths;
  // 设置环境变量
  process.env.BABEL_ENV = babelEnv;
  return gulp
    .src(scripts)
    .pipe(babel()) // 使用gulp-babel处理
    .pipe(gulp.dest(destDir));
}

/**
 * 编译cjs
 */
function compileCJS() {
  const { dest } = paths;
  return compileScripts('cjs', dest.lib);
}

/**
 * 编译 esm
 */
function compileESM() {
  const { dest } = paths;
  return compileScripts('esm', dest.esm);
}

// 串行执行编译脚本任务 (cjs, esm) 避免环境变量影响
const buildScripts = gulp.series(compileCJS, compileESM);

// 整体并行执行任务
const build = gulp.parallel(buildScripts);

exports.build = build;

exports.default = build;
```
在项目的根目录下 执行 yarn build, 可以发现生成了 lib/esm 两个文件夹， esm目录结构和lib结构一致。js文件都是以 ES module 模块形式导入导出。

如下效果：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/7.png"/>

我们可以来对比下代码：

#### esm/alert/index.js 代码如下：
```
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["kind"];
import React from 'react';
import t from 'prop-types';
var prefixCls = 'happy-alert';
var kinds = {
  info: '#5352ED',
  positive: '#2ED573',
  negative: '#FF4757',
  warning: '#FFA502'
};

var Alert = function Alert(_ref) {
  var _ref$kind = _ref.kind,
      kind = _ref$kind === void 0 ? 'info' : _ref$kind,
      rest = _objectWithoutProperties(_ref, _excluded);

  return /*#__PURE__*/React.createElement("div", _extends({
    className: prefixCls,
    style: {
      background: kinds[kind]
    }
  }, rest));
};

Alert.propTypes = {
  kind: t.oneOf(['info', 'positive', 'negative', 'warning'])
};
export default Alert;
```
#### lib/alert/index.js 代码如下：
```
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _excluded = ["kind"];
var prefixCls = 'happy-alert';
var kinds = {
  info: '#5352ED',
  positive: '#2ED573',
  negative: '#FF4757',
  warning: '#FFA502'
};

var Alert = function Alert(_ref) {
  var _ref$kind = _ref.kind,
      kind = _ref$kind === void 0 ? 'info' : _ref$kind,
      rest = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    className: prefixCls,
    style: {
      background: kinds[kind]
    }
  }, rest));
};

Alert.propTypes = {
  kind: _propTypes.default.oneOf(['info', 'positive', 'negative', 'warning'])
};
var _default = Alert;
exports.default = _default;
```
#### package.json 添加入口

最后我们需要给 package.json 增加入口，
```
{
  "module": "esm/index.js"
}
```
#### 处理样式文件

##### 拷贝 less 文件

我们会将less文件包含在npm包中，用户可以通过 r-component-ui/lib/alert/style/index.js 的形式按需引入 less 文件。 我们也可以直接将less文件拷贝至目标文件夹中。

在 gulpfile.js 中新建 copyLess 任务。

##### gulpfile.js
```
// ....

/**
 * 拷贝less文件
 */
function copyLess() {
  return gulp.src(paths.styles).pipe(gulp.dest(paths.dest.lib)).pipe(gulp.dest(paths.dest.esm));
}

const build = gulp.parallel(buildScripts, copyLess);

// ....
```
我们接着 再执行 yarn build 命令 生成 esm 和 lib 目录， 我们可以发现 less 文件 被拷贝到 alert/style 目录下了。 如下图所示：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/8.png"/>

如上我们的组件生成了less文件，但是如果我们的项目并没有使用less预处理器，而是使用了sass预处理器或styuls预处理器的话，那么我们在项目中直接引入less样式是会报错的。因此我们需要有方案去解决该问题。

一般有如下几种方案解决：
```
1）告知使用方 项目增加 less-loader，但是这样做的话 会导致使用成本增加。
2）打包出一份完成的css文件，进行全量引入。但是缺点是：无法进行按需引入。
3）css in js 方案。
4）提供一份 style/css.js 文件，引入组件css样式依赖，而非less 依赖。组件库底层抹平差异。
```
我们可以来看下第三种和第四种方案，

第三种方案 css in js 方案使用的是 styled-components，请看 <a href="">css in js 这篇文章</a>

缺点：
```
1）样式无法单独缓存。
2）styled-components 自身体积比较大
3）复写组件样式需要使用属性选择器或使用 styled-components 自带方法。
```
第四种方案，antd也是使用这种方案。

就是在我们组件下生成 alert/style/index.js 引入less文件 ，且 打包组件后在 alert/style.css 文件。这样做的目的是 管理样式依赖。

因为我们的组件是没有引入样式文件的，需要我们手动去引入。比如当我们引入 <Button />组件，<Button /> 依赖了 <Icon />组件，我们就需要手动引入<Button />组件的样式，且还需要手动引入  <Icon />组件的样式，如果我们遇到复杂的组件就比较麻烦，因此我们开发组件库的人就需要提供这样一份js文件。当我们使用者手动引入该
js组件库的时候，我们就应该自动引入对应的样式文件。

因此它的优点是：
```
1）减轻使用者的使用成本。
2）保障组件库的开发体验。
```
因此我们需要在组件，比如 alert/style 目录下 提供一份 css.js文件，引入的组件是css样式文件的依赖。

#### 生成css文件

安装相关的依赖：
```
yarn add gulp-less gulp-autoprefixer gulp-cssnano --dev
```
将less文件生成对应的css的文件，在 gulpfile.js 中增加 less2css 任务。
```
// ....

const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');

// .....

/**
 * 生成css文件
 */

function less2css() {
  return gulp
    .src(paths.styles)
    .pipe(less()) // 处理less文件
    .pipe(autoprefixer()) // 根据browserslistrc增加前缀
    .pipe(cssnano({ zindex: false, reduceIdents: false })) // 压缩
    .pipe(gulp.dest(paths.dest.lib))
    .pipe(gulp.dest(paths.dest.esm));
}

const build = gulp.parallel(buildScripts, copyLess, less2css);

// .....
```
然后我们再执行 yarn build 命令后，我们的组件 style 目录已经存在css文件了， 如下所示：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/9.png"/>

接下来我们需要一个alert/style/css.js来帮用户引入css文件。

#### 生成 css.js

在处理 scripts 任务中，截住 style/index.js, 生成 style/css.js ， 并且通过正则引入的 less 文件 后缀改成css文件。

安装相关的依赖如下：
```
yarn add through2 --dev
```
##### gulpfile.js 配置代码所有的如下：
```
const gulp = require('gulp');
const babel = require('gulp-babel');

const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const through2 = require('through2');

const paths = {
  dest: {
    lib: 'lib', // commonjs 文件存放的目录名 - 本块关注
    esm: 'esm', // ES module 文件存放的目录名 - 暂时不关心
    dist: 'dist', // umd文件存放的目录名 - 暂时不关心
  },
  styles: 'src/**/*.less', // 样式文件路径 - 暂时不关心
  scripts: ['src/**/*.{ts,tsx}', '!src/**/demo/*.{ts,tsx}'], // 脚本文件路径
};

/**
 * 当前组件样式 import './index.less' => import './index.css'
 * 依赖的其他组件样式 import '../test-comp/style' => import '../test-comp/style/css.js'
 * 依赖的其他组件样式 import '../test-comp/style/index.js' => import '../test-comp/style/css.js'
 * @param {string} content
 */
 function cssInjection(content) {
  return content
    .replace(/\/style\/?'/g, "/style/css'")
    .replace(/\/style\/?"/g, '/style/css"')
    .replace(/\.less/g, '.css');
}

/**
 * 编译脚本文件
 * @param { string } babelEnv babel 环境变量
 * @param { string } destDir 目标目录
 */
function compileScripts(babelEnv, destDir) {
  const { scripts } = paths;
  // 设置环境变量
  process.env.BABEL_ENV = babelEnv;
  return gulp
    .src(scripts)
    .pipe(babel()) // 使用gulp-babel处理
    .pipe(
      through2.obj(function z(file, encoding, next) {
        this.push(file.clone());
        // 找到目标
        if (file.path.match(/(\/|\\)style(\/|\\)index\.js/)) {
          const content = file.contents.toString(encoding);
          file.contents = Buffer.from(cssInjection(content)); // 文件内容处理
          file.path = file.path.replace(/index\.js/, 'css.js'); // 文件重命名
          this.push(file); // 新增该文件
          next();
        } else {
          next();
        }
      })
    )
    .pipe(gulp.dest(destDir));
}

/**
 * 编译cjs
 */
function compileCJS() {
  const { dest } = paths;
  return compileScripts('cjs', dest.lib);
}

/**
 * 编译 esm
 */
function compileESM() {
  const { dest } = paths;
  return compileScripts('esm', dest.esm);
}

/**
 * 拷贝less文件
 */
function copyLess() {
  return gulp.src(paths.styles).pipe(gulp.dest(paths.dest.lib)).pipe(gulp.dest(paths.dest.esm));
}

/**
 * 生成css文件
 */

function less2css() {
  return gulp
    .src(paths.styles)
    .pipe(less()) // 处理less文件
    .pipe(autoprefixer()) // 根据browserslistrc增加前缀
    .pipe(cssnano({ zindex: false, reduceIdents: false })) // 压缩
    .pipe(gulp.dest(paths.dest.lib))
    .pipe(gulp.dest(paths.dest.esm));
}

// 串行执行编译脚本任务 (cjs, esm) 避免环境变量影响
const buildScripts = gulp.series(compileCJS, compileESM);

// 整体并行执行任务
const build = gulp.parallel(buildScripts, copyLess, less2css);

exports.build = build;

exports.default = build;
```
因此我们在执行 yarn build 进行打包后，可以看见组件 style 目录下生成了 css.js 文件，如下所示：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/10.png"/>

#### 按需加载

我们可以借助 babel-plugin-import  插件来实现按需加载，我们可以演示下，将组件映射到本地库，在我们的组件的项目根目录下执行：
```
yarn link
```
运行完成后，在 yarn 的link文件夹下会有一个文件的快捷键映射。

2）我们新建一个项目，比如叫 react-demo
```
使用命令：npx create-react-app react-demo
```
react-demo 下载完成后，在该项目下根目录执行：
```
yarn link r-component-ui
```
3) 安装 babel-plugin-import 依赖，命令如下：
```
npm install babel-plugin-import -D
```
4）配置 .babelrc

在react-demo项目的根目录下新建 .babelrc 文件，添加如下配置：
```
{
  "plugins": [
    ["import", { 
      "libraryName": "r-component-ui",
      "libraryDirectory": "lib",  // libraryDirectory 默认为 lib
      "style": "css"
    }]
  ]
}
```
5） 调用

在 react-demo/src/App.js 文件下引入 组件 r-component-ui
```
import { Alert } from 'r-component-ui';

console.log('---Alert---', Alert);

// ....

<Alert /> // 调用组件

// ....
```
如下，可以看到我们的组件被引用到了 ，如下所示：

<img src="https://raw.githubusercontent.com/kongzhi0707/r-component-ui/master/images/11.png"/>















