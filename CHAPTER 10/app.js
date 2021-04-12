var express = require('express');
const cartValidation = require('./lib/cartValidation');
var app = express();

app.set('port', process.env.PORT || 3000);

// body-parsers
app.use(require('body-parser')());

// cookie-pasers
app.use(require('cookie-parser')());

//express-session
app.use(require('express-session')());

// requirew
app.use(require('./lib/tourRequiresWaiver'));

// cartValication
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

app.get('/', function(req, res)
{
    res.type('text/plain');
    res.send('Home');
})

app.listen(app.get('port'), function()
{
    console.log('server start ......')
});