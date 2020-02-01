const http = require('http');
const { logsController } = require('./apis');

const PORT = 80;

http.createServer(async (req, res) => {
    const requestUrl = req.url.split('?');
    const controllerUrl = requestUrl[0].split('/');

    // First Level router
    switch(controllerUrl[1]) {
        case 'logs':
            await logsController(req, res);
            break;
        case 'test':
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('test');
            res.end();
            break;
        default:
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.write('Requested url not found.');
            res.end();
    }
}).listen(PORT);
console.log(`server is running on port ${PORT}`);