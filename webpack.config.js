const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const filename = './index.html' //path.resolve(__dirname, 'index.html')

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.js',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: filename,  //打包后的html存放路径，也是从distPath开始
            template: './template/index.html', //文件模板，就是打包前的html文件
            inject: true, //可以对head和body做修改
            minify: { //压缩HTML
                removeComments: true,
                collapseWhitespace: false
            },
            chunks: ['index'],
            hash: false, //版本号，打出来的html中对css和js的引用自带版本号
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [path.resolve(__dirname, './babel-plugin-imports.js')]
                    }
                }
            }
        ]
    },
    resolve:{
        modules: [
            path.resolve(__dirname, './src'),
        ]
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './',
        noInfo: true
    },

};