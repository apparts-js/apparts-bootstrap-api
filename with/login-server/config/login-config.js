module.exports = {
  pwHashRounds: 10,
  tokenLength: 32,
  apiToken: {
    webtokenkey: "N4XT!23k)])U}=W10:[G~LXVu/?Mmzariea7Xdz(/ur:7QvOx*v?",
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
