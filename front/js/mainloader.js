function enableServerListeners() {
    $('.server-button').on('click', function() {
        console.log("CLICK");
        let id = this.id;
        let serverId = id.replace('server', '');

        ipc.send('changesrv', serverId);
    });
}

// Sort channels
function channelsSort(a, b) {
    if(a.position < b.position)
        return -1;
    else if(a.position > b.position)
        return 1;
    else
        return 0;
}

const ipc = require('electron').ipcRenderer;
let guildsArray, channelsGroup, voiceChannels, textChannels, channels;

$('#messageform').on('submit', () => false);

ipc.on('init', (event, guilds) => {
    guildsArray = guilds;

    guilds.forEach((guild, index) => {
        $('#servers').append(`<div class='row'><button class="col-lg-12 server-button" id='server${index}'>${guild.name}</button></div>`);
    });

    enableServerListeners();
});

ipc.on('srvinfo', (event, chan) => {
    $('#channels').removeClass('d-none');
    $('#channelsList').empty();

    chan.sort(channelsSort);
    channels = chan;
    channelsGroup = [];
    voiceChannels = [];
    textChannels = [];

    chan.forEach((channel) => {
        switch(channel.type) {
            case 'text':
                textChannels.push(channel);
                break;
            case 'voice':
                voiceChannels.push(channel);
                break;
            case 'category':
                channelsGroup.push(channel);
                break;
        }
    });

    channelsGroup.forEach((channel) => {
        $('#channelsList').append(`<div id="ccategory${channel.id}"><div class="row"><strong class="col-lg-12">${channel.name}</strong></div></div>`);
    });

    textChannels.forEach((channel) => {
        let parent = null;
        if(channel.parentID !== null) {
            parent = $(`#ccategory${channel.parentID}`);
        }

        if(parent === null) {
            parent = $('#channelsList');
        }

        parent.append(`<div class="row"><a href="#" class="col-lg-12 channel-link d-block" id="channel${channel.id}" title="${channel.topic}">#${channel.name}</a></div>`);
    });

    voiceChannels.forEach((channel) => {
        let parent = null;
        if(channel.parentID !== null) {
            parent = $(`#ccategory${channel.parentID}`);
        }

        if(parent === null) {
            parent = $('#channelsList');
        }

        parent.append(`<div class="row"><div class="col-lg-12">V : ${channel.name}</div></div>`)
    });

    // channels.forEach((channel, index) => {
    //     let lineElement;
    //     let contentElement = document.createElement("div");
    //     contentElement.className = "row";
    //     if(channel.type === 'text') {
    //         lineElement = document.createElement("a");
    //         lineElement.href = '#';
    //         lineElement.className = 'channel-link ';
    //         lineElement.id = `channel${index}`;
    //         lineElement.title = channel.topic;
    //         lineElement.textContent = `#${channel.name}`;
    //     }
    //     else if(channel.type === 'category') {
    //         lineElement = document.createElement("strong");
    //         lineElement.textContent = channel.name;
    //     }
    //     else if(channel.type === 'voice') {
    //         lineElement = document.createElement("p");
    //         lineElement.textContent = 'Voice : ' + channel.name;
    //     }
    //
    //     lineElement.className += 'col-lg-12';
    //     contentElement.appendChild(lineElement);
    //     // $('#channelsList').append(`<div class="row"><a href="#" class="col-lg-12 channel-link" id="channel${index}" title="${channel.topic}">#${channel.name}</a></div>`);
    //     $('#channelsList').append(contentElement);
    // });
});

ipc.send('loaded');
