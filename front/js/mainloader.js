const ipc = require('electron').ipcRenderer;
let guildsArray;

ipc.on('init', (event, guilds) => {

    guilds.forEach((guild, index) => {
        $('#servers').append(`<div class='row'><button class="col-lg-12" id='server${index}'>${guild.name}</button></div>`);
    });
});

ipc.send('loaded');
