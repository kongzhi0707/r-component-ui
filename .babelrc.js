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

