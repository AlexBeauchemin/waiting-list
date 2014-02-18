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
  var alerts =  Alerts.find({user: this.userId});

  //TODO: I don't think upserted data are reactive, verify that
  alerts.map(function(alert,index) {
    if(alert && alert.patientId) {
      var patient = Patients.findOne(alert.patientId);
      var institution = Institutions.findOne(alert.institutionId);
      if(patient) {
        Alerts.upsert({patientId: patient._id}, {$set: { patientName: patient.name}});
        Alerts.upsert({patientId: patient._id}, {$set: { patientPosition: patient.position}});
      }
      if(institution) {
        Alerts.upsert({institutionId: institution._id}, {$set: { institutionName: institution.name}});
      }
    }
  });

  return alerts;
});

