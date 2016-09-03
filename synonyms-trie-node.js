var async = require('async');
var imageScraper = new (require('images-scraper')).Bing();

function SynonymsTrieNode(name)
{
    this.name = name;
    this.imgUrl = '';
    this.children = [];
}

function getHeightHelper(trieNode)
{
    if (trieNode === null || trieNode === undefined) {
        return 0;
    }

    var numChildren = trieNode.children.length;
    if (numChildren === 0) {
        return 1;
    }

    var childHeights = [];
    for (var i = 0; i < numChildren; i++) {
        childHeights.push(getHeightHelper(trieNode.children[i]));
    }
    return 1 + Math.max.apply(null, childHeights);
}

SynonymsTrieNode.prototype.getHeight = function() {
    return getHeightHelper(this);
};

function getNodeHelper(trieNode, value) 
{
    if (trieNode.value === value) {
        return trieNode;
    }

    for (var i = 0; i < trieNode.children.length; i++) {
        var childNode = trieNode.children[i];
        if (childNode.name === value) {
            return childNode;
        }
        
        childNode = getNodeHelper(childNode, value);
        if (childNode !== null) {
            return childNode;
        }
    }

    return null;
}

SynonymsTrieNode.prototype.getNode = function(value) {
    return getNodeHelper(this, value);
};

SynonymsTrieNode.prototype.containsNode = function(value) {
    return (this.getNode(value) !== null);
}

SynonymsTrieNode.prototype.addChild = function(value, imgUrl) {
    if (this.containsNode(value)) {
        return null;
    }

    var newChild = new SynonymsTrieNode(value);
    if (imgUrl !== undefined) {
        newChild.imgUrl = imgUrl;
    }
    this.children.push(newChild);
    return newChild;
};

SynonymsTrieNode.prototype.addChildren = function(values) {
    for (var i = 0; i < values.length; i++) {
        this.addChild(values[i]);
    }
};

SynonymsTrieNode.prototype.removeChild = function(value) {
    var index = this.children.findIndex(function(childNode) {
        return childNode.name === value;
    });
    if (index !== -1) {
        this.children.splice(index, 1);
    }
};

SynonymsTrieNode.prototype.removeChildren = function(values) {
    for (var i = 0; i < values.length; i++) {
        this.removeChild(values[i]);
    }
};

function addChildNodeHelper(parent, child) 
{
    var addedChild = parent.addChild(child.name, child.imgUrl);
    if (addedChild === null) {
        return addedChild;
    }

    for (var i = 0; i < child.children.length; i++) {
        addChildNodeHelper(addedChild, child.children[i]);
    }
    return addedChild;
}

SynonymsTrieNode.prototype.addChildNode = function(childNode) {
    return addChildNodeHelper(this, childNode);
};

SynonymsTrieNode.prototype.addChildNodes = function(childNodes) {
    var addedChildren = [];
    for (var i = 0; i < childNodes.length; i++) {
        var addedChild = this.addChildNode(childNodes[i]);
        if (addedChild !== null) {
            addedChildren.push(addedChild);
        }
    }
    return addedChildren;
};

function fetchImage(trieNode, callback) 
{
    imageScraper.list({
        keyword: trieNode.name,
        num: 1,
        detail: true
    }).then(function(res) {
        trieNode.imgUrl = res[0].url;
        callback();
    }).catch(function(err) {
        trieNode.imgUrl = '';
        callback(err);
    });
}

function fetchChildImages(trieNode, mainCallback) 
{
    async.forEach(trieNode.children, function(childNode, subCallback) {
        fetchImage(childNode, subCallback);
    }, function(err) {
        mainCallback();
    });
}

SynonymsTrieNode.prototype.fetchImages = function(handleOutput) {
    var thisTrieNode = this;

    async.series([
        function(callback) {
            fetchImage(thisTrieNode, callback);
        },

        function(callback) {
            fetchChildImages(thisTrieNode, callback);
        }
    ], function(err) {
        handleOutput();
    });
};

module.exports = SynonymsTrieNode;