var express = require('express');
var app = express();

app.set('port', process.env.PORT ||3000);

app.use(express.static(__dirname + '/public'));

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

// FORM HANDLING 
app.use(require('body-parser')());

// route
app.get('/newsletter', function(req, res)
{
    res.render('newsletter', { csrf: 'CSRF token goes here'})
})

app.post('/process', function(req, res)
{
    // 1
    // console.log('Form (from querystring): ' + req.query.form);
    // console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    // console.log('Name (from visit form field): ' + req.body.name);
    // console.log('Email token (from visible form field): ' + req.body.email);

    // 2
    // ajax
    if(req.xhr || req.accepts('json,html') === 'json')
    {
        res.send({ success: true});
    }
    else
    {
        res.redirect(303, '/thank-you');
    }
    // 1
    // res.redirect(303, '/thank-you');
})

// File upload
var formidable = require('formidable');

// upload jquery
var jqupload = require('jquery-file-upload-middleware');

app.use('/upload', function(req, res, next)
{
    var now = new Date.now();
    jqupload.fileHandler(
        {
            uploadDir: function()
            {
                return __dirname + '/public/uploads/'+ now;
            },
            uploadUrl: function()
            {
                return '/uploads/' + now;
            }
        }
    )(req, res, next);
})


app.get('/contest/vacation-photo', function(req, res)
{
    var now = new Date();
    res.render('contest/vacation-photo', 
    {
        year: now.getFullYear(),
        month: now.getMonth()
    })
})

app.post('/contest/vacation-photo/:year/:month', function(req, res)
{
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files)
    {
        if(err) return res.redirect(303, '/error');
        console.log('receibed fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    })
})

app.get('/thank-you', function(req, res)
{
    res.render('thank-you');
})

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(function(req, res)
{
    res.status(404).render('404');
})

app.use(function(req, res){
    res.status(500).render('500');
})

app.listen(app.get('port'), function()
{
    console.log('server start...');
})