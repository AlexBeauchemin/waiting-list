//SUBSCRIPTIONS
Session.set('loginState', "login");
Meteor.subscribe('institutions', null, function () {
  if(Institutions) {
    var defaultInstitution = Institutions.findOne({"private": "0"}, {sort: {name: 1}});
    if(defaultInstitution) Session.setDefault('current_institution', defaultInstitution._id);

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

//TODO: Use meteorite? nprogress + fontawesome

//TODO: Remove less package and use grunt instead
//TODO: Email alerts for subscribed events
//TODO: Add html5shiv / test on ie
//TODO: Search institutions

//TODO: http://www.abitibiexpress.ca/Soci%C3%A9t%C3%A9/Sant%C3%A9/2013-01-15/article-3156769/Lurgence-du-CSSSRN-un-modele-pour-le-reste-du-Quebec/1
//TODO: domaine name : easylivelist , whenismyturn , waittimetracking , aquandmontour