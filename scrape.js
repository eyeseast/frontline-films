/* 
Scrape Frontline's film archive from http://www.pbs.org/wgbh/pages/frontline/view/
*/
var cheerio = require('cheerio');
var dsv = require('dsv');
var csv = dsv(',');
var fs = require('fs');
var request = require('request');
var url = require('url');

var URL = 'http://www.pbs.org/wgbh/pages/frontline/view/';

function scrape(source_url, dest) {
    var file = dest ? fs.createWriteStream(dest) : process.stdout;
    request(source_url, function(err, resp, body) {
        var $ = cheerio.load(body);

        var shows = $('#showpane').find('div.sh').map(function(i, el) {
            var $el = $(el);

            var show = {
                title: $el.find('a.title').text(),
                date: $el.find('span.dat').text(),
                length: $el.find('span.len').text(),
                description: $el.find('span.dsc').text().trim(),
                url: $el.find('a.title').attr('href')
            };
            // page only links a path, so make a full URL
            show.url = url.resolve('http://www.pbs.org', show.url);

            return show;
        });

        file.write(csv.format(shows.toArray()));
        if (file.close) {
            // not used on stdout
            file.close();
        };
    });
}

if (require.main === module) {
    scrape(URL);
};