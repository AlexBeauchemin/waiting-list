Template.profil.alerts = function () {
  return Alerts.find({}, {sort: [["dateAdded","desc"]]});
};