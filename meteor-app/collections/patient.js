if (Meteor.isServer) {
  Meteor.methods({
    create_patient: function (name, position, institution) {
      var user = this.userId;
      //TODO: Verify if user is admin of the institution
      var patient_id = Patients.insert({name: name, position: position, institution: institution});
      return patient_id;
    },
    update_patient: function (id, position, institution) {
      if(isAdmin(this.userId,institution))
        Patients.update(id, {$set: {position: position}});
    },
    delete_patient: function (id, institution) {
      if(isAdmin(this.userId,institution))
        return Patients.remove(id);
    },

    empty: null // To avoid adding, removing comas for last item
  });
}