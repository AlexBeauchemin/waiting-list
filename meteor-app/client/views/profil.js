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

//---------------------------------------------------
// EVENTS
//---------------------------------------------------

Template.profil.events({
  'click [data-action="delete"]': function () {
    Meteor.call('delete_alert', this._id);
  },
  'click td': function(e) {
    var $target = $(e.target);
    if(!$target.hasClass('actions')) {
      Session.set("current_institution", $target.parent('tr').attr('data-id'));
      Helpers.changePage('main');
    }
  }
});