if (Meteor.isServer) {
  Meteor.methods({
    addAlert: function (institutionId, patientId, position, direction, onetime) {
      var user = this.userId;
      if (!user)
        throw new Meteor.Error(403, "You need to be logged in to add an institution.");
      if (!patientId || !position || !direction)
        throw new Meteor.Error(403, "Can't add alert : Missing information.");

      Alerts.insert({user: user, institutionId: institutionId, patientId: patientId, position: position, direction: direction, onetime: onetime, isSent: false, dateAdded: new Date()});

      return false;
    },
    deleteAlert: function(id) {
      var alert = Alerts.findOne({_id : id});
      if(this.userId == alert.user) {
        Alerts.remove(id);
      }
    },

    empty: null // To avoid adding, removing comas for last item
  });
}