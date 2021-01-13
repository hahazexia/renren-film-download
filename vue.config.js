const path = require('path')

module.exports = {
    publicPath: './',
    lintOnSave: false,
    configureWebpack: {
        target: 'electron-renderer',
    },
    pages: {
        main: {
            entry: path.join(__dirname, 'src/main.js'),
            template: './public/main.html',
            filename: 'main.html',
            title: 'main',
            chunks: ['chunk-common', 'chunk-vendors', 'main']
        }
    },
    pluginOptions: {
        electronBuilder: {
            chainWebpackMainProcess: (config) => {
                config.module
                    .rule('node')
                    .test(/\.node$/)
                    .use('node-loader')
                    .loader('node-loader')
                    .end();
            },
            nodeModulesPath: ['./node_modules'],
            mainProcessFile: './main/index.js'
        }
    }
}
