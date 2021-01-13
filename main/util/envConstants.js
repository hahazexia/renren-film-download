
const windowConstants = {
    mainWindowUrl: process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}/main.html` : `file://${__dirname}/main.html`
}

export {
    windowConstants
}