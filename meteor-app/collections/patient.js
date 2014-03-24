if (Meteor.isServer) {
  Meteor.methods({
    createPatient: function (name, position, priority, institution) {
      if(isAdmin(this.userId,institution)) {
        var patientId = Patients.insert({name: name, position: position, priority: priority, institution: institution, dateAdded: new Date()});
        return patientId;
      }
      return false;
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