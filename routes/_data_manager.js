/* SynonymsTrieNode class for storing data in a D3-friendly format */
function SynonymsTrieNode(name, parentName)
{
    this.name = name;
    this.parent = (arguments.length == 1) ? null : parentName;
    this.children = [];
}

/**
 * Return the child reference with name = "value," if it
 * exists, null if it doesn't.
 */
SynonymsTrieNode.prototype.getChild = function(value) {
    for (var i = 0; i < this.children.length; i++) {
        var childNode = this.children[i];
        if (childNode.name === value) {
            return childNode;
        }
    }
    return null;
};

/**
 * Create a new child SynonymsTrieNode with name = "value,"
 * and return a reference to it.
 * Return null if this TrieNode already has a child with the
 * given value.
 */
SynonymsTrieNode.prototype.addChild = function(value) {
    if (this.getChild(value) !== null) {
        return null;
    }

    var newChild = new SynonymsTrieNode(value);
    newChild.parent = this.name;
    this.children.push(newChild);
    return newChild;
};

/* SynonymsTrie class for storing the D3-data in TrieNodes and the number of levels */
function SynonymsTrie(d3Data, numLevels)
{
    this.root = d3Data; // Points to root SynonymsTrieNode in the D3 data
    this.numLevels = numLevels;
}

/**
 * Convert the Blockspring API data, "apiResponse," to a D3-compatible format.
 */
exports.convertToD3Format = function(apiResponse) {
    var numLevels = Object.keys(apiResponse).length;
    var root = new SynonymsTrieNode(apiResponse[0]); // root's value is starting word
    var ptr = root;

    // For each level - [1, numLevels) - get the list of synonyms, and
    // add child nodes to ptr for each synonym. Then, update ptr to point
    // to the first child on the next level.
    for (var level = 1; level < numLevels; level++) {
        var synonyms_list = apiResponse[level]; // the list of synonyms at this level
        for (var i = 0; i < synonyms_list.length; i++) {
            ptr.addChild(synonyms_list[i]);
        }
        ptr = ptr.getChild(synonyms_list[0]);
    }
    return new SynonymsTrie(root, numLevels);
};
