const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
     .then(createWindowsInstaller)
     .catch((error) => {
     console.error(error.message || error)
     process.exit(1)
 })

function getInstallerConfig () {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath)

    return Promise.resolve({
       appDirectory: path.join(outPath, 'Traffic\ Speed-win32-x64'),
       authors: 'Samuel Michaux - Sokys',
       noMsi: true,
       outputDirectory: path.join(outPath, 'windows-installer'),
       exe: 'Traffic Speed.exe',
       setupExe: 'TrafficSpeed.exe',
       setupIcon: path.join(rootPath, 'assets', 'img', 'sokys.ico')
   })
}