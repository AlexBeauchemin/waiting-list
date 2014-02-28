if (Meteor.isServer) {
  Meteor.methods({
    createPatient: function (name, position, institution) {
      if(isAdmin(this.userId,institution)) {
        var patient_id = Patients.insert({name: name, position: position, institution: institution});
        return patient_id;
      }
    },
    updatePatient: function (id, position, institution) {
      if(isAdmin(this.userId,institution)) {
        updateAlerts(id, position);
        Patients.update(id, {$set: {position: position}});
      }
    },
    deletePatient: function (id, institution) {
      if(isAdmin(this.userId,institution)) {
        Alerts.remove({patientId: id});
        return Patients.remove(id);
      }
      return false;
    },
    getPatientName: function(id) {
      return Patients.findOne(id).name;
    },

    empty: null // To avoid adding, removing comas for last item
  });
}