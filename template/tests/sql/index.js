const fs = require("fs");

module.exports = () =>
  [
    "schema0001",
  ].map((schema) => fs.readFileSync("./sql/" + schema + ".sql").toString());
