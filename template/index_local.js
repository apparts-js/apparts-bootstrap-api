const app = require("./appLocal");
const DB_CONFIG = require("@apparts/config").get("db-config");

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
