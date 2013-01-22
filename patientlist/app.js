Patients = new Meteor.Collection("patients");
Institutions = new Meteor.Collection("institutions");

if (Meteor.isClient) {
    Meteor.subscribe('institutions',null,function(){
        //TODO: better way to point to the first element id
        Session.set("current_institution", Institutions.find({}, {sort:{name:1},limit:1}).fetch()[0]._id);
        Meteor.autosubscribe(function(){
            Meteor.subscribe('patients',Session.get("current_institution"));
        });
    });


    Template.institutionslist.institutions = function () {
        return Institutions.find({}, {sort:{name:1}});
    };

    Template.institution.events({
        'click':function () {
            Session.set("current_institution", this._id);
            updatePatients();
        }
    });


    Template.patientlist.patients = function () {
        return Patients.find({}, {sort:{position:1, name:-1}});
    };

    Template.patientlist.selected_name = function () {
        var patient = Patients.findOne(Session.get("selected_patient"));
        return patient && patient.name;
    };

    Template.patient.selected = function () {
        return Session.equals("selected_patient", this._id) ? "selected" : '';
    };

    Template.patientlist.events({
        'click input.up':function () {
            if (Session.get("selected_patient_position") > 1) {
                var switching_patient = Patients.findOne({position:Session.get("selected_patient_position") - 1});
                Patients.update(Session.get("selected_patient"), {$inc:{position:-1}});
                Patients.update(switching_patient._id, {$inc:{position:+1}});
                Session.set("selected_patient_position", Session.get("selected_patient_position") - 1);
            }
        },
        'click input.down':function () {
            var switching_patient = Patients.findOne({position:Session.get("selected_patient_position") + 1});
            if (switching_patient) {
                Patients.update(Session.get("selected_patient"), {$inc:{position:1}});
                Patients.update(switching_patient._id, {$inc:{position:-1}});
                Session.set("selected_patient_position", Session.get("selected_patient_position") + 1);
            }
        },
        'click input.repair':function () {
            updatePatients();
        },
				'click input.reset':function () {
            resetCollections();
        }
    });

    Template.patientlist.rendered = function () {
        $(".patientlist").sortable({
            start: function (event,ui) {

            },
            update: function (event,ui) {
                updatePatients();
            }
        });
    };

    Template.patient.events({
        'click':function () {
            Session.set("selected_patient", this._id);
            Session.set("selected_patient_position", this.position);
        }
    });

}


if (Meteor.isServer) {
    Meteor.publish("institutions", function () {
        return Institutions.find({});
    });
    Meteor.publish("patients", function (institution) {
        return Patients.find({institution:institution});
    });
    Meteor.startup(function () {
				fillCollections();
    });
}





function updatePatients(){
//    var institutions = [];
//    $('.institution').each(function(index,el){
//        institutions.push($(el).data('id'));
//    });
    $('.patient').each(function(index,patient){
        Patients.update($(patient).data('id'), {$set:{position:index + 1}});
//        var institution = institutions[Math.floor(Math.random() * institutions.length)];
//        Patients.update($(patient).data('id'), {$set:{institution:institution}});
    });
}

function resetCollections() {
	deleteCollections();
	fillCollections();
}

function deleteCollections() {
	Institutions.find({}).forEach(function(institution){
		Institutions.remove({id: institution._id});
		Patients.remove({institution: institution._id});
	});
}

function fillCollections () {
		//Add institutions
		if(Institutions.find().count() === 0) {
				var institutions = ["Institution 1",
						"Institution 2",
						"Institution 3"];
				for (var i = 0; i < institutions.length; i++)
						Institutions.insert({name:institutions[i]});
		}

		//Add patients
		if (Patients.find().count() === 0) {
				var institutions = [];
				Institutions.find().forEach(function(institution){
					institutions.push(institution._id);
				});
				var names = ["Ada Lovelace",
						"Grace Hopper",
						"Marie Curie",
						"Carl Friedrich Gauss",
						"Nikola Tesla",
						"Claude Shannon"];
				for (var i = 0; i < names.length; i++) {
						var institution = institutions[Math.floor(Math.random() * institutions.length)];
						Patients.insert({name:names[i], position:i, institution: institution});
				}
		}
}