/* ###<includes model api>### */
const UserSettings = require("@apparts/config").get("login-token-config");
const {
  apiToken: { webtokenkey },
} = UserSettings;
const {
  addCrud,
  accessLogic: { anybody },
} = require("@apparts/model-api");
const { useResource } = require("../../models/resource");
/* ###<route model api>### */
addCrud({
  prefix: "/v/1/resource",
  app,
  model: useResource,
  routes: {
    get: anybody,
    getByIds: anybody,
    post: anybody,
    put: anybody,
    delete: anybody,
  },
  webtokenkey,
});
