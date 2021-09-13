const path = require('path');

module.exports = {
    mode: 'development',
    entry: path.join(__dirname, './src/index.js'),
    output: {
        filename: '.js',
        path: __dirname + '/dist',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: [path.join(__dirname, './babel-plugin-imports.js')]
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        clientLogLevel: 'none',
        noInfo: true
    }
}
