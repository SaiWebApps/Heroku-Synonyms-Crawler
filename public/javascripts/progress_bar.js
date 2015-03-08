function _createBody()
{
    var body = $("<div>", {class: "body"});
    
    var masterSpan = $("<span>");
    for (var i = 0; i < 4; i++) {
        masterSpan.append($("<span>"));
    }
    body.append(masterSpan);

    var baseDiv = $("<div>", {class: "base"});
    baseDiv.append($("<span>"));
    baseDiv.append($("<div>", {class: "face"}));
    body.append(baseDiv);

    return body;
}

function _createLongFazers()
{
    var longFazers = $("<div>", {class: "longfazers"});
    for (var i = 0; i < 4; i++) {
        longFazers.append($("<span>"));
    }
    return longFazers;
}

function createProgressBar()
{
    var resultsArea = $("#resultsArea");
    resultsArea.empty();
    resultsArea.append(_createBody());
    resultsArea.append(_createLongFazers());
    resultsArea.append("<h1>Loading....</h1>");
    return resultsArea;
}

