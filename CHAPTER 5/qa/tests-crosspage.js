var Browser = require('zombie'),
    assert = require('chai').assert;

var browser;

suite('Cross-Page Tests', () =>
{
    setup( () =>
    {
        browser = new Browser();
    });

    test('requesting a group rate quote     from the hood river tour page' +'should populate the referrer field', (done) =>
    {
        var referrer = 'http://localhost:3000/tours/hood-river';
        browser.visit(referrer, () =>
        {
            browser.clicklink('.requestGroupRate', () =>
            {
                assert(browser.field('referrer').value === referrer);
                done();
            });
        });
    });
});