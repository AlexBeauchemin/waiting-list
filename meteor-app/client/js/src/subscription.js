//SUBSCRIPTIONS
Session.set('loginState', "login");

Meteor.subscribe('institutions', null, function () {
  //TODO: better way to point to the first element id
  if(Institutions) {
    var defaultInstitution = Institutions.find({"public": true}, {sort: {name: 1}, limit: 1}).fetch();
    if(defaultInstitution.length) {
      Session.set("current_institution", defaultInstitution[0]._id);
    }

    Meteor.autosubscribe(function () {
      Meteor.subscribe('patients', Session.get("current_institution"));
      Meteor.subscribe('userData', null, function () {
        //console.log('Userdata:',Meteor.user().profile);
      });
    });
  }
});

