Patients = new Meteor.Collection("patients");

if (Meteor.isClient) {
		Meteor.subscribe('patients');
		Template.patientlist.patients = function () {
				return Patients.find({}, {sort: {position: 1, name: -1}});
		};

		Template.patientlist.selected_name = function () {
				var patient = Patients.findOne(Session.get("selected_patient"));
				return patient && patient.name;
		};

		Template.patient.selected = function () {
				return Session.equals("selected_patient", this._id) ? "selected" : '';
		};

		Template.patientlist.events({
				'click input.up': function () {
						if(Session.get("selected_patient_position")>1){
							var switching_patient = Patients.findOne({position: Session.get("selected_patient_position")-1});
							Patients.update(Session.get("selected_patient"), {$inc: {position: -1}});
							Patients.update(switching_patient._id,{$inc: {position: +1}});
							Session.set("selected_patient_position", Session.get("selected_patient_position")-1);
						}
				},
				'click input.down': function () {
						var switching_patient = Patients.findOne({position: Session.get("selected_patient_position")+1});
						if(switching_patient){
							Patients.update(Session.get("selected_patient"), {$inc: {position: 1}});
							Patients.update(switching_patient._id,{$inc: {position: -1}});
							Session.set("selected_patient_position", Session.get("selected_patient_position")+1);
						}
				},
				'click input.reset': function () {
						var patients = Patients.find(),
								count = 0;

						patients.forEach(function (patient) {
							Patients.update(patient._id, {$set: {position: count+1}});
							count += 1;
						});
				}
		});

		Template.patientlist.rendered = function() {
				$(".patientlist").sortable();
		};

		Template.patient.events({
				'click': function () {
						Session.set("selected_patient", this._id);
						Session.set("selected_patient_position", this.position);
				}
		});

}





if (Meteor.isServer) {
    Meteor.publish("patients", function(test) {
        return Patients.find({});
    });
    Meteor.startup(function () {
        if (Patients.find().count() === 0) {
						var names = ["Ada Lovelace",
					                "Grace Hopper",
					                "Marie Curie",
					                "Carl Friedrich Gauss",
					                "Nikola Tesla",
					                "Claude Shannon"];
            for (var i = 0; i < names.length; i++)
                Patients.insert({name: names[i], position: i});
        }
    });
}
