const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const bodyParser = require("body-parser");
require("es6-promise").polyfill();
require("isomorphic-fetch");
const NET_CONFIG = require("@apparts/config").get("network-config");
const cors = require("cors");
const morgan = require("morgan");
/* ###<db imports>### */

/* ###<aws imports>### */

/* ###<aws funs>### */

/* ###<db fundefs>### */

const configureCORS = (req, res, next) => {
  const { apiGateway: { event: { headers, httpMethod } = {} } = {} } = req;
  cors({
    origin: (origin, callback) => {
      if (NET_CONFIG.allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
  })(
    {
      ...req,
      headers: { ...req.headers, ...headers },
      method: httpMethod || req.method,
    },
    res,
    next
  );
};

const transscribeProxyIP = (req, res, next) => {
  req.ip = req.get("X-Forwarded-For");
  next();
};

const applyMiddleware = (route, dbConfig, noCors = false) => {
  route.use(awsServerlessExpressMiddleware.eventContext());
  route.use(transscribeProxyIP);
  if (!noCors) {
    route.use(configureCORS);
  }
  route.use(bodyParser.json({ limit: NET_CONFIG.maxReqSize }));
  if (!noCors) {
    route.options("*", cors()); // include before other routes
  }
  morgan.token("body", (req) => JSON.stringify(req.body || "").slice(0, 500));
  morgan.token("ua", (req) => req.get("X-Forwarded-For"));
  route.use(
    morgan(":date[clf] - :status :method :url HTTP/:http-version :body #:ua#", {
      skip: function (req, res) {
        return res.statusCode < 400;
      },
    })
  );
  /* ###<db injection>### */
};

module.exports = applyMiddleware;
module.exports.shutdown = () => {
  /* ###<db shutdown>### */
  return Promise.resolve();
};
