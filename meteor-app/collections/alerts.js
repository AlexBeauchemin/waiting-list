if (Meteor.isServer) {
  Meteor.methods({
    add_alert: function (institutionId, patientId, position, direction) {
      var user = this.userId;
      if (!user)
        throw new Meteor.Error(403, "You need to be logged in to add an institution.");
      if (!patientId || !position || !direction)
        throw new Meteor.Error(403, "Can't add alert : Missing information.");

      Alerts.insert({user: user, institutionId: institutionId, patientId: patientId, position: position, direction: direction, isSent: false, dateAdded: new Date()});

      return false;
    },

    empty: null // To avoid adding, removing comas for last item
  });
}