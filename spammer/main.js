
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url');
const path = require('path');


let mainWin;
let spamWin;

function createWindow () {
  mainWin = new BrowserWindow({
    width: 1050,
    height: 600,
    minWidth: 1050,
    minHeight: 600,
    backgroundColor: '#009688',
    show: true,
    title: 'WhatsApp Spam Assistant'
  })
  mainWin.setMenu( Menu.buildFromTemplate(mainMenu));
  mainWin.loadURL('https://web.whatsapp.com/')
  mainWin.show()

  mainWin.on('closed', function () {
    mainWin = null;
  })
}

function createSpamWin(){
  spamWin = new BrowserWindow({
    width: 400,
    height: 350,
    minWidth: 400,
    minHeight: 350,
    backgroundColor: '#009688',
    title: 'Spam'
  })
  spamWin.setMenu( Menu.buildFromTemplate(spamMenu));
  spamWin.loadURL(url.format({
    pathname: path.join(__dirname, 'spamWindow.html'),
    protocol:'file:',
    slashes: true
  }))

  spamWin.on('closed', function () {
    spamWin = null;
  })
}

//catch spamtext
ipcMain.on('spam:send', function(e, spamText, spamCounter){
  if(spamCounter != null) {
    spamWin.close();
    Math.round(spamCounter);
    if(spamCounter < 0){
      spamCounter = 1;
    } 
    if (spamCounter > 2000){
      spamCounter = 2000;
    } 

    for (i = 0; i < spamCounter; i++){
      mainWin.webContents.executeJavaScript(`
      window.InputEvent = window.Event || window.InputEvent;
      event = new InputEvent('input', {bubbles: true});
      textbox = document.activeElement; //is inputfield by standard, but ot always as user can click somewhere else
      if (textbox.isContentEditable ) {	//did we get the input field?
        textbox.textContent ='`+spamText+`';
        textbox.dispatchEvent(event);
        keyPress = new InputEvent("keydown", {bubbles:true});
        keyPress.keyCode = 13;
        textbox.dispatchEvent(keyPress);
      }
      `)
    }
  }
}); 
  
  app.on('ready', createWindow)
  
  app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', function () {
  if (mainWin === null) {
    createWindow()
  }
})

//Menu template
const mainMenu = [
  {
    label:'Spam',
    click(){
      if (spamWin == null)
      createSpamWin();
  }}, 
  {
    role: 'reload'
  },
];

const spamMenu = [{}];

//Mac Menu handling
if(process.plattform == 'darwin'){
  mainMenu.unshift({});
  spamMenu.unshift({});
}

if (process.env.NODE_ENV != 'production'){
  spamMenu.push({
    label: 'Devtools',
    submenu: [
      {
        label: 'Toggle',
        click(item, focusedWindow){focusedWindow.toggleDevTools();}
      },
      {
        role: 'reload'
      }
    ]
  })
  mainMenu.push({
    label: 'Devtools',
    submenu: [
      {
        label: 'Toggle',
        click(item, focusedWindow){focusedWindow.toggleDevTools();}
      },
    ]
  })
}