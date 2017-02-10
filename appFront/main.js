
//handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

const electron = require('electron')
const {app, BrowserWindow,Menu} = electron
const path = require('path')
const url = require('url')
const Tray = electron.Tray
const AutoLaunch = require('auto-launch');
const os = require('os');

let win
let tray


let platform = os.platform

function createWindow () {

    var mW = 0;
    var mH = 0;

    if (platform === 'win32'){
        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
        mW = width - 430;
        mH = height - 230;
    }
    // Create the browser window.
    win = new BrowserWindow({
        width: 400,
        maxWidth: 500,
        minWidth: 350,
        height: 150,
        maxHeight: 250,
        minHeight: 150,
        x: mW,
        y: mH,
        icon: 'assets/img/sokys.png',
        title: 'Traffic Speed',
        maximized: false,
        transparent: true,
        alwaysOnTop: true,
        frame: false
    });

    // and load the index.html of the app.


    win.loadURL(url.format({
        pathname: path.join(__dirname,'html', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    trayOn()

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

function trayOn(){
    const nativeImage = electron.nativeImage
    let image = nativeImage.createFromPath(path.join(__dirname,'assets', 'img', 'sokys.png'))
    tray = new Tray(image);
    // Petit bonus : on affiche une bulle au survol.

    var trafficSpeedAutoLauncher = new AutoLaunch({
        name: 'Traffic\ Speed',
        path: path.join(__dirname,'Traffic\ Speed.exe'),
    });
    // var updateAutoLauncher = new AutoLaunch({
    //     name: 'Traffic\ Speed\ Updater',
    //     path: path.join(__dirname,'Update.exe'),
    // });

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
        }, {
            type: 'separator'
        },
        {
            label: 'Au démarrage',
            type: 'checkbox',
            click: (e) => {
                if (e.checked){
                    // updateAutoLauncher.enable();
                    trafficSpeedAutoLauncher.enable();
                }else{
                    // updateAutoLauncher.disable();
                    trafficSpeedAutoLauncher.disable();
                }
            }
        }, {
            type: 'separator'
        },
        {
            label: 'Toujours devant',
            type: 'checkbox',
            click: (e) => {
                if (e.checked){
                    win.setAlwaysOnTop(true)
                }else{
                    win.setAlwaysOnTop(false)
                }
            }
        }, {
            type: 'separator'
        },
        {
            label: 'Quitter',
            click: () => {
                // cette méthode permet d’ouvrir une URL dans le navigateur par défaut
                app.quit()
            }
        }
    ])

    trafficSpeedAutoLauncher.isEnabled()
    .then(function(isEnabled){
        if(isEnabled){
            contextMenu.items[2].checked = true
            return isEnabled;
        }
        return isEnabled
    })

    if (win.isAlwaysOnTop()){
        contextMenu.items[4].checked = true
    }

    tray.setToolTip('Traffic Speed');
    tray.setContextMenu(contextMenu)
}
