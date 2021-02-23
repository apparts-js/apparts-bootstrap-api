const plzUpdate = (req, res) => {
  res.status(410);
  res.send("Bitte laden Sie die Seite neu.");
};
plzUpdate.options = {
  title: "Send update notification",
  returns: [{ status: 410, value: "Bitte laden Sie die Seite neu." }],
};

module.exports = plzUpdate;
