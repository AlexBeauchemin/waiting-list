// PUBLISH

Meteor.publish("institutions", function () {
	return Institutions.find({});
});
Meteor.publish("patients", function (institution) {
	return Patients.find({institution:institution});
});
Meteor.publish("userData", function () {
    return Meteor.users.find({_id: this.userId},
        {fields: {'profile': 1}});
});


//METHODS

Meteor.methods({
	create_institution: function(name,isPrivate) {
        var user = this.userId;
		if(!user)
            throw new Meteor.Error(403, "You need to be logged in to add an institution.");
		if(!name)
            throw new Meteor.Error(403, "You need to provide a name for the institution.");
        var name_exists = Institutions.findOne({name: name});

        if(name_exists)
            throw new Meteor.Error(403, "There is already an institution with this name : " + name);

		var institution = Institutions.insert({name: name, owner:[user], users: [user], private: isPrivate});
        var profile = Meteor.user().profile;
        var institutions = [institution];
        if(profile.institutions) {
            profile.institutions.push(institution);
            institutions = profile.institutions;
        }

        Meteor.users.update({_id:user}, {$set:{"profile.institutions":institutions}});

		return false;
	},
	create_patient:function (name, position, institution) {
        var user = this.userId;
		//TODO: Verify if user is admin of the institudion
		var patient_id = Patients.insert({name:name, position:position, institution:institution});
		return patient_id;
	},
	update_patient:function (id, position, institution) {
        var user = this.userId;

        if(user) {
            var is_institution_admin = Institutions.findOne({users: user, _id: institution});
            if(is_institution_admin) {
                Patients.update(id, {$set:{position:position}});
            }
        }

	},
    delete_patient:function (id, institution) {
        var user = this.userId;

        if(user) {
            var is_institution_admin = Institutions.findOne({users: user, _id: institution});
            if(is_institution_admin) {
                return Patients.remove(id);
            }
        }
	},
	empty:null // To avoid adding, removing comas for last item
});

//Validations for account creation
Accounts.validateNewUser(function (user) {
	var email = user.emails[0].address;
	var re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
	if(email.length < 3 || !re.test(email)) throw new Meteor.Error(403, "Email address is invalid");
	//TODO: Validate password length?
	return true;
});

Accounts.onCreateUser(function(options, user) {
    if(options.profile.name.length<2)
        throw new Meteor.Error(403, "Please provide a name.");
    if (options.profile)
        user.profile = options.profile;
    return user;
});