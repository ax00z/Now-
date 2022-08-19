import { get } from "http";
import { createWriteStream } from "fs";
var url = document.getElementById("demo").innerHTML =
"The full URL of this page is:<br>" + window.location.href();

var request = get(url, function (response) {
    var body = "";
    response.on("data", function (chunk) {
        body += chunk;
    });
    response.on("end", function () {

        parse(body);
    });
});

function parse(body) {
    var urls = [];
    var matches = body.match(/href=".*\.mp3"/gm);
    for (var i in matches) {
        urls.push(matches[i].replace(/href="(.*\.mp3)"/, function (string, a) { return a; }));
    }
    downloadUrls(urls);
}

function downloadUrls(urls) {
    if (urls.length) {
        var link = urls.shift();
        var file = createWriteStream(link);
        var request = get(url + link, function (response) {
            response.pipe(file);
            response.once("end", function () {
                downloadUrls(urls);
            });
        });
        console.log("Downloading:", link);
    }
}
