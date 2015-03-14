var blockspring = require("blockspring");
var dataManager = require("./_data_manager");

/**
 * Return either an Object with the list of errors reported by Blockspring
 * or an Object with Blockspring's data formatted in a D3-friendly fashion.
 */
function getResponseObject(blockspringData)
{
    var errors = blockspringData["_errors"];
    if (errors.length === 0) {
        return dataManager.convertToD3Format(blockspringData.params);
    }

    // If there are errors, then filter out the message field of each error
    // object, and return the list of messages.
    errors = errors.map(function(elem) {
       return elem.message;
    });
    return {"errors": errors};
}

/**
 * POST request - Retrieve all of the synonyms for a specified "word"
 * that are at most "N" degrees of separation away from it.
 */
exports.index = function(request, response) {
    var word = request.body.word;
    var degrees = request.body.max_degrees_of_separation;

    response.writeHead(200);

    // Input validation
    if (word.length === 0 || isNaN(degrees) || degrees < 0) {
        response.write(JSON.stringify({"errors": ["Invalid inputs! Please try again."]}));
        response.end();
        return;
    }
    // If inputs were valid, then forward them to the SynonymsCrawler API on
    // Blockspring, and convert the results into a D3-compatible format so that
    // they can be displayed in a collapsible tree. 
    blockspring.runParsed("c6fc8245d147f64c8c3617b8315113aa", {
        "word": word,
        "max_degrees_of_separation": degrees
    }, function(blockspringData) {
        var output = getResponseObject(blockspringData);
        response.write(JSON.stringify(output));
        response.end();
    });
};

/**
 * Given a word, return the src of the 1st corresponding image from Bing Search API.
 */
exports.fetchImage = function(request, response) {
    var API_KEY = {accKey: "yZf2L/qSloFtqxxlZwW0j01eWaeDt41ujz9NrRzu0dA"};
    var IMAGE_FILTERS = {
        imagefilters: 'Size:Small+Color:Monochrome',
        top: 1,  // We just want the first image (top result) for each word.
        adult: "Strict"
    };
    
    var word = request.body.word;
    require("node-bing-api")(API_KEY).images(word, function(error, results, body) {
        if (body === undefined || body.d === undefined || body.d.results === undefined || body.d.results.length === 0) {
            response.write("None");
            response.end();
            return;
        }

        var imgSrc = body.d.results[0].Thumbnail.MediaUrl;
        var output = {"word": word, "imgSrc": imgSrc};
        response.write(JSON.stringify(output));
        response.end();
    });
};
