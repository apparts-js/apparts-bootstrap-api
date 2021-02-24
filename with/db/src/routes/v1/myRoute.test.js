/* ###<db remove>### */ const app = require("./../../../appLocal");const { useChecks } = require("@apparts/types");const { checkType, allChecked } = useChecks(require("./myRoute"));const url = (str) => "/v/1/" + str; /* ###<db remove2>### */
const { checkType, allChecked, app, url } = require("@apparts/backend-test")({
  testName: "demo",
  apiContainer: require("./myRoute"),
  ...require("./tests/config.js"),
});

const addRoutes = require("../");
addRoutes(app);

