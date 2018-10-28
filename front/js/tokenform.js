const ipc = require('electron').ipcRenderer;

function disableForm(disabled) {
    const connecting = $('#connecting');
    $('#form').prop("disabled", disabled);
    if(disabled) {
        connecting.removeClass("d-none");
    }
    else {
        connecting.addClass("d-none");
    }
}

$("#tokenform").on("submit", () => {
    let token = $('#token');
    disableForm(true);
    ipc.send("tokenSent", token.val());
    return false;
});

ipc.on('tokenFailed', () => {
    disableForm(false);
});