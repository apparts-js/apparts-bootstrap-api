/* ###<db imports>### */
const connect = require("@apparts/db");
/* ###<db fundefs>### */
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

/* ###<db injection>### */
DB_CONFIG = dbConfig;
route.use(injectDB);

/* ###<db shutdown>### */
if (dbs) {
  return new Promise((res) => {
    dbs.shutdown(() => {
      res();
    });
  });
}
