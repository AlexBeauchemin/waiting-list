Template.profil.alerts = function () {
  var alerts = Alerts.find({}, {sort: [["dateAdded","desc"]]}).fetch();
  if(alerts.length) {
    alerts.forEach(function(alert) {
      Meteor.call('get_patient_name', alert.patientId, function(error,name){
        alert.patientName = name;
      });
    });
  }

  //TODO: I think the return is called before all Meteor.Call() are processed, so the patientName is not in the returning value
  //Need a better way to handle relational table in mongodb
  //See http://stackoverflow.com/questions/12764307/meteor-trouble-using-return-value-from-meteor-call

  return alerts;
};