var express = require('express');
var http = require('http');
// ghi nhat ky
var morgan = require('morgan');
// logger
var express_logger = require('express-logger');
var app = express();

var fortune = require('./lib/fortune');


var handlebars = require('express-handlebars').create(
    { 
        defaultLayout: 'main',
        helpers: 
        {
            section: function(name, options)
            {
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });

// Mail
var nodemailer = require('nodemailer');
const credentials = require('./credentials');

// All Mail
// var mailTransport = nodemailer.createTransport('SMTP',
// {
//     host: 'smtp.meadowlarktravel.com',
//     secureConnection: true,         
//     // use SSL
//     port: 465,
//     auth: 
//     {
//         user: credentials.meadowlarkSmtp.user,
//         pass: credentials.meadowlarkSmtp.password,
//     }
// });

var mailTransport = nodemailer.createTransport(
{
    service: 'Gmail',
    auth: {
        user: 'nmy.qw.qa.qz@gmail.com',
        pass: '0123546800'
    }
})

app.use(function(req,res,next)
{
    var cluster = require('cluster');
    if(cluster.isWorker) 
    console.log('Worker %d received request',cluster.worker.id);
    next();
});

app.use(function(req, res, next)
{
    var domain = require('domain').create();
    domain.on('error', function(err)
    {
        console.error('DOMAIN ERROR CAUGHT\n' , err.stack);
        try{
            setTimeout(function()
            {
                console.error('Failsafe shutdown.')
            }, 5000);
            var worker = require('cluster').worker;
            if(worker) worker.disconnect();

            server.close();

            try {
                next(err);
            } catch (error) {
                console.error('Express error mechanism failed.\n', error.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }

        }catch(error)
        {
            console.error('Unable to send 500 response.\n', error.stack);
        }

    });
    domain.add(req);
    domain.add(res);
    domain.run(next);
})

app.use(express.static(__dirname + '/public'));

// loggin
switch(app.get('env'))
{
    case 'development':
        app.use(morgan('dev'));
        break;
    case 'production':
        app.use(express_logger(
            {
                path: __dirname + '/log/requests.log'
            }
        )); 
        break;
}

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// page test
app.use((req, res, next) =>
{
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

// cross page testing
app.get('/tours/hood-river', (req, res) =>
{
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', (req, res) =>
{
    res.render('tours/request-group-rate');
});

// ---------------
app.get('/', (req, res) =>
{
    // res.render('home');
    res.send(app.get('env'));
    console.log(app.get('env'));
});

app.get('/about', (req, res) =>
{
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

app.get('/send-email', function(req, res)
{
    mailTransport.sendMail(
        {
            from: 'nmy.qw.qa.qz@gmail.com',
            to:'nguyenmy0147258369@gmail.com',
            subject: 'Your Meadowlark Travel Tour',
            text: 'Thank you for booking your trip with Meadowlark Travel. We look forward to visit!'
        }, function(err)
        {
            if(err) console.error('Unable to send email: ' + err);
        }
    )
    res.send('Thank you')
})

app.use( (req, res) =>
{
    res.status(404);
    res.render('404');
});

app.use( (req, res) =>
{
    res.status(500);
    res.render('500');
});

// app.listen(app.get('port'), ()=>
// {
//     console.log('Server Start.........');
//     console.log( 'Express started in ' + app.get('env') +' mode on http://localhost:' + app.get('port') +'; press Ctrl-C to terminate.' );

// });

function startServer()
{
    server = http.createServer(app).listen(app.get('port'), function()
    {
        console.log( 'Express started in ' + app.get('env') +' mode on http://localhost:' + app.get('port') +'; press Ctrl-C to terminate.' );
    })
}

if(require.main === module)
{
    startServer();
}
else
{
    module.exports = startServer;
}

// http.createServer(app).listen(app.get('port'), function()
// {    
//     console.log( 'Express started in ' + app.get('env') +' mode on http://localhost:' + app.get('port') +'; press Ctrl-C to terminate.' );
// });

// run product powwersell
// $env:NODE_ENV="production"
