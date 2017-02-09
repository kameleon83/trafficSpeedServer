
//handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
   // squirrel event handled and app will exit in 1000ms, so don't do anything else
   return;
}

const {app, BrowserWindow,Menu, electron} = require('electron')
const path = require('path')
const url = require('url')
const Tray = require('electron').Tray
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {

    // Create the browser window.
    win = new BrowserWindow({
        width: 400,
        maxWidth: 500,
        minWidth: 350,
        height: 150,
        maxHeight: 250,
        minHeight: 150,
        icon: 'assets/img/sokys.png',
        title: 'Traffic Speed',
        maximized: false,
        transparent: true,
        frame: false
    });

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname,'html', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    tray()

    // Open the DevTools.
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

function tray(){
    const nativeImage = require('electron').nativeImage
    let image = nativeImage.createFromPath(path.join(__dirname,'assets', 'img', 'sokys.png'))
    const tray = new Tray(image);
    // Petit bonus : on affiche une bulle au survol.

    tray.on('click', () => {
        win.isVisible() ? win.hide() : win.show()
    })
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Ouvrir owncloud',
            click: () => {
                // cette méthode permet d’ouvrir une URL dans le navigateur par défaut
                 require('electron').shell.openExternal("http://mickey06.ddns.net")
            }
        },
        {
            label: 'Quitter',
            click: () => {
                // cette méthode permet d’ouvrir une URL dans le navigateur par défaut
                 app.quit()
            }
        }
    ])
    tray.setToolTip('Traffic Speed');
    tray.setContextMenu(contextMenu)
}
