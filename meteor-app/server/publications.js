Meteor.publish("institutions", function () {
  //TODO: Return only public institutions and institutions owned by the user
  return Institutions.find({});
});
Meteor.publish("patients", function (institution) {
  return Patients.find({institution: institution});
});
Meteor.publish("userData", function () {
  return Meteor.users.find({_id: this.userId},
    {fields: {'profile': 1}});
});
Meteor.publish("alerts", function () {
  return Alerts.find({user: this.userId});
});

