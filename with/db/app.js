/* ###< dbconfig >### */
const DB_CONFIG = require("@apparts/config").get("db-config");

/* ###< dbmiddleware >### */ applyMiddleware(app); /* ###< dbmiddleware >### */
applyMiddleware(app, DB_CONFIG);
