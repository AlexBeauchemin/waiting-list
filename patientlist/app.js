// Set up a collection to contain patient information. On the server,
// it is backed by a MongoDB collection named "patients".
Patients = new Meteor.Collection("patients");

if (Meteor.isClient) {
    Meteor.subscribe('patients');
    console.log(Patients.find().count());
    Template.patientlist.patients = function () {
        return Patients.find({}, {sort: {score: -1, name: 1}});
    };

    Template.patientlist.selected_name = function () {
        var patient = Patients.findOne(Session.get("selected_patient"));
        return patient && patient.name;
    };

    Template.patient.selected = function () {
        return Session.equals("selected_patient", this._id) ? "selected" : '';
    };

    Template.patientlist.events({
        'click input.inc': function () {
            Patients.update(Session.get("selected_patient"), {$inc: {score: 5}});
        }
    });

    Template.patient.events({
        'click': function () {
            Session.set("selected_patient", this._id);
        }
    });
}

// On server startup, create some patients if the database is empty.
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
