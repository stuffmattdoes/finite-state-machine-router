const path = require('path');
// const webpack = require('webpack');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.js'),
    mode: 'production',
    module: {
        rules: [
            // Resolves & bundles all Javascript dependencies (.js and .jsx)
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [ '@babel/preset-env', '@babel/preset-react' ]
                }
            }
        ]
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'fsm-router',
        // libraryTarget: 'umd'
    },
    resolve: {
        extensions: [ '.js', '.jsx' ],
    }
};
