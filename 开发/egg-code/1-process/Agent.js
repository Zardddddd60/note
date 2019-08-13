// Agent.js 具体业务实现
module.exports = class Agent {
    constructor() {
        require('http').createServer((req, res) => {
            res.end('from agent!');
        }).listen(6060, () => {
            console.log('agent listening....');
        });
    }
};