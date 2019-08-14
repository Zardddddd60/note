module.exports = class Agent {
    constructor(id) {
        require('http').createServer((req, res) => {
            res.end('from app!');
            console.log(req.url);
            if (req.url.indexOf('favicon.ico') !== -1) {
                throw new Error('app error');
            }
        }).listen(7188, () => {
            console.log(`app-${id} listening....`);
        });
    }
};