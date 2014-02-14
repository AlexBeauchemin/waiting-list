//Validations for account creation (part of the account package)
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