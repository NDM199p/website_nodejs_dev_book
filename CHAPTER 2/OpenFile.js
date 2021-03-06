var http = require('http'),
    fs = require('fs');

function serverStaticFile(res, path, contentType, responseCode)
{
    if(!responseCode) responseCode = 200;
    fs.readFile(__dirname + path, function(err, data)
    {
        if(err)
        {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('500 - Internal Error');
        }
        else
        {
            res.writeHead( responseCode,  {'Content-Type': contentType});
            res.end(data);
        }
    });
}


http.createServer(function(req, res)
{
    var path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();
    switch(path)
    {
        case '':
            serverStaticFile(res, '/public/home.html', 'text/html');
            break;
        case '/about':
            serverStaticFile(res, '/public/about.html', 'text/html');
            break;

        case '/img/retouch.jpg':
            serverStaticFile(res, '/public/img/retouch.jpg', 'image/jpeg');
            break;

        default:
            serverStaticFile(res, '/public/404.html', 'text/html');
            break;
    }
}).listen(3000);