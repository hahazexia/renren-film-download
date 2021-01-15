module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ["import", { "libraryName": "ant-design-vue", "libraryDirectory": "es", "style": true }, "@babel/plugin-syntax-dynamic-import"],
    ["@babel/plugin-proposal-optional-chaining"]
  ]
}
