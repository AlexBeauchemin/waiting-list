isAdmin = function (user,institution) {
  if (user) {
    var is_institution_admin = Institutions.findOne({users: user, _id: institution});
    if (is_institution_admin) {
      return true;
    }
  }

  return false;
};

updateAlerts = function (id, position) {
  var alerts = Alerts.find({patientId: id, isSent: false}).fetch();
  if(alerts.length) {
    alerts.forEach(function(alert) {
      if(!alert.isSent) {
        if(alert.direction == "over" && position > parseInt(alert.position,10)) {
          //TODO: Send email
          Alerts.update(alert._id, {$set: {isSent: true}});
        }
        else if(alert.direction == "under" && position < parseInt(alert.position,10)) {
          //TODO: Send email
          Alerts.update(alert._id, {$set: {isSent: true}});
        }
      }
      else if(!alert.onetime){
        if(alert.direction == "over" && position <= parseInt(alert.position,10)) {
          //TODO: Send email
          Alerts.update(alert._id, {$set: {isSent: false}});
        }
        else if(alert.direction == "under" && position >= parseInt(alert.position,10)) {
          //TODO: Send email
          Alerts.update(alert._id, {$set: {isSent: false}});
        }
      }
    });
  }
};