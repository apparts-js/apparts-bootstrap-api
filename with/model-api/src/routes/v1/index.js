/* ###<includes model api>### */
const {
  addCrud,
  accessLogic: { anybody },
} = require("@apparts/model-api");
const { useResource } = require("../../models/resource");
/* ###<route model api>### */
addCrud("/v/1/resource", app, useResource, {
  get: anybody,
  getByIds: anybody,
  post: anybody,
  put: anybody,
  delete: anybody,
});
