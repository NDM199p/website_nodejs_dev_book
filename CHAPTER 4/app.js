var express = require('express');
var fortune = require('./lib/fortune');
var handlebars = require('express-handlebars').create({ defaultLayout: 'main'});

var app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.get('/about', function(req, res)
{
    // res.send(fortune.getFortune());
    res.render('about', { content : fortune.getFortune()});
});

app.use(function(req, res)
{
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

app.use(function(req, res)
{
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

app.listen(app.get('port'), function()
{
    console.log('Start Server.......');
});