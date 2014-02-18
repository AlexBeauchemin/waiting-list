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
        updateAlerts(id, position);
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