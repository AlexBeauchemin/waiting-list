if (Meteor.isServer) {
  Meteor.methods({
    create_patient: function (name, position, institution) {
      if(isAdmin(this.userId,institution)) {
        var patient_id = Patients.insert({name: name, position: position, institution: institution});
        return patient_id;
      }
    },
    update_patient: function (id, position, institution) {
      if(isAdmin(this.userId,institution)) {
        var alerts = Alerts.find({patientId: id, isSent: false}).fetch();
        if(alerts.length) {
          alerts.forEach(function(alert) {
            if(alert.direction == "over" && position > parseInt(alert.position,10)) {
              //TODO: Send email
              Alerts.update(alert._id, {$set: {isSent: true}});
            }
            else if(alert.direction == "under" && position < parseInt(alert.position,10)) {
              //TODO: Send email
              Alerts.update(alert._id, {$set: {isSent: true}});
            }
          });
        }
        Patients.update(id, {$set: {position: position}});
      }
    },
    delete_patient: function (id, institution) {
      if(isAdmin(this.userId,institution)) {
        Alerts.remove({patientId: id});
        return Patients.remove(id);
      }
    },
    get_patient_name: function(id) {
      return Patients.findOne(id).name;
    },

    empty: null // To avoid adding, removing comas for last item
  });
}