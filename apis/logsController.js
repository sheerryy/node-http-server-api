const { getLogs, getLogsText} = require('../services');

exports.logsController = logsController = async (req, res) => {
    const requestUrl = req.url.split('?');
    let controllerUrl = requestUrl[0].split('/');
    controllerUrl[2] = controllerUrl[2] ? controllerUrl[2] : '';

    // Second Level router
    switch (controllerUrl[2]) {
        case '':
            if (req.method === 'GET') {
                await getLogs(req, res);
            }
            break;
        case 'text':
            if (req.method === 'GET') {
                await getLogsText(req, res);
            }
            break;
        default:
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.write('Requested url not found.');
            res.end();
    }
};
