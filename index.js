const http = require('http');
const CronJob = require('cron').CronJob;
const request = require('request');
const fs = require('fs');
const DateFormat = require('dateformat');

const server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Hello Http');
});

server.listen(8080);
let oldDate = new Date();
let song = '';
const job = new CronJob({
    cronTime: '0 */2 * * * *', 
    onTick: function () {
        request('http://radiostad.org/nowplaying/songinfo.html', function (err, response, body) {

            if (err) {
                return console.log(err);
            }
            if (song !== body) {
                song = body;
                const date = new Date();
                if (oldDate.getDate !== date.getDate) {
                    oldDate = date;
                }
                const output = DateFormat(date, 'hh:MM') + ': ' + body + '\r\n';
                const filePath = './playlist/playlist-' + DateFormat(oldDate, 'dd-mm-yyyy') + '.txt';
                fs.appendFile(filePath, output, function (err) {
                    if (err) {
                    
                        fs.closeSync(fs.openSync(filePath, 'a'));
                        fs.appendFile(filePath, output, function (err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                    console.log('Saved: ' + output);
                });
            }
        });
    }, 
    start: true,
    timezone: 'Europe'
});

job.start();