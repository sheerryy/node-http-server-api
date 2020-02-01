exports.badRequestResponse = badRequestResponse = (res) => {
    res.writeHead(400, {'Content-Type': 'text/html'});
    res.write('Bad Request');
    res.end();
};