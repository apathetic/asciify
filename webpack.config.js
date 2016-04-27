var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        ascii: './src/demo.js'
    },

    output: {
        path: 'demo/js',
        filename: '[name].js'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    },

    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            compress: {
                warnings: false
            }
        })
    ]
};

