Patients = new Meteor.Collection("patients");
Institutions = new Meteor.Collection("institutions");
AllUsers = new Meteor.Collection("allUsers");
UserData = new Meteor.Collection("userData");

//CLIENT ACTIONS
if (Meteor.isClient) {

	//VARS
    var currentPage = "main";
	var isLoginVisible = false;
	var spinner = null;
	Session.set('loginState',"login");


	//SUBSCRIPTIONS
	Meteor.subscribe('institutions', null, function () {
		//TODO: better way to point to the first element id
		Session.set("current_institution", Institutions.find({}, {sort:{name:1}, limit:1}).fetch()[0]._id);
		Meteor.autosubscribe(function () {
			Meteor.subscribe('patients', Session.get("current_institution"));
            Meteor.subscribe('allUsers',null , function() { console.log('Allusers:',Meteor.users.find().fetch()) }); //TODO: For testing only, remove this
            Meteor.subscribe('userData', null, function() { console.log('Userdata:',Meteor.user().profile)});
		});
	});




	//FEED TEMPLATES
	Template.login.stateIs = function (state) {
		return state === Session.get("loginState");
	};

	Template.institutionslist.institutions = function () {
		return Institutions.find({}, {sort:{name:1}});
	};

	Template.institutionslist.user = function() {
		return Meteor.user();
	};

	Template.patientlist.patients = function () {
		return Patients.find({}, {sort:{position:1, name:-1}});
	};

	Template.patientlist.selected_name = function () {
		var patient = Patients.findOne(Session.get("selected_patient"));
		return patient && patient.name;
	};

    Template.patientlist.isAdmin = function(){
        var institution = Institutions.findOne({_id:Session.get('current_institution')});
        if(!institution || !institution.users)
            return false;
        return ($.inArray(Meteor.user()._id,institution.users) != -1);
    };

	Template.patient.active = function () {
		return Session.equals("selected_patient", this._id) ? "active" : '';
	};

	Template.institution.active = function () {
		return Session.equals("current_institution", this._id) ? "active" : '';
	};


	//EVENTS
	Template.header.events({
		'click .login':function() {
			changePage('login');
		},
		'click .logout': function() {
			Meteor.logout(function(error){
				if(error) outputErrors(error);
			});
		},
        'click .brand, click .main': function(){
            changePage('main');
        }
	});

	Template.login.events({
		'click .switch-create': function(){
			Session.set('loginState',"create");
		},
		'click .switch-login': function(){
			Session.set('loginState',"login");
		},
		'click .switch-retrieve': function(){
			Session.set('loginState',"retrieve");
		},
		'click .btn': function(){
			var state = Session.get('loginState'),
					email = $('.container-login .login-email').val(),
					name = $('.container-login .login-name').val(),
					password = $('.container-login .login-password').val();

			if(state=="create"){
				createAccount(name,email,password);
			}
			else if(state=="login"){
				Meteor.loginWithPassword({email:email}, password, function(error){
					if(error) outputErrors(error);
					//TODO: Show success message
				});
			}
			else if(state=="retrieve"){

			}
		}
	});

	Template.institutionslist.events({
		'click .btn-add-instution': function(){
			var name = $('input.institution-name').val();
			Meteor.call("create_institution", name, function (error) {
				outputErrors(error);
			});
		}
	});

	Template.institution.events({
		'click':function () {
			Session.set("current_institution", this._id);
			updatePatients();
		}
	});

	Template.patient.events({
		'click .delete':function () {
			Patients.remove({_id:this._id});
			updatePatients();
		}
	});

	Template.patientlist.events({
		'click a.up':function () {
			if (Session.get("selected_patient_position") > 1) {
				var switching_patient = Patients.findOne({position:Session.get("selected_patient_position") - 1});
				Patients.update(Session.get("selected_patient"), {$inc:{position:-1}});
				Patients.update(switching_patient._id, {$inc:{position:+1}});
				Session.set("selected_patient_position", Session.get("selected_patient_position") - 1);
			}
		},
		'click a.down':function () {
			var switching_patient = Patients.findOne({position:Session.get("selected_patient_position") + 1});
			if (switching_patient) {
				Patients.update(Session.get("selected_patient"), {$inc:{position:1}});
				Patients.update(switching_patient._id, {$inc:{position:-1}});
				Session.set("selected_patient_position", Session.get("selected_patient_position") + 1);
			}
		},
		'click a.add':function () {
			var name = $('.addPatient').val(),
					position = $('.patient').length + 1,
					institution = Session.get("current_institution");
			if (name && position && institution) {
				Meteor.call("create_patient", name, position, institution, function (error, patient_id) {
					outputErrors(error);
				});
			}
		},
		'click a.repair':function () {
			updatePatients();
		},
		'click a.reset':function () {
			deleteCollections();
		}
	});

	Template.patient.events({
		'click':function () {
			Session.set("selected_patient", this._id);
			Session.set("selected_patient_position", this.position);
		}
	});

	Template.patientlist.rendered = function () {
		bindEvents();
	};
}

function bindEvents() {
	$(".patientlist").sortable({
		start:function (event, ui) {

		},
		update:function (event, ui) {
			updatePatients();
		}
	});

	$('body').on('click', '.no-link', function () {
		event.stopPropagation();
		return false;
	});
    $('body').on('click', '.alerts li', function() {
        $(this).stop(true,false).animate({
            opacity: 0,
            height: 0
        }, 500, function(){
            $(this).remove();
        });
    })
}

function createAccount(name,email,password){
	if(!password || password.length<5)
		outputErrors("Your password needs to be at least 5 characters.");
	else {
		$('.container-login .btn').hide();
		var spinner = addSpinner($('.container-login .loading')[0]);
		Accounts.createUser({email:email,password:password, profile: {name: name}},function(error){
			$('.container-login .btn').show();
			spinner.stop();
			if(error) outputErrors(error);
			else {
				Meteor.loginWithPassword({email:email}, password, function(error){
					if(error) outputErrors(error);
				});
				//TODO: Show success message
				changePage('main');
			}
		});
	}
}


function updatePatients() {
	$('.patient').each(function (index, patient) {
		Meteor.call("update_patient", $(patient).data('id'), index + 1, function (error, patient_id) {
			outputErrors(error);
		});
	});
}

function deleteCollections() {
	Institutions.find({}).forEach(function (institution) {
		Institutions.remove({id:institution._id});
		Patients.remove({institution:institution._id});
	});
}

function addSpinner(el){
	//DOM is constantly refreshed by meteor , so we need to create a new spinner everytime, otherwise we get strange behaviors
    //TODO: use template preserve ?
	spinner = new Spinner(spinner_opts).spin();
	$(el).append(spinner.el);
	return spinner;
}

function changePage(newPage){
    if(newPage != currentPage){
        var oldPage = currentPage;
        $('.container-' + oldPage).stop(true, false).slideToggle('fast', function () {
            $('.container-' + newPage).stop(true, false).slideToggle('fast');
        });
        currentPage = newPage;
    }
}

function outputErrors(error) {
	//TODO: Add environements (dev = show errors , prod = hide errors);
	//TODO: Output the error to the screen
    var msg = "";
	if(error) {
		if(error.reason) // Account creation error
			msg = error.reason;
		else
			msg = error;
        $('.alerts ul').append('<li class="btn-danger">' + msg + '<span class="close"></span></li>');
        var item = $('.alerts li').last();
        var height = item.height();
        item.css({'height':0});
        item.animate({
            opacity: 1,
            height: height
        }, 500, function() {
            setTimeout(function(){
                item.animate({
                    opacity: 0,
                    height: 0
                }, 500, function(){
                    item.remove();
                });
            },5000);
        });

	}
}




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


//TODO: http://www.abitibiexpress.ca/Soci%C3%A9t%C3%A9/Sant%C3%A9/2013-01-15/article-3156769/Lurgence-du-CSSSRN-un-modele-pour-le-reste-du-Quebec/1