const { fork } = require('child_process');
const path = require('path');

class Master {
    constructor() {
        this.forkAgent();
    }

    forkAgent() {
        this.agent = fork(path.join(__dirname, './agent-entry.js'));
    }
}

new Master();
