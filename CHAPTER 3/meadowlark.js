var express = require('express');
var app = express();


// static file 
app.use(express.static(__dirname + '/public'));

// set up  view
var handlebars = require('express-handlebars').create({ defaultLayout: 'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// app.get('/', function(req, res){
//     res.type('text/plain');
//     res.send('Meadowlark Travel');
// });

app.get('/', function(req, res){
    res.render('home');
});

// dynamic content view
var content = 'Hello Nguyen Duc My';
app.get('/about', function(req, res){
    res.render('about', {content: content});
});

app.get('/img/retouch.jpg', function(req, res)
{
    res.render('image');
});

app.use(function(req, res)
{
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

app.use(function(req, res, next)
{
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

app.listen(app.get('port'), function()
{
    console.log('Express Start........');
});
