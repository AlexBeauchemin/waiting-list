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
  return !(!Meteor.user() || !Meteor.user().profile.favorites || Meteor.user().profile.favorites.indexOf(Session.get('current_institution')) == -1);
};



//---------------------------------------------------
// EVENTS
//---------------------------------------------------

Template.patient.events({
  'click .delete': function () {
    Meteor.call('deletePatient', this._id, Session.get("current_institution"));
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
  'click a.arrow-up': function () {
    if (Session.get("selected_patient_pos") > 1) {
      var switching_patient = Patients.findOne({position: Session.get("selected_patient_pos") - 1});
      Meteor.call('updatePatient', Session.get('selected_patient'), Session.get('current_institution'), { position: Session.get("selected_patient_pos") - 1});
      Meteor.call('updatePatient', switching_patient._id, Session.get('current_institution'), { position: Session.get("selected_patient_pos") });
      Session.set("selected_patient_pos", Session.get("selected_patient_pos") - 1);
    }
  },
  'click a.arrow-down': function () {
    var switching_patient = Patients.findOne({position: Session.get("selected_patient_pos") + 1});
    if (switching_patient) {
      Meteor.call('updatePatient', Session.get('selected_patient'), Session.get('current_institution'), { position: Session.get("selected_patient_pos") + 1 });
      Meteor.call('updatePatient', switching_patient._id, Session.get('current_institution'), { position: Session.get("selected_patient_pos") });
      Session.set("selected_patient_pos", Session.get("selected_patient_pos") + 1);
    }
  },
  'click a.add': function () {
    var $name = $('[name="addPatient"]'),
      name = $name.val(),
      priority = $name.siblings('[name="priority"]').val();

    Helpers.addPatient(name,priority);

  },
  'click [data-action="repair"]': function () {
    Helpers.updatePatients();
  },
  'click [data-action="empty"]': function () {
    Meteor.call('emptyInstitution', Session.get("current_institution"), function (res) {
      Helpers.outputSuccess('Institution is now empty');
    });
  },
  'click a[data-action="delete"]': function () {
    Meteor.call('deleteInstitution', Session.get("current_institution"), function (res) {
      Helpers.outputSuccess('Institution deleted');
    });
  },
  'click a[data-action="save-description"]': function (e) {
    var description = $('#description').val();
    Meteor.call('updateInstitution', Session.get("current_institution"), {description: description}, function (res) {
      if (description) Helpers.outputSuccess('Description saved');
      else Helpers.outputSuccess('Description deleted');
      $(e.srcElement).closest('p').children().toggleClass('hidden');
    });
  },
  'click a[data-action="cancel-description"]': function (e) {
    var $description = $(e.srcElement).closest('p');
    $description.children().toggleClass('hidden');
    $description.find('textarea').val($description.children('.text').text());
  },
  'click a[data-action="save-url"]': function (e) {
    var url = $('#url').val();
    Meteor.call('updateInstitutionUrl', Session.get("current_institution"), url, function (error) {
      if(error) {
        Helpers.outputErrors(error);
        return;
      }
      Helpers.outputSuccess('Url saved');
      $(e.srcElement).closest('p').children().toggleClass('hidden');
    });
  },
  'click a[data-action="cancel-url"]': function (e) {
    var $url = $(e.srcElement).closest('p');
    $url.children().toggleClass('hidden');
  },
  'click .description .text, click .url .text, click .edit-icon': function (e) {
    var $element = $(e.srcElement).closest('p');
    $element.children('span').toggleClass('hidden');
    $element.find('input,textarea').trigger('focus');
  },
  'click .viewmode': function (e) {
    Helpers.toggleViewMode($(e.srcElement));
  },
  'click .btn-favorite': function(e) {
    var $button = $(e.srcElement);
    if(!$button.hasClass('.btn')) $button = $button.closest('.btn');
    var action = $button.attr('data-action');

    if(action == 'add') Meteor.call('addFavorite',Session.get("current_institution"));
    else Meteor.call('removeFavorite',Session.get("current_institution"));
  },
  'keyup [name="addPatient"]': function (event) {
    if (event.keyCode == 13) {
      var $input = $(event.srcElement);
      Helpers.addPatient($input.val(),$input.siblings('[name="priority"]').val());
      $input.val('');
    }
  },
  'keyup #url': function (e) {
    var $el = $(e.srcElement),
      url = $el.val();

    $el.closest('p').siblings('.url-error').remove();
    $el.siblings('[data-action="save-url"]').show();
    if (!/^[_\-0-9a-z]*$/i.test(url)) {
      $el.siblings('[data-action="save-url"]').hide();
      $el.closest('p').after('<p class="alert-danger url-error">You can only use letters, numbers, underscores and hyphens in the url.</p>');
    }
  },
  'click .arrow-up': function() {

  },
  'click .arrow-down': function() {

  }
});

Template.patientlist.rendered = function () {
  Helpers.renderPatientlistTemplate();

  var instance = this;
  Meteor.defer(function() {
    $(instance.firstNode).removeClass('transparent');
  });
};