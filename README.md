# webpack-dev
探索webpack最佳实践

## 一、安装webpack5和babel7

安装初始环境依赖

```jsx
//package.json
"devDependencies": {
    "@babel/core": "^7.15.5",
    "@babel/preset-env": "^7.15.6",
    "babel-loader": "^8.2.2",
    "webpack": "^5.52.1",
    "webpack-cli": "^4.8.0"
 }
```

```jsx
//webpack.config.js
{
      test: /\.m?js$/,
      exclude: /node_modules/,
      use: [
          {
              loader: 'babel-loader',
              options: {
                  presets: ['@babel/preset-env']
              }
          }
      ]
  }
```

其中babel-loader可以让webpack打包时使用babel

@babel/preset-env 转换语法，譬如let、const、箭头函数，但不处理api调用

### 编译前

```jsx
const a = [1, 2, 3, 4]

a.map((item) => item + item)
```

### 编译后

```jsx
var a = [1, 2, 3, 4]

a.map(function(item){
   return item + item
})
```

可以看语法做了处理，但方法map的使用没有转译

### 配置@babel/preset-env中useBuiltIns实现es6方法支持

```jsx
[
      '@babel/preset-env', {
           "useBuiltIns": "usage",
           "corejs": 3
      }
  ]
```

结合.browserslistrc配置

```jsx
> 1%
last 10 versions
not ie <= 8
```

useBuiltIns:

- entry: 根据入口的引入，按照browserslistrc引入所需要的polyfill ; （import "core-js"）
- usage：根据代码中使用情况按需引入polyfill

缺点:

- 污染全局
- 打包忽略node_modules 时如果第三方包未转译则会出现兼容问题

### 使用@babel/runtime支持es6方法

这种方式会借助 helper function 来实现特性的兼容，并且利用 @babel/plugin-transform-runtime 插件还能以沙箱垫片的方式防止污染全局， 并抽离公共的 helper function , 以节省代码的冗余

```jsx
"plugins": [
    [ 
      "@babel/plugin-transform-runtime", {
        "corejs": 3
      }
    ]
  ]
```

@babel/runtime利用 corejs 3 也实现了各种内置对象的支持，并且依靠 @babel/plugin-transform-runtime 的能力，沙箱垫片和代码复用， 避免帮助函数重复 inject 过多的问题， 该方式的优点是不会污染全局， 适合在类库开发中使用。

### 打包用时

未使用@babel/plugin-transform-runtime引入polyfill，用时850ms；

增加polyfill后用时1050ms，体积也大大增加。

## 二、安装react

增加react预设

```jsx
 {
      loader: 'babel-loader',
      options: {
          presets: ['@babel/preset-env','@babel/preset-react']
      }
  }
```

引入react、react-dom

```jsx
import React from 'react';
import ReactDOM from 'react-dom'

function App() {
    return (
        <div>123</div>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('page-root')
);
```

### 分包

```jsx
optimization: {
        //minimize: false,
        splitChunks: {
            cacheGroups: {
                defaultVendors: {
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                    name:'vendors'
                }
            }
        }
    },
```

### 打包时间

- 不拆包 、压缩4200ms
- 不拆包、不压缩 1280ms
- 拆包 、压缩 4010ms
- 拆包、不压缩 1280ms

拆包对打包时间影响很小，压缩更影响打包时长

## 三、安装antd

测试v3和v4都默认支持基于 ES module 的 tree shaking

### 版本比较

- V3版本：icon全量引入了
- V4版本：icon分离成单独的包

两个版本各个组件的独立体积相差不大。

### 打包时间

- 不压缩：5051ms
- 压缩:8600ms

## 四、css独立打包、压缩、处理兼容

### 安装

```jsx
postcss
postcss-loader
postcss-preset-env
css-loader
mini-css-extract-plugin
css-minimizer-webpack-plugin
```

### 使用mini-css-extract-plugin独立打包css

```jsx
plugins: [
	 new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
]
//
module: {
	rules:[
			{
			    test: /\.css$/,
			    use: [
			        MiniCssExtractPlugin.loader,//style-loader
			        'css-loader'
			    ]
			}
	]
}
```

### 使用基于cssnano的插件css-minimizer-webpack-plugin压缩css

```jsx
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      new CssMinimizerPlugin()
    ],
  },
};
```

### PostCSS处理css兼容性

PostCSS，将css转译成抽象语法树，作用类似于babel

- postcss-preset-env 兼容性处理，类似es6转5
- `[postcss-modules](https://github.com/outpunk/postcss-modules)` 和 `[react-css-modules](https://github.com/gajus/react-css-modules)` 可以自动以组件为单位隔绝 CSS 选择器。
- `[postcss-autoreset](https://github.com/maximkoretskiy/postcss-autoreset)` 是全局样式重置的又一个选择，它更适用于分离的组件。

```jsx
{
      test: /\.css$/,
      use: [
          MiniCssExtractPlugin.loader,//style-loader
          'css-loader',
          //增加前缀，处理浏览器兼容性
          {
              loader: 'postcss-loader',
              options: {
                  postcssOptions: {
                      plugins: [
                          'postcss-preset-env'
                      ]
                  }
              },
          }
      ]
  },
```

## 五、优化打包时长

### js 压缩优化

webpack v5 开箱即带有最新版本的 terser-webpack-plugin。如果你使用的是 webpack v5 或更高版本，同时希望自定义配置，那么仍需要安装 terser-webpack-plugin

```jsx
const TerserPlugin = require("terser-webpack-plugin");
optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            test: /\.js(\?.*)?$/i,
            parallel:true,
						minify: TerserPlugin.esbuildMinify
        })],
}
```

webpack使用的默认打包工具是terser，但是奇怪的是当引用插件terser-webpack-plugin，走默认打包配置的时候打包时间会明显减少。

当使用esbuild将minify定义为TerserPlugin.esbuildMinify时，速度得到了极大的提升！(需要npm安装esbuild)

打包时间：

- 默认8600ms
- 自定义terser配置7800ms
- 使用esbuild配置5200ms
- uglify 时长不减反增

esbuild存在的问题：

- tree sharking是基于terser压缩工具的，一旦改为使用esbuild，则tree sharking失效导致包体积变大
- 压缩效率比terser要差。

### babel-loader优化

编译期间大部分的耗时其实都来自babel-loader

使用esbuild-loader替换babel-loader

```jsx
loader: 'esbuild-loader',
options: {
    loader: 'jsx',
    target: 'es2015'
}
```

存在的问题：

- 没有提供AST的操作能力，所以一些处理AST的plugin无法使用（如 babel-plugin-import）
