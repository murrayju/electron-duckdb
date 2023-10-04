const { app } = require("electron");

app
  .whenReady()
  .then(() => import("./test.js"))
  .then(({ test }) => test())
  .catch(console.error);
