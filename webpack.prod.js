const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.js'),
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: [
                    {
                        loader: 'ts-loader',
                        // options: {
                        //     configFile: path.resolve('config', 'ts.config.json'),
                        //     transpileOnly: true
                        // },
                    },
                ],
            },
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
        library: 'FSMRouter',
        libraryTarget: 'umd',
        publicPath: '/dist/'
    },
    externals: {
        'react': {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react',
        },
        'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd: 'react-dom',
        }
    },
    resolve: {
        extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
    }
};
