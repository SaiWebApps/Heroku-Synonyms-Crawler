function generateTreeDiagram(treeData)
{
    var i = 0,
        duration = 750;

    var nodeDim = treeData.numLevels * 8;
    var tree = d3.layout.tree().nodeSize([nodeDim, nodeDim]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    var midHeight = window.innerHeight / 2;
    var margin = {
        top: window.innerHeight / 2, 
        bottom: 0,
        left: $(".sidebar").width() + 100,
        right: 0
    };
    var width = window.outerWidth - margin.right - margin.left,
        height = window.outerHeight - margin.top - margin.bottom;

    var resultsArea = d3.select("#resultsArea");
    var svg = resultsArea.append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Enable zooming and panning.
    var zoomBehavior = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .translate([margin.left, margin.top])   /* Defines diagram's starting point when zooming behavior is activated. */
        .scale(1)
        .on("zoom", function() {
            svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });
    resultsArea.call(zoomBehavior);

    var root = treeData.root;
    root.x0 = height / 2;
    root.y0 = 0;

    update(root);

    d3.select(self.frameElement).style("height", "500px");

    function update(source) {
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 180; });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        // Word displayed by this node
        nodeEnter.append("text")
            .attr("x", function(d) { return d.children || d._children ? -20 : 20; })
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
            .text(function(d) { return d.name; })
            .style("fill-opacity", 1e-6);

        // Thumbnail corresponding to this node's word
        nodeEnter.append("image")
            .attr("id", function(d) { return d.name; })
            .attr("xlink:href", function(d) { return d.icon; })
            .attr("x", "-12px")
            .attr("y", "-12px")
            .attr("width", "24px")
            .attr("height", "24px");

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 10)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x  + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

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

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
                });
    }

    // Toggle children on click.
    function click(d) {
        // If collapsing (hiding child nodes)
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } 
        // Otherwise, if expanding (showing child nodes)
        else {
            d.children = d._children;
            d._children = null;

            // Image info lost while collapsing child nodes, so
            // restore from imageMap
            for (var i = 0; i < d.children.length; i++) {
                var child = d.children[i];
                var childName = child.name;
                if (childName === undefined) {
                    continue;
                }
                child.icon = imageMap[child.name];
                d.children[i] = child;
            }
        }
        update(d);
    }
}

