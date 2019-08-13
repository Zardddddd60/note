const { fork } = require('child_process');
const path = require('path');
const cluster = require('cluster');

class Master {
    constructor() {
        this.forkAgent();
    }

    forkAgent() {
        this.agent = fork(path.join(__dirname, './agent-entry.js'));
        // 添加对agent进程exit事件的监听
        this.agent.once('exit', () => {
            this.agent.status !== 'closed' && this.forkAgent() && console.log('fork a new agent...');
        });
        this.agent.on('message', ({ action }) => {
            if (action === 'agent-start') {
                // 防止agent重启时又重启app
                !this.allWorkerForker && this.forkApp(2);
            }
        });
        this.addListeners();
    }

    forkApp(count = 2) {
        console.log(`开始fork${count}个app进程`);
        for (let i = 0; i < count; i++) {
            cluster.settings = {
                exec: path.join(__dirname, './app-entry.js'),
                args: [i],
            };
            cluster.fork();
        }

        cluster.on('fork', worker => {
            this.appWorkers = this.appWorkers || [];
            this.appWorkers.push(worker);
            worker.on('message', ({ action }) => {
                if (action === 'app-start') {
                    this.startSuccess = this.startSuccess || 0;
                    this.startSuccess ++;
                    if (this.startSuccess === 2) {
                        console.log('all app forked');
                        this.allWorkerForker = true;
                        this.eggReady();
                    }
                }
            });
        });
    }

    eggReady() {
        console.log('系统真正提供服务，egg-ready');
    }

    addListeners() {
        // 还有'SIGTERM'，'SIGQUIT'
        process.on('SIGINT', this.handleSignal.bind(this));
        process.on('SIGTERM', this.handleSignal.bind(this));
    }

    handleSignal() {
        // 做标记，防止无限重启；
        this.agent.status = 'closed';
        this.agent.once('exit', () => {
            process.exit(0);
        });
    }
}

new Master();
