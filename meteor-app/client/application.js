//SUBSCRIPTIONS
Session.set('loginState', "login");
Meteor.subscribe('institutions', null, function () {
  if(Institutions) {
    var path = window.location.pathname.split('/');
    if(path.length > 1 && path[1]) {
      var defaultInstitution = Institutions.findOne({"url": path[1]});
      if(defaultInstitution) Session.setDefault('current_institution', defaultInstitution._id);
    }

    Meteor.autorun(function () {
      Meteor.subscribe('patients', Session.get("current_institution"));
      Meteor.subscribe('alerts');
    });
  }
});

Meteor.startup(function () {
  Helpers.init();
});

//TODO: Allow public/private switch for institution
//TODO: Visual hint to know if institution is private or public when administrator

//TODO: Use meteorite?

//TODO: Email alerts for subscribed events
//TODO: Add html5shiv / test on ie

//TODO: http://www.abitibiexpress.ca/Soci%C3%A9t%C3%A9/Sant%C3%A9/2013-01-15/article-3156769/Lurgence-du-CSSSRN-un-modele-pour-le-reste-du-Quebec/1
//TODO: domaine name : easylivelist , whenismyturn , waittimetracking , aquandmontour, waitinglist, openlist, waitingroom, wailst

//TODO: Keep meteor running on amazon EC2 : http://stackoverflow.com/questions/21447818/keep-meteor-running-on-amazon-ec2