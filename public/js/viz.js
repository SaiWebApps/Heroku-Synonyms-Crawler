// Focus on "word" textbox when the page is loaded.
$(window).load(function() {
    $('#word').focus();
});

function contactSynonymsCrawlerAPI(root, append)
{
    $.ajax({
        url: '/get-synonyms',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            'word': root,
            'append': append
        })
    }).done(function(response) {
        // Handle the JSON response from the Synonyms Crawler API.
        var responseObject = JSON.parse(response);

        // Clear the previous results and status messages.
        $('#resultsArea').empty();
        $('#messages').empty();

        // Generate D3 tree based on results if there are no errors.
        var errors = responseObject['errors'];
        if (errors === undefined) {
            $('#messages').append(createSuccessDialog('Crawling operation succeeded.'));
            generateTreeDiagram(responseObject);
            return;
        }

        // Otherwise, display the errors.
        for (var i = 0; i < errors.length; i++) {
            $('#messages').append(createErrorDialog(errors[i]));
        }
    });
    
    createProgressBar();
}

function submitForm()
{
    // Clear previous messages.
    $('#messages').empty();

    var word = $('#word').val().trim();
    if (word.length === 0) {
        $('#messages').append(createErrorDialog('Field cannot be blank.'));
    }
    else {
        contactSynonymsCrawlerAPI(word, false);
    }

    // Clear "word" field.
    $('#word').val('');
}

// Submit form on button click.
$('#submitButton').click(submitForm);

// Or submit form when "enter" key is pressed on the "word" field.
$('#word').on('keypress', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        submitForm();
        return false;
    }
});