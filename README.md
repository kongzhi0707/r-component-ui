
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
    "resolveJsonModule": true
  },
  "include": ["src", "typings.d.ts"],
  "exclude": ["node_modules"]
}
```
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

如图1

当我们点击导航的组件，可以看到 Alert 组件对应的文档，如下图所示：

如图2

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

如图3

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

如图4

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

如图5

在我们的项目根目录下会生成 doc-site 文件夹。是因为我上面的 .umirc.ts 配置文件 outputPath 指定为 doc-site, 有对应的文件。如下：

如图6

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









