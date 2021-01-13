const path = require('path')

module.exports = {
    publicPath: './',
    outputDir: 'app',
    lintOnSave: false,
    pages: {
        main: {
            entry: path.join(__dirname, 'src/main.js'),
            template: './public/main.html',
            filename: 'main.html',
            title: 'main',
            chunks: ['chunk-common', 'chunk-vendors', 'main']
        }
    }
}