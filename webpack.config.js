const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");
// const { ESBuildPlugin } = require('esbuild-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, './src/index.js'),
    output: {
        clean: true,
        path: path.resolve(__dirname, "dist"),
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env', '@babel/preset-react'
                            ],
                            plugins: [
                                [
                                    "@babel/plugin-transform-runtime", {
                                        "corejs": 3
                                    }
                                ],
                                ["import", {
                                    "libraryName": "antd",
                                    "libraryDirectory": "es",
                                    "style": "css"
                                }]
                            ]
                        }
                        // loader: 'esbuild-loader',
                        // options: {
                        //     loader: 'jsx',
                        //     target: 'es2015'
                        // }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,//style-loader
                    'css-loader',
                    //增加前缀，处理浏览器兼容性
                    // {
                    //     loader: 'postcss-loader',
                    //     options: {
                    //         postcssOptions: {
                    //             plugins: [
                    //                 'postcss-preset-env'
                    //             ]
                    //         }
                    //     },
                    // }
                ]
            },
        ]
    },
    plugins: [
        // new BundleAnalyzerPlugin({
        //     analyzerMode: "server",
        //     analyzerHost: "127.0.0.1",
        //     analyzerPort: 8080,
        //     reportFilename: "index.html",
        //     openAnalyzer: true,
        //     generateStatsFile: false,
        //     statsOptions: null,
        //     logLevel: "info"
        // })
        new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, './dist/index.html'),
            template: path.resolve(__dirname, './index.html'), //文件模板，就是打包前的html文件
            inject: true, //可以对head和body做修改
            chunksSortMode: 'manual',
            minify: { //压缩HTML
                removeComments: true,
                collapseWhitespace: false
            },
            hash: false,
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin({
                parallel: true
            }),
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
                parallel: true,
                minify: TerserPlugin.esbuildMinify,
            })
        ],
        splitChunks: {
            cacheGroups: {
                defaultVendors: {
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors'
                }
            }
        }
    },
}
