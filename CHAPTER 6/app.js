var express = require('express');
var app = express();

var handlebars = require('express-handlebars').create({defaultLayout: 'main'});

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// bao mat
app.disable('x-powered-by');

app.get('/headers', (req, res) =>
{
    res.type('text/plain'); 
    var s = '';
    for(var name in req.headers)
    {
        s += name + ': ' + req.headers[name] + '\n';
    }
    res.send(s);
});

app.get('/about', (req, res) =>
{
    res.render('about');
});

app.get('/greeting', (req, res) =>
{
    res.render('about', {
        message: 'Wellcome',
        style: req.query.style,
        userid: req.cookies.userid,
        username: req.session.username
    });
});

app.get('/no-layout', (req, res) =>
{
    res.render('no-layout', {layout: null});
});

app.get('/custom-layout', (req, res) =>
{
    res.render('custom-layout', { layout: 'custom'});
});

// POST

app.post('/process-contact', (req, res) =>
{
    console.log('Received contact from '+ req.body.name+ ' <' + req.body.email + '>');
    
    try {
        return res.xhr ? res.render({success: true}) : res.redirect(303, '/thank-you');
    } catch (error) {
        return res.xhr ? res.json({error: 'Database error. '}) : res.redirect(303, '/database-error');
    }
});

// API TOURS

var tours = [
    {
        id: 0,
        name: 'Hood River',
        price: 99.99
    },
    {
        id : 1,
        name: 'Oregon Coast',
        price: 149.95
    }
    
];

app.get('/api/tours/json', (req, res) =>
{
    res.json(tours);
});

app.get('/api/tours', (req, res) =>
{
    var toursXml = '<?xml version="1.0"?><tours>'+
        tours.map( (p) =>
        {
            return '<tour price="' + p.price + '" id="'+ p.id + '">' + p.name + '</tour>';
        }).join('') + '</tours>';

    var toursText = tours.map( (p) =>
    {
        return p.id + ': '+ p.name + ' (' + p.price + ')';
    }).join('\n');

    res.format({
        'application/json': () =>
        {
            res.json(tours);
        },
        'application/xml': () =>
        {
            res.type('application/xml');
            res.send(toursXml);
        },
        'text/xml': () =>
        {
            res.type('text/xml');
            res.send(toursXml);
        },
        'text/plain': () =>
        {
            res.type('text/plain');
            res.send(toursText);
        }
    });
});

app.put('/api/tours/:id', (req, res) =>
{
    var p = tours.some( (p) => 
    {
        return p.id == req.params.id;
    });

    if(p)
    {
        if(req.params.name) p.name = req.params.name;
        if(req.params.price) p.price = req.params.price;
        res.json({ success: true});
    }
    else
    {
        res.json({ error: 'No such tour exits.'});
    }
});

app.delete('/api/tours/:id', (req, res) =>
{
    var i;
    for(var i = tours.length - 1 ; i>=0; i--)
    {
        if(req.params.id == tours[i].id)
        {
            i = req.params.id;
            break;
        } 
    }
    if(i >= 0)
    {
        tours.splice(i, 1);
        res.json({ sucess: true});
    }
    else
    {
        res.json({ error: 'No such tour exits.'});
    }
});

// 
app.use((req, res, next) =>
{
    res.status(404);
    res.render('404');
});

app.use((req, res) =>
{
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), () =>
{
    console.log('Server start......');
});

