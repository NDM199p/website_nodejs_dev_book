var express = require('express');
var app = express();

var handlebars = require('express-handlebars').create(
    { 
        defaultLayout: 'main',
        // section html5
        helpers: 
        {
            section: function(name, options)
            {
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        },
    });

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

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
                temp: '54.1 F (12.3 C)'
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)'
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)'
            }
        ]   
    };
}

// app.use(function(req, res, next){
// 	// if(!res.locals.partials) res.locals.partials = {};
//  	// res.locals.partials.weather = getWeatherData();
//  	// next();
// });

app.get('/', (req, res) =>
{
    res.render('home');
})

app.get('/jquery-tests', (req, res) =>
{
    res.render('jquery-tests');
})

app.get('/foo', (req,res) =>
{
    res.render('foo', { 
        layout: 'microsite',
        lout: 'Nguyen Duc My'
    });
})

app.use((req, res) =>
{
    res.status(404).render('404');
})

app.use((req, res) =>
{
    res.status(500).render('500');
})

app.listen(app.get('port'), () =>
{
    console.log('Server start.......');
});