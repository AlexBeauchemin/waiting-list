Template.profil.alerts = function () {
  var alerts = Alerts.find({}, {sort: [["dateAdded","desc"]]}).fetch();
  if(alerts.length) {
    alerts.forEach(function(alert) {
      Meteor.call('getPatientName', alert.patientId, function(error,name){
        alert.patientName = name;
      });
    });
  }

  //TODO: Need a better way to handle relational table in mongodb
  //See http://stackoverflow.com/questions/12764307/meteor-trouble-using-return-value-from-meteor-call
  //https://www.discovermeteor.com/blog/reactive-joins-in-meteor/
  //http://stackoverflow.com/questions/15511191/change-collection-before-publishing

  return alerts;
};

Template.profil.favorites = function () {
  var user = Meteor.user();

  if (user) {
    var favorites = Meteor.user().profile.favorites;
    if(!favorites) favorites = [];
    return Institutions.find({_id: {$in: favorites}});
  }
  return "";
};

//---------------------------------------------------
// EVENTS
//---------------------------------------------------

Template.profil.events({
  'click [data-action="delete-event"]': function () {
    Meteor.call('deleteAlert', this._id);
  },
  'click [data-action="delete-favorite"]': function () {
    Meteor.call('removeFavorite', this._id);
  },
  'click td a': function(e) {
    var $target = $(e.target);
      Session.set("current_institution", $target.closest('tr').attr('data-id'));
      Helpers.changePage('main');
  }
});