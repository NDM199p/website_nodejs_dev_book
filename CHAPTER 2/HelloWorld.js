var http = require('http');

http.createServer(function(request, response){

    //  routing
    var path = request.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();
    console.log(path);
    switch(path)
    {
        case '':
            response.writeHead( 200, {'Content-Type': 'text/plain'});
            response.end('Hello World!');
            break;
        case '/about':
            response.writeHead( 200, {'Content-Type': 'text/plain'});
            response.end('About');
            break;
        default:
            response.writeHead( 404, {'Content-Type': 'text/plain'});
            response.end('Not found');
            break;
    }
    // response.writeHead( 200, {'Content-Type': 'text.plain'});
    // response.end('Hello World!');

}).listen(3000);

console.log('Server start...........');