Template.createInstitution.events({
  'click [data-action="add-institution"]': function () {
    var name = $('input.institution-name').val(),
      isPrivate = $('input[name="private"]:checked').val() === '1';

    Meteor.call("createInstitution", name, '', isPrivate, function (error, result) {
      if (error) {
        Helpers.outputErrors(error);
        return;
      }

      //TODO: Create not updating reactively the nav institution list

      Session.set('current_institution', result);
      Helpers.changePage('main');
      Helpers.outputSuccess('New institution created.');
      $.fancybox.close();
      //TODO: history.pushState
    });
  }
});