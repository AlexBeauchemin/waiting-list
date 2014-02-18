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

Template.addAlert.institutionId = function () {
  return Session.get("current_institution");
};



//---------------------------------------------------
// EVENTS
//---------------------------------------------------

Template.addAlert.events({
  'click .btn': function (el) {
    var $form = $(el.srcElement).closest('form'),
      direction = $form.find('select[name="direction"]').val(),
      institution = $form.find('input[name="institution"]').val(),
      onetime = $form.find('input[name="onetime"]').is(':checked'),
      patient = $form.find('input[name="id"]').val(),
      pos = $form.find('input[name="pos"]').val();

    Meteor.call('add_alert', institution, patient, pos, direction, onetime, function (error) {
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