const { makeModel } = require("@apparts/model");
const { createUseUser } = require("@apparts/login-server");

const {
  Users,
  User,
  NoUser,
} = createUseUser(/* <custom type>, <custom table name>*/);

// e.g. for User
/*
class SpecialUser extends User {
  constructor(dbs, content) {
    super(dbs, content);
  }
}
*/

module.exports = makeModel("User", [Users, User, NoUser]);
