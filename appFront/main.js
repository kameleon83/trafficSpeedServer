if (process.platform === 'windows') {
    // console.log(process.platform);
    if (require('electron-squirrel-startup')) return;
}else{
    // console.log(process.platform);
}
const setupEvents = require('./installers/setupEvents')


const electron = require('electron')
const AutoLaunch = require('auto-launch');
const {app, BrowserWindow,Menu} = electron
const path = require('path')
const url = require('url')
const Tray = electron.Tray
const os = require('os');

let win
let tray
var mainWindow = null
var transparent = false;


function createWindow () {

    if (process.platform === 'windows') {
        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
        var mW = width - 430;
        var mH = height - 150;
        transparent = true;
    }

    var isDev = process.env.TODO_DEV ? process.env.TODO_DEV.trim() == "true" : false;

    var w, h, c;
    if (isDev && process.platform === 'windows'){
        w = 800
        h = 800
        c = true
        mW = (width / 2) - (w/2)
        mH = (height / 2) - (h/2)
    }else if (process.platform !== 'windows'  && !isDev){
        w = 400
        h = 100
        c = true
    }else if (process.platform !== 'windows'  && isDev){
        w = 800
        h = 800
        c = true
    }else{
        w = 400
        h = 100
        c = false
    }
    // Create the browser window.
    win = new BrowserWindow({
        width: w,
        height: h,
        x: mW,
        y: mH,
        center: c,
        icon: 'assets/img/sokys.png',
        title: 'Traffic Speed',
        maximized: false,
        transparent: transparent,
        alwaysOnTop: true,
        frame: false
    });

    if (isDev){
        // Open the DevTools.
        win.webContents.openDevTools()
    }

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname,'html', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    trayOn()



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

    var ext = ""
    if (process.platform === 'windows') {
        ext = ".exe"
    }

    // console.log("extension : " + ext);

    var trafficSpeedAutoLauncher = new AutoLaunch({
        name: 'Traffic\ Speed',
        path: path.join(__dirname,'Traffic_Speed' + ext),
    });


    tray.on('click', () => {
        win.isVisible() ? win.hide() : win.show()
    })

    win.setAlwaysOnTop(true)

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
                    trafficSpeedAutoLauncher.enable();
                }else{
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

    if (win.isAlwaysOnTop()){
        contextMenu.items[4].checked = true
    }

    let autoLaunchFunction = () => {
        trafficSpeedAutoLauncher.isEnabled()
        .then(function(isEnabled){
            // console.log(isEnabled);
            if(isEnabled){
                contextMenu.items[2].checked = true
            }
            tray.setToolTip('Traffic Speed');
            tray.setContextMenu(contextMenu)
        })
    }

    autoLaunchFunction()
}
