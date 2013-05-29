Patients = new Meteor.Collection("patients");
Institutions = new Meteor.Collection("institutions");
UserData = new Meteor.Collection("userData");

//CLIENT ACTIONS
if (Meteor.isClient) {

	//VARS
	var currentPage = "main",
			spinner = null;

	Session.set('loginState', "login");


	//SUBSCRIPTIONS
	Meteor.subscribe('institutions', null, function () {
		//TODO: better way to point to the first element id
		Session.set("current_institution", Institutions.find({}, {sort: {name: 1}, limit: 1}).fetch()[0]._id);
		Meteor.autosubscribe(function () {
			Meteor.subscribe('patients', Session.get("current_institution"));
			Meteor.subscribe('userData', null, function () {
						//console.log('Userdata:',Meteor.user().profile);
					}
			);
		});
	});


	//FEED TEMPLATES
	Template.login.stateIs = function (state) {
		return state === Session.get("loginState");
	};

	Template.institutionslist.institutions = function () {
		var user = Meteor.user();
		//TODO: Filter to not see private lists must be done server side

		if (user) {
			return Institutions.find({"users": {$ne: user._id}, "private": "0"}, {sort: {name: 1}});
		}

		return Institutions.find({"private": 0}, {sort: {name: 1}});
	};

	Template.institutionslist.myInstitutions = function () {
		var user = Meteor.user();
		if (user) {
			return Institutions.find({users: user._id}, {sort: {name: 1}});
		}
		return "";
	};

	Template.institutionslist.user = function () {
		return Meteor.user();
	};

	Template.patientlist.patients = function () {
		var patients = Patients.find({}, {sort: {position: 1, name: -1}});
		return patients.fetch();
	};

	Template.patientlist.selected_name = function () {
		var patient = Patients.findOne(Session.get("selected_patient"));
		return patient && patient.name;
	};

	Template.patientlist.institution_name = function () {
		var institution = Institutions.findOne({_id: Session.get('current_institution')});
		if (institution)
			return institution.name;
		return "";
	};

	Template.patientlist.isAdmin = function () {
		var institution = Institutions.findOne({_id: Session.get('current_institution')});
		if (!institution || !institution.users)
			return false;
		return ($.inArray(Meteor.user()._id, institution.users) != -1);
	};

	Template.patient.active = function () {
		return Session.equals("selected_patient", this._id) ? "active" : '';
	};

	Template.institution.active = function () {
		return Session.equals("current_institution", this._id) ? "active" : '';
	};


	//EVENTS
	Template.nav.events({
		'click .login': function (event) {
			changePage('login');
		},
		'click .profil': function (event) {
			changePage('profil');
		},
		'click .logout': function (event) {
			Meteor.logout(function (error) {
				if (error) outputErrors(error);
			});
		},
		'click .logo': function (event) {
			$('.navbar .nav li').removeClass('active');
			$('.navbar .nav li.main').addClass('active');
			changePage('main');
		},
		'click .institution': function (event) {
			var target = $(event.target).parent();
//            if(currentPage == 'create-institution' && !target.hasClass('add')) {
//                $('.navbar .institutions li.add').removeClass('active');
//                changePage('main');
//            }
//            else if(target.hasClass('add')) {
//                $('.navbar .institutions li').removeClass('active');
//                changePage('create-institution');
//            }
//            target.addClass('active');
			if (target.hasClass('add')) {
				var content = $('.container-create-institution');
				content.show();
				$.fancybox({
					content: content
				});
			}
		}
	});

	Template.login.events({
		'click .switch-create': function () {
			Session.set('loginState', "create");
		},
		'click .switch-login': function () {
			Session.set('loginState', "login");
		},
		'click .switch-retrieve': function () {
			Session.set('loginState', "retrieve");
		},
		'click .btn': function () {
			var state = Session.get('loginState'),
					email = $('.container-login .login-email').val(),
					name = $('.container-login .login-name').val(),
					password = $('.container-login .login-password').val();

			if (state == "create") {
				createAccount(name, email, password);
			}
			else if (state == "login") {
				Meteor.loginWithPassword({email: email}, password, function (error) {
					if (error) outputErrors(error);
					else {
						$.fancybox.close();
						outputSuccess('You are now logged in.');
						changePage('main');
					}
				});
			}
			else if (state == "retrieve") {

			}
		}
	});

	Template.createInstitution.events({
		'click .btn-add-institution': function () {
			var name = $('input.institution-name').val(),
					isPrivate = $('input[name=private]:checked').val();
			Meteor.call("create_institution", name, isPrivate, function (error) {
				if (error) {
					outputErrors(error);
				}
				else {
					changePage('main');
					outputSuccess('New institution created.');
					$.fancybox.close();
				}
			});
		}
	});

	Template.institution.events({
		'click': function () {
			Session.set("current_institution", this._id);
			updatePatients();
		}
	});

	Template.patient.events({
		'click .delete': function () {
			Meteor.call('delete_patient', this._id, Session.get("current_institution"));
			updatePatients();
		},
		'click .alert-icon': function () {
			$.fancybox({
				content: $('.container-add-alert')
			});
		}
	});

	Template.patientlist.events({
		'click a.up': function () {
			if (Session.get("selected_patient_position") > 1) {
				var switching_patient = Patients.findOne({position: Session.get("selected_patient_position") - 1});
				Patients.update(Session.get("selected_patient"), {$inc: {position: -1}});
				Patients.update(switching_patient._id, {$inc: {position: +1}});
				Session.set("selected_patient_position", Session.get("selected_patient_position") - 1);
			}
		},
		'click a.down': function () {
			var switching_patient = Patients.findOne({position: Session.get("selected_patient_position") + 1});
			if (switching_patient) {
				Patients.update(Session.get("selected_patient"), {$inc: {position: 1}});
				Patients.update(switching_patient._id, {$inc: {position: -1}});
				Session.set("selected_patient_position", Session.get("selected_patient_position") + 1);
			}
		},
		'click a.add': function () {
			var name = $('.addPatient').val(),
					position = $('.patient').length + 1,
					institution = Session.get("current_institution");
			if (name && position && institution) {
				Meteor.call("create_patient", name, position, institution, function (error, patient_id) {
					outputErrors(error);
				});
			}
		},
		'click a.repair': function () {
			updatePatients();
		},
		'click a.empty': function () {
			//TODO: empty institution
			Meteor.call('empty_institution', Session.get("current_institution"), function (res) {

			});
		},
		'click a.delete': function () {
			//TODO: delete institution
			Meteor.call('delete_institution', Session.get("current_institution"), function (res) {

			});
		},
		'click .viewmode': function (e) {
			if (!viewmode_properties) {
				viewmode_properties = {
					'elTitle': $('.navbar-fixed-top'),
					'elMenu': $('.navbar'),
					'elContent': $('.content'),
					'elBody': $('body'),
					'elLogout': $('.btn.logout'),
					'elAdminPanel': $('.admin_panel')
				};
			}

			// Switch back to normal mode
			if (viewmode_properties.elBody.hasClass('listview')) {
				viewmode_properties.elTitle.slideDown();
				viewmode_properties.elMenu.animate({'left': 0});
				viewmode_properties.elLogout.animate({'left': 0});
				viewmode_properties.elContent.animate({'paddingLeft': 270});
				viewmode_properties.elBody.removeClass('listview');
				if (viewmode_properties.elAdminPanel)
					viewmode_properties.elAdminPanel.slideDown();
				$(e.srcElement).html('Switch to list view');
				//Switch to list mode
			} else {
				viewmode_properties.elTitle.slideUp();
				viewmode_properties.elMenu.animate({'left': -250});
				viewmode_properties.elLogout.animate({'left': -250});
				viewmode_properties.elContent.animate({'paddingLeft': 20});
				viewmode_properties.elBody.addClass('listview');
				if (viewmode_properties.elAdminPanel)
					viewmode_properties.elAdminPanel.slideUp();
				$(e.srcElement).html('Switch to normal view');
			}

		}
	});

	Template.patient.events({
		'click': function () {
			Session.set("selected_patient", this._id);
			Session.set("selected_patient_position", this.position);
		}
	});

	Template.patientlist.rendered = function () {
		renderPatientlistTemplate();
	};

	Meteor.startup(function () {
		bindEvents();
	});
}


//VARS


var spinner_opts = {
	lines: 11, // The number of lines to draw
	length: 0, // The length of each line
	width: 5, // The line thickness
	radius: 11, // The radius of the inner circle
	corners: 1, // Corner roundness (0..1)
	rotate: 0, // The rotation offset
	color: '#000', // #rgb or #rrggbb
	speed: 1.3, // Rounds per second
	trail: 54, // Afterglow percentage
	shadow: true, // Whether to render a shadow
	hwaccel: true, // Whether to use hardware acceleration
	className: 'spinner', // The CSS class to assign to the spinner
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	top: '20px', // Top position relative to parent in px
	left: '20px' // Left position relative to parent in px
};

var viewmode_properties = null;


//FUNCTIONS

function renderPatientlistTemplate() {
	var patients_container = $(".patientlist"),
			list_rendered = false,
			total_patients = 0,
			row_split = 8;

	if (patients_container.length) {
		list_rendered = true;
		total_patients = patients_container.find('li').length;
	}

	if (list_rendered && patients_container.hasClass('sortable')) {
		patients_container.sortable({
			update: function (event, ui) {
				updatePatients();
			}
		});
	}

	if (list_rendered && total_patients > row_split) {
		patients_container.addClass('two_columns');
	}
	else if (list_rendered) {
		patients_container.removeClass('two_columns');
	}
}

function bindEvents() {
	$('body').on('click', '.no-link', function () {
		event.stopPropagation();
		return false;
	});
	$('body').on('click', '.alerts li', function () {
		$(this).stop(true, false).animate({
			opacity: 0,
			height: 0
		}, 500, function () {
			$(this).remove();
		});
	})
}

function applySortable() {
	$(".patientlist").sortable({
		update: function (event, ui) {
			updatePatients();
		}
	});
}

function createAccount(name, email, password) {
	if (!password || password.length < 5)
		outputErrors("Your password needs to be at least 5 characters.");
	else {
		$('.container-login .btn').hide();
		spinner = addSpinner($('.container-login .loading')[0]);
		Accounts.createUser({email: email, password: password, profile: {name: name}}, function (error) {
			$('.container-login .btn').show();
			spinner.stop();
			if (error) outputErrors(error);
			else {
				Meteor.loginWithPassword({email: email}, password, function (error) {
					if (error) outputErrors(error);
				});
				$.fancybox.close();
				outputSuccess('Your account has been created.');
				changePage('main');
			}
		});
	}
}


function updatePatients() {
	//TODO: move this server side?
	var patients = $('.patientlist .patient');
	$.each(patients, function (index, patient) {
		Meteor.call("update_patient", $(patient).data('id'), index + 1, Session.get('current_institution'), function (error, patient_id) {
			outputErrors(error);
		});
	});
}


function addSpinner(el) {
	//DOM is constantly refreshed by meteor , so we need to create a new spinner everytime, otherwise we get strange behaviors
	//TODO: use template preserve ?
	var new_spinner = new Spinner(spinner_opts).spin();
	$(el).append(new_spinner.el);
	return new_spinner;
}

function changePage(newPage) {
	if (newPage == "login") {
		var container = $('.container-' + newPage);
		container.show();
		$.fancybox({
			content: container
		});
	}
	else {
		if (newPage != currentPage) {
			var oldPage = currentPage;
			$('.container-' + oldPage).stop(true, false).slideToggle('fast', function () {
				$('.container-' + newPage).stop(true, false).slideToggle('fast');
			});
			currentPage = newPage;
		}
	}
}

function outputErrors(error) {
	var msg = "";
	if (error) {
		if (error.reason) // Account creation error
			msg = error.reason;
		else
			msg = error;
		$('.alerts ul').append('<li class="btn-danger">' + msg + '<span class="close"></span></li>');
		var item = $('.alerts li').last();

		animateOutput(item);
	}
}

function outputSuccess(msg) {
	$('.alerts ul').append('<li class="btn-success">' + msg + '<span class="close"></span></li>');
	var item = $('.alerts li').last();

	animateOutput(item);
}

function animateOutput(item) {
	var height = item.height() + 10;
	item.css({'height': 0});
	item.animate({
		opacity: 1,
		height: height
	}, 500, function () {
		setTimeout(function () {
			item.animate({
				opacity: 0,
				height: 0
			}, 500, function () {
				item.remove();
			});
		}, 5000);
	});
}


//TODO: Delete list , empty list
//TODO: Email / Text alerts for subscribed events
//TODO: Add html5shiv / test on ie
//TODO: Search institutions
//TODO: http://www.abitibiexpress.ca/Soci%C3%A9t%C3%A9/Sant%C3%A9/2013-01-15/article-3156769/Lurgence-du-CSSSRN-un-modele-pour-le-reste-du-Quebec/1
//TODO: domaine name : easylivelist , whenismyturn , waittimetracking , aquandmontour