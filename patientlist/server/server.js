Meteor.publish("institutions", function () {
    return Institutions.find({});
});
Meteor.publish("patients", function (institution) {
    return Patients.find({institution:institution});
});
