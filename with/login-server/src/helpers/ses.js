const AWS = require("aws-sdk");
const MAIL_CONFIG = require("@apparts/config").get("mail-config");

const sendMail = async (to, mail, title) => {
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: mail,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: title,
      },
    },
    Source: MAIL_CONFIG.sender,
  };

  try {
    const res = await new AWS.SES({
      apiVersion: "2010-12-01",
      region: MAIL_CONFIG.EMAIL_REGION,
    })
      .sendEmail(params)
      .promise();
    console.log("Send mail: ", res);
  } catch (e) {
    console.log("ERROR WHILE SENDING MAIL: ", e);
    console.log("Email should have been:", title, mail);
  }
};

module.exports = { sendMail };
