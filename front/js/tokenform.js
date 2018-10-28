const ipc = require('electron').ipcRenderer;

function disableForm(disabled) {
    $('#sendButton').prop("disabled", disabled);
    $('#token').prop("disabled", disabled);
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