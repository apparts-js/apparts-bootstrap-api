/* ###<aws imports>### */
const AWS_CONFIG = require("@apparts/config").get("aws-config");
const AWS = require("aws-sdk");

/* ###<aws funs>### */
AWS.config.update({
  region: AWS_CONFIG.REGION,
  credentials: new AWS.Credentials(
    AWS_CONFIG.AWS_ACCESS_KEY_ID,
    AWS_CONFIG.AWS_SECRET_ACCESS_KEY
  ),
});
