var express = require('express');
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

app.use(express.static(__dirname + '/public'));

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
    res.render('home');
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
            from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
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

app.listen(app.get('port'), ()=>
{
    console.log('Server Start.........');
});