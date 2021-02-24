/* ###<includes login-server api>### */
const { addRoutes: addLoginRoutes } = require("@apparts/login-server");
const { useUser } = require("../../models/user");
const mail = require("../../helpers/ses");

/* ###<route login-server api>### */
addLoginRoutes(app, useUser, mail);
