const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;
const Discord = require('discord.js');
const discordClient = new Discord.Client();


let tokenWindow, mainWindow;

/**
 * Start of windows management
 */
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

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        title: "Bot management",
        resizable: true,
        minimizable: true,
        maximizable: true,
        autoHideMenuBar: true,
    });

    mainWindow.loadFile('front/main.html');
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('window-all-closed', () => {
    app.quit();
});
app.on('ready', createTokenWindow);

/**
 * End of Windows Management
 * Start of Discord Bot Management
 */
discordClient.on('ready', () => {
    createMainWindow();
    tokenWindow.close();
});

discordClient.on('error', (err) => {
    if(tokenWindow !== null) {
        electron.dialog.showMessageBox(tokenWindow, {
            type: 'error',
            title: 'Bot connexion failed',
            message: `The connexion to the bot failed.<br />(Error : <strong>${err.message}</strong>)`,
        },() => {
            tokenWindow.webContents().send('tokenFailed');
        });
    }
});
/**
 * End of Discord Bot Management
 * Start of IPC Management
 */

// We manage now IPC :
ipcMain.on('tokenSent', (event, token) => {
    const loginPromise = discordClient.login(token);
    loginPromise.then(null, (err) => {
        electron.dialog.showMessageBox(tokenWindow, {
            type: 'error',
            title: 'Bot connexion failed',
            message: `The connexion to the bot failed.\n(Error : ${err.message})`,
        },() => {
            tokenWindow.webContents.send('tokenFailed');
        });
    });
});

/**
 * End of IPC Management
 */