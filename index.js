const electron = require('electron');
const {app, BrowserWindow} = electron;

let tokenWindow;

function createTokenWindow() {
    tokenWindow = new BrowserWindow({
        width: 400,
        height: 300,
        center: true,
        title: "Please enter the bot token",
        resizable: false,
        minimizable: false,
        maximizable: false,
        autoHideMenuBar: true,
    });
    tokenWindow.loadFile('front/token.html');
    tokenWindow.on('closed', () => {
        tokenWindow = null;
    });
}

app.on('window-all-closed', () => {
    app.quit();
});
app.on('ready', createTokenWindow);