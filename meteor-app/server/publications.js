Meteor.publish("institutions", function () {
  if(!this.userId) return Institutions.find({private: false});

  var userProfile = Meteor.users.findOne({_id: this.userId}, {fields: {'profile': 1}}).profile;
  if(!userProfile.institutions) userProfile.institutions = [];
  if(!userProfile.favorites) userProfile.favorites = [];

  return Institutions.find({private: false, $or: [{_id: { $in: userProfile.institutions.concat(userProfile.favorites) }}]});
});

Meteor.publish("patients", function (institution) {
  if(!institution) return [];

  return Patients.find({institution: institution});
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

