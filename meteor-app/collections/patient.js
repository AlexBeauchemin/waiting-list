if (Meteor.isServer) {
  Meteor.methods({
    createPatient: function (name, position, priority, institution) {
      if (isAdmin(this.userId, institution)) {
        var patientId = Patients.insert({name: name, position: position, priority: priority, institution: institution, dateAdded: new Date()});
        return patientId;
      }
      return false;
    },

    updatePatient: function (id, institution, data) {
      if (isAdmin(this.userId, institution)) {
        if(data.position) updateAlerts(id, data.position);
        Patients.update(id, {$set: data});
      }
    },

    updatePatientsPosition: function (id, start, end, institution) {
      if (isAdmin(this.userId, institution)) {
        //If element pushed down
        if(start > end) {
          Patients.update({institution: institution, position: {$gte: end, $lt: start}}, { $inc: { position: 1}}, { multi: true }, function() {
            Patients.update({_id: id}, { $set: {position: end}});
          });
        }
        //If element pushed up
        else {
          Patients.update({institution: institution, position: {$gt: start, $lt: end}}, { $inc: { position: -1}}, { multi: true }, function() {
            Patients.update({_id: id}, { $set: {position: end - 1}});
          });
        }
      }
      //TODO: Send alerts
    },

    deletePatient: function (id, institution) {
      if (isAdmin(this.userId, institution)) {
        Alerts.remove({patientId: id});

        var patient = Patients.findOne(id);

        Patients.remove(id);
        Patients.update({institution: institution, position: {$gt: patient.position}}, {$inc: {position: -1}}, {multi: true});

        //TODO: Send alerts
        return true;
      }
      return false;
    },

    getPatientName: function (id) {
      return Patients.findOne(id).name;
    },

    empty: null // To avoid adding, removing comas for last item
  });
}