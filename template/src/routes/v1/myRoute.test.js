const request = require("supertest");

/* ###<db remove>### */ const app = require("./../../../appLocal");const { useChecks } = require("@apparts/types");const { checkType, allChecked } = useChecks(require("./myRoute"));const url = (str) => "/v/1/" + str; /* ###<db remove2>### */

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
