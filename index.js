"use static";

const app = require('apparts-node-app');
const config = require('apparts-config').get('my-config');
app.app(config.debug, (app, dbs) => {
  app.use('/v1/myroute/', require('./src/routes/myRoute')(dbs));
});
