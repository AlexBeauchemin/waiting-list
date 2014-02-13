//---------------------------------------------------
// VARS
//---------------------------------------------------

Template.addAlert.patientName = function () {
  return Session.get("selected_patient_name");
};

Template.addAlert.patientId = function () {
  return Session.get("selected_patient");
};

Template.addAlert.patientPos = function () {
  return Session.get("selected_patient_pos");
};



//---------------------------------------------------
// EVENTS
//---------------------------------------------------

Template.addAlert.events({
  'click .btn': function (el) {
    var $form = $(el.srcElement).closest('form'),
      direction = $form.find('select[name="direction"]').val(),
      id = $form.find('input[name="id"]').val(),
      pos = $form.find('input[name="pos"]').val();

    Meteor.call('add_alert', id, pos, direction, function (error) {
      if (error) {
        Helpers.outputErrors(error);
      }
      else {
        Helpers.outputSuccess('New alert created.');
        $.fancybox.close();
      }
    });
  }
});