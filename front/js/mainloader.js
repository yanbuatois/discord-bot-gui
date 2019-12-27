const ipc = require('electron').ipcRenderer;
const { remote } = require('electron');
const htmlspecialchars = require('htmlspecialchars');
const MarkdownIt = require('markdown-it');
const markdown = new MarkdownIt;
let guildsArray, channelsGroup, voiceChannels, textChannels, channels;

function enableServerListeners() {
    $('.server-button').on('click', function() {
        let id = this.id;
        let serverId = id.replace('server', '');

        ipc.send('changesrv', serverId);

        leaveChannel();
    });
}

function enableChannelListeners() {
    $('.channel-link').on('click', function() {
        let id = this.id;
        let channelId = id.replace('channel', '');

        ipc.send('changechannel', channelId);
    }).on('contextmenu', function(event) {
        event.preventDefault();
        let id = this.id;
        let channelId = id.replace('channel', '');
        const template = [{
            label: 'Generate an invitation',
            click: () => {
                ipc.send('generateinvitation', channelId);
            }
        }];

        const menu = remote.Menu.buildFromTemplate(template);
        menu.popup({});
    });
}

// Sort channels
function channelsSort(a, b) {
    if (a.position < b.position)
        return -1;
    else if (a.position > b.position)
        return 1;
    else
        return 0;
}

function leaveChannel() {
    $('#messageszone').addClass('d-none');
    $('#messages').empty();
}

/**
 * Disable existing HTML tags, and convert markdown
 * @param content Message content
 * @return Decoded message
 */
function decodeMessage(content) {
    let endContent = htmlspecialchars(content);
    endContent = markdown.renderInline(content);

    return endContent
}

$('#messageform').on('submit', () => {
    let messageField = $('#messagefield');
    if (messageField.val() !== '') {
        ipc.send('post', messageField.val());
    }
    messageField.val('');

    return false;
});

ipc.on('init', (event, guilds) => {
    guildsArray = guilds;

    guilds.forEach((guild) => {
        $('#servers').append(`<div class='row'><button class="col-lg-12 server-button" id='server${guild.id}'>${guild.name}</button><img class="servericon serverlink " src='https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64'></img></div>`);
    });

    enableServerListeners();
});

ipc.on('srvinfo', (event, chan, servercurrent) => {
    $('#channels').removeClass('d-none');
    $('#channelsList').empty();
    $("#servername").html(servercurrent.name);

    chan.sort(channelsSort);
    channels = chan;
    channelsGroup = [];
    voiceChannels = [];
    textChannels = [];

    chan.forEach((channel) => {
        switch (channel.type) {
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
        $('#channelsList').append(`<div id="ccategory${channel.id}" class="col-lg-12"><div class="row"><strong class="col-lg-12">${channel.name}</strong></div></div>`);
    });

    textChannels.forEach((channel) => {
        let parent = null;
        if (channel.parentID !== null) {
            parent = $(`#ccategory${channel.parentID}`);
        }

        if (parent === null) {
            parent = $('#channelsList');
        }

        parent.append(`<div class="row"><a href="#" class="col-lg-12 channel-link d-block" id="channel${channel.id}" title="${channel.topic}">#${channel.name}</a></div>`);
    });

    voiceChannels.forEach((channel) => {
        let parent = null;
        if (channel.parentID !== null) {
            parent = $(`#ccategory${channel.parentID}`);
        }

        if (parent === null) {
            parent = $('#channelsList');
        }

        parent.append(`<div class="row"><div class="col-lg-12">V : ${channel.name}</div></div>`)
    });

    enableChannelListeners();
});

ipc.on('channelok', () => {
    $('#messageszone').removeClass('d-none');
    $('#messages').empty();
});

ipc.on('newmessage', (event, message, attachm) => {
    let { author, content, id } = message;
    content = decodeMessage(content);
    var msgApp = "";
    if (author.avatar == null) msgApp += `<div class="row" id="msg${id}"><div class="col-lg-12"><div><img class="avatars" src="https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png"></img><div class="msgbody"><strong id="msgauthor${id}">${author.username}</strong></br><span id="msgcontent${id}">${content}</span>`;
    else msgApp += `<div class="row" id="msg${id}"><div class="col-lg-12"><div><img class="avatars" src="https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.webp?size=64"></img><div class="msgbody"><strong id="msgauthor${id}">${author.username}</strong></br><span class="msgcontent" id="msgcontent${id}">`;
    content = content.replace(/&lt;:\p{Any}+:\d+&gt;/gu, `<img class="emoji" alt="${content.match(/:\p{Any}+(?=:):/gu)}" src="https://cdn.discordapp.com/emojis/${content.match(/\d+(?=&gt)/g)}.png?v=1"></img>`);
    msgApp += content.replace(/&lt;@!\d+&gt;/g, `${content.match(/&lt;@!\d+&gt;/g)!=null ? ipc.sendSync('usertagged',content.match(/&lt;@!\d+&gt;/g)[0].match(/\d+/g)[0]) : ""}</span>`);
    msgApp += "</span>";
    if (attachm != 0)
        if (attachm.endsWith('jpg') || attachm.endsWith('webp') || attachm.endsWith('png') || attachm.endsWith('gif') || attachm.endsWith('jpeg')) msgApp += `<img class="attachedimage" src="${attachm}"></img>`;
        else if (attachm != 0) msgApp += `<div class="attachedfile"></div>`;
    $('#messages').append(msgApp);
    $('#messages').animate({
        scrollTop: $(`#msg${id}`).offset().top + 'px'
    }, 10);
});

ipc.on('updatedMessage', (event, oldMessage, newMessage) => {
    let messageId = oldMessage.id;
    let content = decodeMessage(newMessage.content);
    $(`#msgcontent${messageId}`).html(`${content} <span class="font-italic font-weight-bold">(edited)</span>`);

});

ipc.on('deletedMessage', (event, message) => {
    let { id } = message;
    $(`#msg${id}`).addClass("deletedMessage");
    $(`#msgcontent${id}`).append(" <span class='font-italic font-weight-bold'>(deleted)</span>")
});

ipc.send('loaded');
