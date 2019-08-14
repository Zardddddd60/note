console.log('in app process', process.argv[2], `processid: ${process.pid}`);
const App = require('./App')

process.on('SIGINT', () => {
    console.log('app receice SIGINT');
    setTimeout(() => {
        // app处理一些善后工作，假设善后工作话费10s
        process.exit(0);
    }, 10000);
});

new App(process.argv[2]);

setTimeout(() => {
    process.send({
        action: 'app-start',
    });
}, 2000);
