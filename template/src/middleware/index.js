const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const bodyParser = require("body-parser");
require("es6-promise").polyfill();
require("isomorphic-fetch");
const connect = require("@apparts/db");
const NET_CONFIG = require("@apparts/config").get("network-config");
const cors = require("cors");
const morgan = require("morgan");


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

let DB_CONFIG = null;
let dbs = null;
let counter = 0;
const getDBPool = (next) => {
  if (dbs === null) {
    counter++;
    dbs = new Promise((res, rej) => {
      connect(
        DB_CONFIG,
        (e, newDbs) => {
          if (e) {
            /* istanbul ignore next */
            console.log("DB ERROR", counter);
            throw e;
          }
          dbs = newDbs;
          next(dbs);
          res();
        },
        () => {
          // error
          console.log("DBS Error", counter);
          dbs = null;
          rej();
        }
      );
    });
  } else {
    /* istanbul ignore next */
    if (dbs instanceof Promise) {
      dbs.finally(() => {
        getDBPool(next);
      });
    } else {
      next(dbs);
    }
  }
};

const injectDB = (req, res, next) => {
  getDBPool((dbs) => {
    req.dbs = dbs;
    next();
  });
};

const transscribeProxyIP = (req, res, next) => {
  req.ip = req.get("X-Forwarded-For");
  next();
};

const applyMiddleware = (route, dbConfig, noCors = false) => {
  DB_CONFIG = dbConfig;
  route.use(awsServerlessExpressMiddleware.eventContext());
  route.use(transscribeProxyIP);
  if (!noCors) {
    route.use(configureCORS);
  }
  route.use(bodyParser.json({ limit: NET_CONFIG.maxReqSize }));
  route.use(injectDB);
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
};

module.exports = applyMiddleware;
module.exports.shutdown = () => {
  if (dbs) {
    return new Promise((res) => {
      dbs.shutdown(() => {
        res();
      });
    });
  }
  return Promise.resolve();
};
