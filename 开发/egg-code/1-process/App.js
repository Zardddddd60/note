module.exports = class Agent {
    constructor(id) {
        require('http').createServer((req, res) => {
            res.end('from app!');
        }).listen(7188, () => {
            console.log(`app-${id} listening....`);
        });
    }
};