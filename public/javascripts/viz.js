// Image info lost while collapsing tree nodes, so use this map
// to keep track of images associated with each node and then restore
// info when expanding tree nodes once again
var imageMap = {};

/* Focus on "word" textbox when the page is loaded. */
$(window).load(function() {
    $("#word").focus();
});

/**
 * For each node in the D3 Tree display, retrieve a Bing Search image that
 * corresponds to the node's word, and display it.
 */
function fetchImages(responseObject)
{
    var resultsTrie = responseObject.root;
    var numLevels = responseObject.numLevels;
    var processingQueue = [resultsTrie];

    // Essentially level-order traversal of SynonymsTrie
    while (processingQueue.length > 0) {
        var currentNode = processingQueue.shift();
        if (currentNode === undefined) {
            break;
        }

        $.ajax({
            url: "/fetchImage",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({"word": currentNode.name})
        }).done(function(imageResults) {
            if (imageResults === "None") {
                return;
            }
            var jsonResults = JSON.parse(imageResults);
            var word = jsonResults.word;
            var imgSrc = jsonResults.imgSrc;
            imageMap[word] = imgSrc;
            d3.select("#" + word).attr("xlink:href", imgSrc); 
        });        

        processingQueue = processingQueue.concat(currentNode.children); 
    }
}

/*
 * Issue an AJAX request (cross-domain, POST) to the SynonymsCrawler API on
 * Blockspring, and handle the response. "root" and "degrees" will be passed
 * to the API as parameters "word" and "max_degrees_of_separation" respectively.
 */
function contactSynonymsCrawlerAPI(root, degrees)
{
    imageMap = {}; // Clear results from previous search.

    $.ajax({
        url: "/crawl",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({"word": root, "max_degrees_of_separation": degrees}),
    }).done(function(response) {
        /* Handle the JSON response from the Synonyms Crawler API. */
        var responseObject = JSON.parse(response);

        $("#resultsArea").empty();
        $("#messages").empty();

        // Generate D3 tree based on results if there are no errors.
        var errors = responseObject["errors"];
        if (errors === undefined) {
            $("#messages").append(createSuccessDialog("Crawling operation succeeded."));
            generateTreeDiagram(responseObject);
            fetchImages(responseObject);
            return;
        }
        // Otherwise, display the errors.
        for (var i = 0; i < errors.length; i++) {
            $("#messages").append(createErrorDialog(errors[i]));
        }
    });
}

/*
 * When the "Submit" button is clicked, validate the fields "word" and "max_degrees."
 * If they contain invalid inputs, then display an error message. Otherwise, use the
 * SynonymsCrawler API to get all synonyms for "word" that are at most "max_degrees" away.
 */
function submitForm()
{
    $("#messages").empty(); // Clear previous messages.

    var word = $("#word").val().trim();
    var maxDegrees = parseInt($("#maxDegrees").val());
    contactSynonymsCrawlerAPI(word, maxDegrees);
    createProgressBar();
    $("#word").val(""); // Clear "word" field.
    $("#maxDegrees").val(0); // Reset "maxDegrees" field to 0.
}

// Submit form on button click.
$("#submitButton").click(submitForm);
// Or submit form when "enter" key is pressed on the "word" or "maxDegrees" fields.
$("#word, #maxDegrees").keyup(function(event) {
    if (event.keyCode != 13) {
        return;
    }
    submitForm();
});
