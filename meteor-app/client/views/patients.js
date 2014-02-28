//---------------------------------------------------
// VARS
//---------------------------------------------------

Template.patient.active = function () {
  return Session.equals("selected_patient", this._id) ? "active" : '';
};

Template.patient.rendered = function() {
  NProgress.inc();
  Meteor.defer(function() {
    Helpers.animateIn(function() {
      NProgress.done();
    });
  });
};

Template.patientlist.patients = function () {
  Meteor.defer(function() {
      Helpers.changePage('main', true);
  });
  var patients = Patients.find({}, {sort: {position: 1, name: -1}});
  return patients.fetch();
};

Template.patientlist.selected_name = function () {
  var patient = Patients.findOne(Session.get("selected_patient"));
  return patient && patient.name;
};

Template.patientlist.institution_info = function () {
  var institution = Institutions.findOne({_id: Session.get('current_institution')});
  if (institution)
    return institution;
  return {};
};

Template.patientlist.isAdmin = function () {
  var institution = Institutions.findOne({_id: Session.get('current_institution')});

  if (!institution || !institution.users || !Meteor.user()) return false;
  return $.inArray(Meteor.user()._id, institution.users) != -1;
};

Template.patientlist.isLogged = function () {
  return Meteor.user();
};

Template.patientlist.isFavorite = function () {
  console.log(!(!Meteor.user() || !Meteor.user().profile.favorites || Meteor.user().profile.favorites.indexOf(Session.get('current_institution')) == -1));
  return !(!Meteor.user() || !Meteor.user().profile.favorites || Meteor.user().profile.favorites.indexOf(Session.get('current_institution')) == -1);
};



//---------------------------------------------------
// EVENTS
//---------------------------------------------------

Template.patient.events({
  'click .delete': function () {
    Meteor.call('deletePatient', this._id, Session.get("current_institution"));
//    setTimeout(function() {
      Helpers.updatePatients();
//    },1000);
  },
  'click .alert-icon': function () {
    $.fancybox({
      content: $('.container-add-alert')
    });
  },
  'click': function () {
    Session.set("selected_patient", this._id);
    Session.set("selected_patient_name", this.name);
    Session.set("selected_patient_pos", this.position);
  }
});

Template.patientlist.events({
  'click a.up': function () {
    if (Session.get("selected_patient_position") > 1) {
      var switching_patient = Patients.findOne({position: Session.get("selected_patient_position") - 1});
      Patients.update(Session.get("selected_patient"), {$inc: {position: -1}});
      Patients.update(switching_patient._id, {$inc: {position: +1}});
      Session.set("selected_patient_position", Session.get("selected_patient_position") - 1);
    }
  },
  'click a.down': function () {
    var switching_patient = Patients.findOne({position: Session.get("selected_patient_position") + 1});
    if (switching_patient) {
      Patients.update(Session.get("selected_patient"), {$inc: {position: 1}});
      Patients.update(switching_patient._id, {$inc: {position: -1}});
      Session.set("selected_patient_position", Session.get("selected_patient_position") + 1);
    }
  },
  'click a.add': function () {
    Helpers.addPatient($('.addPatient').val());
//      var name = $('.addPatient').val(),
//        position = $('.patient').length + 1,
//        institution = Session.get("current_institution");
//      if (name && position && institution) {
//        Meteor.call("createPatient", name, position, institution, function (error, patient_id) {
//          Helpers.outputErrors(error);
//        });
//      }
  },
  'click a.repair': function () {
    Helpers.updatePatients();
  },
  'click a.empty': function () {
    Meteor.call('emptyInstitution', Session.get("current_institution"), function (res) {
      Helpers.outputSuccess('Institution is now empty');
    });
  },
  'click a.delete': function () {
    Meteor.call('deleteInstitution', Session.get("current_institution"), function (res) {
      Helpers.outputSuccess('Institution deleted');
    });
  },
  'click a[data-action="save-description"]': function () {
    var description = $('#description').val();
    Meteor.call('updateInstitution', Session.get("current_institution"), {description: description}, function (res) {
      if (description) Helpers.outputSuccess('Description saved');
      else Helpers.outputSuccess('Description deleted');
      $('.description').children().toggleClass('hidden');
    });
  },
  'click a[data-action="cancel-description"]': function () {
    var $description = $('.description');
    $description.children().toggleClass('hidden');
    $description.find('textarea').val($description.children('.description-text').text());

  },
  'click span.description-text': function () {
    $('p.description').children().toggleClass('hidden');
    $('#description').trigger('focus');
  },
  'click .viewmode': function (e) {
    Helpers.toggleViewMode($(e.srcElement));
  },
  'click .btn-favorite': function(e) {
    var $button = $(e.srcElement);
    if(!$button.hasClass('.btn')) $button = $button.closest('.btn');
    var action = $button.attr('data-action');

//    $button.toggleClass('hidden');
//    $button.siblings('.btn').toggleClass('hidden');

    //TODO: Save/remove favorite
    if(action == 'add') {
      Meteor.call('addFavorite',Session.get("current_institution"));
    }
    else {
      Meteor.call('removeFavorite',Session.get("current_institution"));
    }
  },
  'keyup .addPatient': function (event) {
    if (event.keyCode == 13) {
      var $input = $(event.srcElement);
      Helpers.addPatient($input.val());
      $input.val('');
    }
  }
});

Template.patientlist.rendered = function () {
  Helpers.renderPatientlistTemplate();

  var instance = this;
  Meteor.defer(function() {
    $(instance.firstNode).removeClass('transparent');
  });
};