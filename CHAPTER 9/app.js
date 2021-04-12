var express = require('express');
var app = express();

// body-parse
app.use(require('body-parse')());

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