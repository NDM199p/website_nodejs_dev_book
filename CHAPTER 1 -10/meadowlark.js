var express = require('express');
var fortune = require('./lib/fortune');
var body_parser = require('body-parser');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var express_session = require('express-session');
var cookie_parser = require('cookie-parser');
var credentials = require('./credentials');
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
        },
        // extname: '.hbs'
    }
);

// 
var app = express();

//  
function NewsletterSignup()
{
    this.save = function(er)
    {
        er();
    }
}

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

var tours = [
    {
        id: 0,
        name: 'Hood Rive',
        price: 99.99
    },
    {
        id: 1,
        name: 'Oregon Coast',
        price: 149.99
    }
]

function getWeatherData()
{
    return {
        locations:   
        [
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
            }
        ]
    }
}


// set port
app.set('port', process.env.PORT || 3000);

// set handlebars
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// security
app.disable('x-powered-by');

// static file
app.use(express.static(__dirname + '/public'));

// test page
app.use(function(req, res, next)
{
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
})

// USE
app.use(body_parser());

app.use(cookie_parser(credentials.cookieSecret));

app.use(express_session());

app.use(function(req, res, next)
{
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
})

app.use('/upload', function(req, res, next)
{
    var now = Date.now();
    jqupload.fileHandler(
        {
            uploadDir: function()
            {
                return __dirname + '/public/uploads/' + now
            },
            uploadUrl: function()
            {
                return '/uploads/' + now
            }
        }
    )(req, res, next)
})

app.use(function(req, res, next)
{
    // if(!res.locals.partials) res.locals.partials = {};
    res.locals.weather = getWeatherData();
    next();
})


//  ROUTE
app.get('/contest/vacation-photo', function(req, res)
{
    var now = new Date();
    res.render('contest/vacation-photo', 
    {
        year: now.getFullYear(),
        month: now.getMonth()
    })
})

app.get('/newsletter', function(req, res)
{
    res.render('newsletter', 
    {
        csrf: 'CSRF token goes here'
    })
})

app.get('/newsletter1', function(req, res)
{
    
    res.render('newsletter1', 
    {
        csrf: 'CSRF token goes here'
    })
})


    // ajax
app.get('/nursery-rhyme', function(req, res)
{
    res.render('nursery-rhyme');
})

app.get('/data/nursery-rhyme', function(req, res)
{
    res.json(
        {
            animal: 'squirrel',
            bodyPart: 'tail',
            adjective: 'bushy',
            noun: 'heck'
        }
    )
})

app.get('/jquery-test', function(req, res)
{
    res.render('jquery-test');
})

app.get('/foo', function(req, res)
{
    res.render('foo', 
    {
        layout: 'microsite'
    })
})

app.get('/greeting', function(req, res)
{
    res.json(
        {
            message: 'welcome',
            style: req.query.style,
            userid: req.cookies.userid,
            username: req.session.username
        }
    )
})

    // layout
app.get('/no-layout', function(req, res)
{
    res.render('no-layout', 
    {
        layout: null
    })
})

app.get('/custom-layout', function(req, res)
{
    res.render('custom-layout', 
    {
        layout: 'custom'
    })
})

app.get('/headers', function(req, res)
{
    res.type('text/plain');
    var s = '';
    for(var name in req.headers)
    {
        s += name + ': ' + req.headers[name] + '\n';
    }
    res.send(s);
})

app.get('/', function(req, res, next)
{
    res.render('home');
})

app.get('/about', function(req, res, next)
{
    res.render('about', 
    {
        fortune: fortune.getFortune(),
        testPageScript: '/qa/tests-about.js'
    });
})

app.get('/thank-you', function(req, res)
{
    res.render('thank-you');
})

// POST
app.post('/newsletter1', function(req, res, next)
{
    var name = req.body.name || '', email = req.body.email || '';
    if(!email.match(VALID_EMAIL_REGEX))
    {
        if(req.xhr) return res.json({ error: 'Invalid name email address.'});
        req.session.flash = 
        {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was  not valid.'
        }
        return res.redirect(303, '/newsletter/archive');
    }

    new NewsletterSignup({ name: name, email: email}).save(function(err)
    {
        if(err)
        {
            if(req.xhr) return res.json({ error: 'Database error.' });
            req.session.flash = 
            {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later.',
            }
            return res.redirect(303, '/newsletter/archive');
        }

        if(req.xhr) return res.json({ success: true });
        req.session.flash = 
        {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter.',
        };
        return res.redirect(303, '/newsletter/archive');
    })

})

app.post('/contest/vacation-photo/:year/:month', function(req, res)
{
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files)
    {
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    })

})

app.post('/process', function(req, res)
{
    if(req.xhr || req.accepts('json,html') === 'json')
    {
        res.send(
            {
                success: true
            }
        )
    }
    else
    {
        res.redirect(303, '/thank-you')
    }
})

app.post('/process-contact', function(req, res)
{
    console.log('Recetved contact from ' + req.body.name + ' <' + req.body.email + '>');
    try
    {
        return res.xhr ? res.render(
            {
                success: true
            }) :
            res.redirect(303, '/thank-you');
    }
    catch(ex)
    {
        return res.xhr ? res.render(
            {
                error: 'Database error'
            }) :
            res.redirect(303, '/database-error');
    }
})

// API
app.get('/api/tours', function(req, res)
{
    var toursXml = '<?xml version="1.0"?><tours>' + tours.map(function(p)
    {
        return '<tour price="' + p.price +'" id="' + p.id + '">' + p.name + '</tour>';
    }).join('') + '</tours>';

    var toursText = tours.map(function(p)
    {                        
        return p.id + ': ' + p.name + ' (' + p.price + ')';                
    }).join('\n');

    res.format(
        {
            'application/json': function()
            {                        
                res.json(tours);                
            },                
            'application/xml': function()
            {                        
                res.type('application/xml');                        
                res.send(toursXml);                
            },                
            'text/xml': function()
            {                        
                res.type('text/xml');                        
                res.send(toursXml);                
            },               
            'text/plain': function()
            {                        
                res.type('text/plain');
                res.send(toursXml);
            }
        }
    )
})

app.put('/api/tour/:id', function(req, res)
{
    var p = tours.some(function(p)
    {
        return p.id == req.params.id;
    })

    if(p)
    {
        if(req.query.name) p.name = req.query.name;
        if(req.query.price) p.price = req.query.price;
        res.json(
            {
                success: true
            }
        )
    }
    else
    {
        res.json(
            {
                error: 'No such tour exits.'
            }
        )
    }
})

app.delete('/api/tour/:id', function(req, res)
{
    var i;
    for(var i = tours.length - 1; i >= 0; i--)
    {
        if(tours[i].id == req.params.id)
        {
            break;
        }
    }
    
    if(i >= 0)
    {
        tours.splice(i, 1);
        res.json(
            {
                success: true
            }
        )
    }
    else
    [
        res.json(
            {
                error: 'No such tour exists.'
            }
        )
    ]
})

// 
app.use(function(req, res, next)
{
    res.status(404).render('404');
})

app.use(function(req, res, next)
{
    res.status(500).render('500');
})

app.listen(app.get('port'), function()
{
    console.log('start server....')
})