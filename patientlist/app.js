Patients = new Meteor.Collection("patients");
Institutions = new Meteor.Collection("institutions");

//CLIENT ACTIONS
if (Meteor.isClient) {

	//VARS
	var isLoginVisible = false;
	Session.set('loginState',{create:true,login:false,retrieve:false});

	//SUBSCRIPTIONS
	Meteor.subscribe('institutions', null, function () {
		//TODO: better way to point to the first element id
		Session.set("current_institution", Institutions.find({}, {sort:{name:1}, limit:1}).fetch()[0]._id);
		Meteor.autosubscribe(function () {
			Meteor.subscribe('patients', Session.get("current_institution"));
		});
	});


	//FEED TEMPLATES
	Template.login.state = function () {
		return Session.get("loginState");
	};

	Template.institutionslist.institutions = function () {
		return Institutions.find({}, {sort:{name:1}});
	};

	Template.patientlist.patients = function () {
		return Patients.find({}, {sort:{position:1, name:-1}});
	};

	Template.patientlist.selected_name = function () {
		var patient = Patients.findOne(Session.get("selected_patient"));
		return patient && patient.name;
	};

	Template.patient.active = function () {
		return Session.equals("selected_patient", this._id) ? "active" : '';
	};

	Template.institution.active = function () {
		return Session.equals("current_institution", this._id) ? "active" : '';
	};


	//EVENTS
	Template.header.events({
		'click .login':function () {
			if (!isLoginVisible) {
				isLoginVisible = true;
				$('.container-main').stop(true, false).slideToggle('fast', function () {
					$('.container-login').stop(true, false).slideToggle('fast');
				});
			}
			else {
				isLoginVisible = false;
				$('.container-login').stop(true, false).slideToggle('fast', function () {
					$('.container-main').stop(true, false).slideToggle('fast');
				});
			}
		}
	});

	Template.login.events({
		'click .switch-create': function(){
			Session.set('loginState',{create:true,login:false,retrieve:false});
		},
		'click .switch-login': function(){
			Session.set('loginState',{create:false,login:true,retrieve:false});
		},
		'click .switch-retrieve': function(){
			Session.set('loginState',{create:false,login:false,retrieve:true});
		},
		'click .btn': function(){
			var state = Session.get('loginState');
			if(state.create){
				var email = $('')
				Accounts.createUser({email:'',password:''},function(error){
					if(error)
						console.log(error);
				})
			}
			if(state.login){

			}
			if(state.retrieve){

			}
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

	$('body').on('click', '.patient a,a.btn, container-login .more a, .navbar-link.login', function () {
		event.stopPropagation();
		return false;
	});
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

function outputErrors(error) {
	//TODO: Add environements (dev = show errors , prod = hide errors);
	if(error)
		console.log(error);
}