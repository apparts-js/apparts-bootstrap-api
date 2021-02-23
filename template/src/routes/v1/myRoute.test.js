const request = require("supertest");
const { checkType, allChecked, app, url } = require("@apparts/backend-test")({
  testName: "demo",
  apiContainer: require("./myRoute"),
  ...require("./tests/config.js"),
});

const addRoutes = require("../");
addRoutes(app);

describe("GET test", () => {
  const functionName = "myRoute";

  test("Check return code", async () => {
    const response = await request(app).get(url("myRoute"));
    expect(response.status).toBe(200);
    expect(response.body).toBe("ok");
    checkType(response, functionName);
  });
  test("All possible responses tested", () => {
    allChecked(functionName);
  });
});
