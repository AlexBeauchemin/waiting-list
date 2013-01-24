// PUBLISH

Meteor.publish("institutions", function () {
    return Institutions.find({});
});
Meteor.publish("patients", function (institution) {
    return Patients.find({institution:institution});
});




//METHODS

Meteor.methods({
	create_patient: function(name,position,institution) {
        var patient_id = Patients.insert({name: name,position: position, institution: institution});
        return patient_id;
	},
    update_patient: function(id,position){
        Patients.update(id, {$set:{position:position}});
    },
	empty: null // To avoid adding, removing comas for last item
});




//Authorizations

//TODO: Authorizations
//Patients.allow({
//  insert: function (userId, patient) {
//    // the user must be logged in, and the document must be owned by the user
//    return (userId && patient.owner === userId);
//  },
//  update: function (userId, docs, fields, modifier) {
//    // can only change your own documents
//    return _.all(docs, function(doc) {
//      return doc.owner === userId;
//    });
//  },
//  remove: function (userId, docs) {
//    // can only remove your own documents
//    return _.all(docs, function(doc) {
//      return doc.owner === userId;
//    });
//  },
//  fetch: ['owner']
//});
//
//Patients.deny({
//  update: function (userId, docs, fields, modifier) {
//    // can't change owners
//    return _.contains(fields, 'owner');
//  },
//  remove: function (userId, docs) {
//    // can't remove locked documents
//    return _.any(docs, function (doc) {
//      return doc.locked;
//    });
//  },
//  fetch: ['locked'] // no need to fetch 'owner'
//});