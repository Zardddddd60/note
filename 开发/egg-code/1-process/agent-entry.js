console.log('agent start');

process.on('SIGINT', () => {
    console.log('agent receice SIGINT');
    setTimeout(() => {
        // agent可以处理一些自己的事情，再真正退出；
        process.exit(0);
    }, 5000);
});

// 引入业务功能，并调用；
const Agent = require('./Agent.js');
new Agent();

setTimeout(() => {
   // 经过一段时间的初始化过程，通过IPC的方式给master发消息 
   process.send({
       action: 'agent-start'
   });
}, 2000);
