var http = require("http");
var fs = require("fs");
var url = "http://f.starfox-online.net/sf64/voiceclips/";

var request = http.get(url, (response) => {
        var body = "";
        response.on("data", function (chunk) {
            body += chunk;
        });
        response.on("end", function () {

            parse(body);
        });
    });

function parse ( body ) {
    var urls = [];
    var matches = body.match(/href=".*\.mp3"/gm);
    for ( var i in matches ) {
        urls.push(matches[i].replace(/href="(.*\.mp3)"/, function ( string, a ) { return a; }));
    }
    downloadUrls(urls);
}

function downloadUrls ( urls ) {
    if ( urls.length ) {
        var link = urls.shift();
        var file = fs.createWriteStream(link);
        var request = http.get(url + link, function ( response ) {
            response.pipe(file);
            response.once("end", function () {
                downloadUrls(urls);
            });
        });
        console.log("Downloading:", link);
    }
}
