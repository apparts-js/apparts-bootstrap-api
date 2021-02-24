/* ###< dbconfig >### */
const DB_CONFIG = require("@apparts/config").get("db-config");

/* ###< dbmiddleware >### */ applyMiddleware(app, undefined, true); /* ###< dbmiddleware >### */
applyMiddleware(app, DB_CONFIG);
