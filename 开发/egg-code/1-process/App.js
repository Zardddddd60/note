module.exports = class Agent {
    constructor(id) {
        require('http').createServer((req, res) => {
            res.end('from app!');
            if (res.path.indexOf('favicon.icon') !== -1) {
                throw new Error('app error');
            }
        }).listen(7188, () => {
            console.log(`app-${id} listening....`);
        });
    }
};