if (Meteor.isServer) {
  Meteor.methods({
    createInstitution: function (name, description, isPrivate) {
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

      Institutions.update({_id: institution}, {$set: {"url": institution}});
      Meteor.users.update({_id: user}, {$set: {"profile.institutions": institutions}});

      return institution;
    },
    emptyInstitution: function (institution) {
      if(isAdmin(this.userId,institution)) {
        Patients.remove({institution: institution});
        Alerts.remove({institutionId: institution});
      }
    },
    deleteInstitution: function (institution) {
      if(isAdmin(this.userId,institution)) {
        Institutions.remove(institution);
        Alerts.remove({institutionId: institution});
      }
    },
    updateInstitution: function (institution, data) {
      if(isAdmin(this.userId,institution)) {
        Institutions.update(institution, {$set: data});
      }
    },
    updateInstitutionUrl: function (institution, url) {
      if(isAdmin(this.userId,institution)) {
        //TODO: Validate characters accepted in institution url
        if(!url) url = institution;
        var result = Institutions.findOne({url: url});
        if(!result || result._id == institution) {
          Institutions.update(institution, {$set: {url: url}});
        }
        else {
          throw new Meteor.Error(403, "This url is not valid or already taken.");
        }

        return true;
      }
    },

    empty: null // To avoid adding, removing comas for last item
  });
}