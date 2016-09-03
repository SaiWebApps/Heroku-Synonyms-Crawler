var SynonymsTrieNode = require('./synonyms-trie-node');

function SynonymsTrie(apiResponse)
{
    this.root = new SynonymsTrieNode(apiResponse[0]);
    this.numLevels = Object.keys(apiResponse).length;
    if (this.numLevels < 2) {
        return;
    }
    this.root.addChildren(apiResponse[1]);
}

SynonymsTrie.prototype.updateChild = function(childTrie) {
    // Do nothing if we can't find any child node with the same
    // value as childTrie's root.
    var targetChild = this.root.getNode(childTrie.root.name);
    if (targetChild === null) {
        return;
    }

    // Flush out duplicates.
    var addedChildren = this.root.addChildNodes(childTrie.root.children);
    this.root.removeChildren(addedChildren.map(function(childNode) {
        return childNode.name;
    }));
    
    // Now, add the unique nodes in childTrie to targetChild, which
    // should be a leaf in this trie.
    targetChild.addChildNodes(addedChildren);
    
    // We might have added a new level, so update numLevels accordingly.
    this.numLevels = this.root.getHeight();
};

module.exports = SynonymsTrie;