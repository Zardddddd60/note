const { fork } = require('child_process');
const path = require('path');

class Master {
    constructor() {
        this.forkAgent();
    }

    forkAgent() {
        this.agent = fork(path.join(__dirname, './agent-entry.js'));
        // 添加对agent进程exit事件的监听
        this.agent.once('exit', () => {
            console.log('fork a new agent...');
            this.forkAgent();
        });
    }
}

new Master();