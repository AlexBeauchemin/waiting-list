//Validations for account creation
Accounts.validateNewUser(function (user) {
	var email = user.emails[0].address;
	var re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
	if (email.length < 3 || !re.test(email)) throw new Meteor.Error(403, "Email address is invalid");
	//TODO: Validate password length?
	return true;
});

Accounts.onCreateUser(function (options, user) {
	if (options.profile.name.length < 2)
		throw new Meteor.Error(403, "Please provide a name.");
	if (options.profile)
		user.profile = options.profile;
	return user;
});


function isAdmin(user,institution) {
	if (user) {
		var is_institution_admin = Institutions.findOne({users: user, _id: institution});
		if (is_institution_admin) {
			return true;
		}
	}

	return false;
}