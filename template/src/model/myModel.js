"use strict";

const Model = require('apparts-model');

module.exports = (dbs) => class User extends Model(dbs) {
  constructor(contents){
    super({
      _id: { type: "id", mapped: "id", key: true },
      createdOn: { type: "time", default: () => new Date().getTime() }
    }, "myModel", contents);
  }
};
