"use strict";

const electron = require('electron');

electron.app.on('ready', () => {
    let window = new electron.BrowserWindow({
        "width": 1000,
        "height": 700,
        "webSecurity": false
    });
    window.setMenu(null);
    window.loadURL(`file:///${__dirname}/index.html`);
});
