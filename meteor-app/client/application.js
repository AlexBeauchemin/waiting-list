//SUBSCRIPTIONS
Session.set('loginState', "login");

Meteor.subscribe('institutions', null, function () {
  if(Institutions) {
    var defaultInstitution = Institutions.findOne({"private": "0"}, {sort: {name: 1}});
    if(defaultInstitution && defaultInstitution.length) {
      Session.set("current_institution", defaultInstitution._id);
    }

    Meteor.autorun(function () {
      Meteor.subscribe('patients', Session.get("current_institution"));
      Meteor.subscribe('alerts');
      Meteor.subscribe('userData', null, function () {
        //console.log('Userdata:',Meteor.user().profile);
      });
    });
  }
});

Meteor.startup(function () {
  Helpers.init();
});

//TODO: Allow public/private switch for institution
//TODO: Visual hint to know if institution is private or public when administrator