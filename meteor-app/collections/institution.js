if (Meteor.isServer) {
  Meteor.methods({
    create_institution: function (name, description, isPrivate) {
      var user = this.userId;
      if (!user)
        throw new Meteor.Error(403, "You need to be logged in to add an institution.");
      if (!name)
        throw new Meteor.Error(403, "You need to provide a name for the institution.");
      var name_exists = Institutions.findOne({name: name});

      if (name_exists)
        throw new Meteor.Error(403, "There is already an institution with this name : " + name);

      var institution = Institutions.insert({name: name, description: description, owner: [user], users: [user], private: isPrivate});
      var profile = Meteor.user().profile;
      var institutions = [institution];
      if (profile.institutions) {
        profile.institutions.push(institution);
        institutions = profile.institutions;
      }

      Meteor.users.update({_id: user}, {$set: {"profile.institutions": institutions}});

      return false;
    },
    empty_institution: function (institution) {
      if(isAdmin(this.userId,institution))
        Patients.remove({institution: institution});
    },
    delete_institution: function (institution) {
      if(isAdmin(this.userId,institution))
        Institutions.remove(institution);
    },
    update_institution: function (institution, data) {
      if(isAdmin(this.userId,institution)) {
        Institutions.update(institution, {$set: data});
      }
    },

    empty: null // To avoid adding, removing comas for last item
  });
}