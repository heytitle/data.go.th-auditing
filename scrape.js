var page = require('webpage').create();

var url = 'https://data.go.th/Datasets.aspx';

var json2csv = require("to-csv");
var fields = ['title', 'url'];

var fs = require('fs');


var data = [];
var cache = { firstItem: "" };
page.open(url, function(status) {});

page.onLoadFinished = function(status) {
    console.log("Loading page : " + status );
    var firstItem = undefined;
    page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(cache) {
        var pageNo = 1;
        function getData(){
            var rootUrl = 'https://data.go.th';
            var items = page.evaluate(function(rootUrl){
                return $(".dataset-info").map(function(id, elem){
                    return {
                        title: $(elem).find('h2').text().trim(),
                        url:  rootUrl + "/" + $(elem).find('h2 a').attr('href'),
                        category : $(elem).prev().find('.category-type').text().trim()
                    }
                }).get();
            }, rootUrl );

            var f = page.evaluate(function(cache){
                return $(".dataset-info h2").first().text();
            });
            console.log("Working on page " + pageNo + "\t" + "First item of page : " + f );
            data = data.concat(items);

            // Have next page?
            var haveNextPage = page.evaluate(function(){
                $("#ctl00_MainContent_imbtnNextPage").click();
                return $("#ctl00_MainContent_imbtnNextPage").attr('disabled') !== "disabled"
            });

            if( !haveNextPage ){
                console.log("GETTING " + data.length + " datasets");
                var csv = json2csv(data);
                fs.write('data.csv', csv, "w")
                return
            }

            pageNo = pageNo + 1;

            setTimeout( function(){
                getData()
            }, 10000 );
        }
        getData();
    });
}
