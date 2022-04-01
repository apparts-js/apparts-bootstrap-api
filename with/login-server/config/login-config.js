const webtokenkey = require("@apparts/config").get("login-token-config");

module.exports = {
  pwHashRounds: 10,
  tokenLength: 32,
  apiToken: {
    webtokenkey,
    expireTime: "10 minutes",
  },
  welcomeMail: {
    title: "##HOST## Account bestätigen",
    body: `Hallo ##NAME##,
du wurdest eingeladen, Codes bei ##HOST## zu erstellen. Um mehr zu erfahren:
##URL##
Viele Grüße
`,
  },
  resetMail: {
    title: "Hallo ##NAME##, ##HOST## Passwort vergessen?",
    body: `Hallo ##NAME##,
Hier kannst du dein Passwort ändern: ##URL##
Viele Grüße
    `,
  },
  resetUrl: "https://##HOST##/resetpw",
};
