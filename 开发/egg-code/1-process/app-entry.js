console.log('in app process', process.argv[2]);
const App = require('./App')

new App(process.argv[2]);

setTimeout(() => {
    process.send({
        action: 'app-start',
    });
}, 2000);