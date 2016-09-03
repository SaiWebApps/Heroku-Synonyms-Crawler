var i = 0;
var duration = 750;

var svg;
var tree;

function enableZoomingAndPanning(resultsArea, diagramStartPos)
{
    resultsArea.call(
        d3.behavior
            .zoom()
            .scaleExtent([1, 10])
            // Defines diagram's starting point when 
            // zooming behavior is activated.
            .translate(diagramStartPos)
            .scale(1)
            .on("zoom", function() {
                svg.attr("transform", "translate(" + d3.event.translate 
                    + ")scale(" + d3.event.scale + ")");
            })
    );
}

function initResultsArea(margin, width, height)
{
	var resultsArea = d3.select("#resultsArea");
    svg = resultsArea.append("svg")
                     .attr("width", width + margin.right + margin.left)
                     .attr("height", height + margin.top + margin.bottom)
                     .append("g")
                     .attr("transform", "translate(" + margin.left 
                        + "," + margin.top + ")");

    enableZoomingAndPanning(resultsArea, [margin.left, margin.top]);
}

function initD3Tree(treeData)
{
    var nodeDim = treeData.numLevels * 8;
    tree = d3.layout.tree().nodeSize([nodeDim, nodeDim]);
}

// Enter any new nodes at the parent's previous position.
function handleNodeEntry(node, source)
{
    var nodeEnter = 
        node.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + source.y0 + "," + source.x0 + ")"; 
            })
            .on("click", click);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { 
            return d._children ? "lightsteelblue" : "#fff"; 
        });

    // Word displayed by this node
    nodeEnter.append("text")
        .attr("x", function(d) { 
            return d.children || d._children ? -20 : 20; 
        })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { 
            return d.children || d._children ? "end" : "start"; 
        })
        .text(function(d) { 
            return d.name; 
        })
        .style("fill-opacity", 1e-6);

    // Thumbnail corresponding to this node's word
    nodeEnter.append("image")
        .attr("id", function(d) { return d.name; })
        .attr("xlink:href", function(d) { 
            return d.imgUrl; 
        })
        .attr("x", "-12px")
        .attr("y", "-12px")
        .attr("width", "24px")
        .attr("height", "24px");
}

function transitionNodesToNewPosition(node)
{
    var nodeUpdate = 
        node.transition()
            .duration(duration)
            .attr("transform", function(d) { 
                return "translate(" + d.y + "," + d.x + ")"; 
            });

    nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function(d) { 
            return d._children ? "lightsteelblue" : "#fff"; 
        });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);
}

// Transition exiting nodes to the parent's new position.
function handleExitingNodes(node, source)
{
    var nodeExit = 
        node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { 
                return "translate(" + source.y + "," + source.x  + ")"; 
            })
            .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);
}

function updateLinks(links, source)
{
    var diagonal = d3.svg.diagonal().projection(function(d) { 
        return [d.y, d.x]; 
    });
        
    var link = 
        svg.selectAll("path.link")
           .data(links, function(d) { 
                return d.target.id; 
            });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
        })
        .remove();
}

function update(source) 
{
    var nodes = tree.nodes(source).reverse();
    // Normalize for fixed depth.
    nodes.forEach(function(d) {
        d.y = d.depth * 180;
    });

    var links = tree.links(nodes);
    var node =
        svg.selectAll("g.node")
           .data(nodes, function(d) { 
                return d.id || (d.id = ++i); 
            });

    handleNodeEntry(node, source);
    transitionNodesToNewPosition(node);
    handleExitingNodes(node, source);
    updateLinks(links, source);

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(d) 
{
    // Case 1: Node has children.
    // (1a) Expand and show children.
    if (d.children) {
        d._children = d.children;
        d.children = null;
    }
    // (1b) Collapse and hide children.
    else if (d._children) {
        d.children = d._children;
        d._children = null;
    }

    // Case 2: Node does not have children.
    else {
        // Get synonyms for node.
        contactSynonymsCrawlerAPI(d.name, true);
    }

    update(d);
}

function generateTreeDiagram(treeData)
{
    var margin = {
        top: window.innerHeight / 2, 
        bottom: 0,
        left: $(".sidebar").width() + 100,
        right: 0
    };
    var width = window.outerWidth - margin.right - margin.left;
    var height = window.outerHeight - margin.top - margin.bottom;

    initResultsArea(margin, width, height);
    initD3Tree(treeData);

    var root = treeData.root;
    root.x0 = height/2;
    root.y0 = 0;
    update(root);

    d3.select(self.frameElement).style("height", "500px");
}