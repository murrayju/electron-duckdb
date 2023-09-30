const { app } = require("electron");
const { test } = require("./test");

app.whenReady().then(test).catch(console.error);
