// const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        // compress: true,
        hot: true,
        // open: true,
        port: 9000
    },
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, 'src', 'index.jsx'),
    mode: 'development',
    module: {
        rules: [
            // Resolves & bundles all Javascript dependencies (.js and .jsx)
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                // include: [
                //     path.resolve(__dirname, 'node_modules', 'fsm-router'),
                //     path.resolve(__dirname, 'src')
                // ],
                loader: 'babel-loader',
                options: {
                    presets: [ '@babel/preset-env', '@babel/preset-react' ]
                }
            }
            // {
            //     test: /\.(sa|sc|c)ss$/,
            //     use: [
            //         'style-loader',
            //         'css-loader',
            //         {
            //             loader: 'postcss-loader',
            //             options: {
            //                 ident: 'postcss',
            //                 plugins: [
            //                     autoprefixer({
            //                         flexbox:'no-2009',
            //                         grid: true
            //                     })
            //                 ]
            //             }
            //         },
            //         {
            //             loader: 'sass-loader',
            //             options: {
            //                 includePaths: glob.sync('node_modules').map((d) => path.join(__dirname, d))
            //             }
            //         }
            //     ]
            // }
        ]
    },
    output: {
        filename: '[name]-[hash].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public', 'index.html'),
            title: 'Finite State Machine Router Example'
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        extensions: [ '.js', '.jsx' ],
    }
};