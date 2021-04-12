var express = require('express');
const { cookiesSecret } = require('./credentials');
const credentials = require('./credentials');
var app = express();

// body-parse
app.use(require('body-parser')());

// cookie-parse
app.use(require('cookie-parser')(credentials.cookiesSecret))
// express-session
app.use(require('express-session')());

var handlebars = require('express-handlebars').create({
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
})

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

app.use(function(req, res, next)
{
    // if(!res.locals.partials) res.locals.partials = {};
    res.locals.weather = getWeatherData();
    next();
})

app.use(function(req, res, next)
{
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
})

app.get('/', function(req, res){
    res.render('home');
    res.cookie('cookieSecret', cookiesSecret);
})

app.get('/cookies', function(req, res){
    res.json(req.cookies);
})


// 
function NewsletterSignup()
{
    this.save = function(cb)
    {
        cb();
    }
}

// 
app.get('/newsletter', function(req, res)
{
    res.render('newsletter');
})

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.post('/newsletter', function(req, res)
{
    var name = req.body.name || '', email = req.body.email || '';
    if(!email.match(VALID_EMAIL_REGEX))
    {
        if(req.xhr) return res.json({ error: 'Invalid name email address.'});
        req.session.flash = 
        {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you antered was not valid.'
        }
        return res.redirect(303, '/newsletter/archive');
    }
    console.log(1);

    new NewsletterSignup({ name: name, email: email}).save(function(err)
    {
        if(err)
        {
            if(req.xhr) return res.json({ err: 'Datebase error.'});
            req.session.flash = 
            {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later.'
            }
            return res.redirect(303, '/newsletter/archive');

        }

        console.log(2);
        if(req.xhr) return res.json({ success: true});
        req.session.flash = 
        {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter.'
        };
        return res.redirect(303, '/newsletter/archive');
    })
})

app.use(function(req, res)
{
    res.status(404).render('404');
})

app.use(function(req, res)
{
    res.status(500).render('500');
})

app.listen(app.get('port'), function()
{
    console.log('server start.')
})