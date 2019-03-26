"use strict";

const router = require('express').Router({mergeParams: true});
const { preparator } = require('apparts-types');
const { HttpError } = require('apparts-error');

const config = require('apparts-config').get('my-config');

module.exports = (dbs) => {
  let MyModel = require('../model/myModel.js')(dbs);

  router.post('/', preparator(
    {
      body: {
        str: { type: 'string' },
      }
    },
    async function({ body: { str } }){
      const mm = new MyModel({ str });
      await mm.store();
      return "ok";
    }));


  return router;
};

