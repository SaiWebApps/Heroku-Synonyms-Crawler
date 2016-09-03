function createAlertDialog(type, message)
{
    var alertDialog = $("<div>", {class: "alert alert-" + type});
    
    var dialogMessage = $("<h3>").html(message);

    var dismissDialogButton = $("<button>", {
        class: "alert-button alert-button-" + type
    }).click(function() {
        $(this).parent().parent().remove();
    }).html("x");

    dialogMessage.append(dismissDialogButton);
    alertDialog.append(dialogMessage);

    return alertDialog;
}

function createErrorDialog(message)
{
    return createAlertDialog("danger", message);
}

function createSuccessDialog(message)
{
    return createAlertDialog("success", message);
}
