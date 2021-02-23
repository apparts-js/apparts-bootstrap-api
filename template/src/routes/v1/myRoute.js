const { preparator } = require("@apparts/types");
const { HttpError } = require("@apparts/error");

const myRoute = preparator(
  {
    query: {
      str: { type: "string", optional: true },
    },
  },
  async ({ query: { str } }) => {
    return "ok";
  },
  {
    title: "Demo route",
    description: "You should delete this route.",
    returns: [{ status: 200, value: "ok" }],
  }
);

module.exports = { myRoute };
