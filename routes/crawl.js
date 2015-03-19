var blockspring = require("blockspring");
var dataManager = require("./_data_manager");

/**
 * Return either an Object with the list of errors reported by Blockspring
 * or an Object with the SynonymCrawler API's results in a D3-friendly format.
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
 * POST request - Retrieve all synonyms of "word" that are 1 degree away from it.
 */
exports.index = function(request, response) {
    var word = request.body.word;

    response.writeHead(200);
    // Input validation
    if (word !== undefined && word.length === 0) {
        response.write(JSON.stringify({"errors": ["Invalid inputs! Please try again."]}));
        response.end();
        return;
    }

    // If inputs were valid, then forward them to Blockspring's SynonymsCrawler API,
    // and send back the results to the client.
    blockspring.runParsed("c6fc8245d147f64c8c3617b8315113aa", {
        "word": word,
        "max_degrees_of_separation": 1  // Zeroth and first-level synonyms only
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
    // Bing Search API Config
    var API_KEY = {accKey: "yZf2L/qSloFtqxxlZwW0j01eWaeDt41ujz9NrRzu0dA"};
    var IMAGE_FILTERS = {
        imagefilters: 'Size:Small+Color:Monochrome',
        top: 1,  // We just want the first image (top result) for each word.
        adult: "Strict"
    };
    var Bing = require("node-bing-api")(API_KEY);    

    // Query Bing API for most-popular image representing word.
    var word = request.body.word;
    Bing.images(word, function(error, results, body) {
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
