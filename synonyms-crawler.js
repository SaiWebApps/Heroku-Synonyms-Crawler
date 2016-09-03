var blockspring = require('blockspring');
var SynonymsTrie = require('./synonyms-trie');

var currentTrie = null;

function processRawAPIOutput(blockspringData, append, callback)
{
    // If there are errors, then filter out the message field
    // from each error object.
    var errors = blockspringData["_errors"];
    if (errors.length > 0) {
        return {
            'errors': errors.map(function(elem) {
                return elem.message;
            })
        };
    }

    // Otherwise, convert the API's output to a D3-friendly format.
    var latestLevel = new SynonymsTrie(blockspringData.params);
    latestLevel.root.fetchImages(function() {
        if (append) {
            currentTrie.updateChild(latestLevel);
        }
        else {
            currentTrie = latestLevel;
        }
        callback();
    });
}

module.exports = function(word, append, handler, handlerArgs) {
    if (word !== undefined && word !== null && word.length === 0) {
        handler({
            "errors": ["Invalid inputs! Please try again."]
        }, handlerArgs);
        return;
    }

    blockspring.runParsed('c6fc8245d147f64c8c3617b8315113aa', {
        'word': word,
        'max_degrees_of_separation': 1
    }, function(blockspringData) {
        processRawAPIOutput(blockspringData, append, function() {
            handler(currentTrie, handlerArgs);
        });
	});
};