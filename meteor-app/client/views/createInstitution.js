Template.createInstitution.events({
  'click .btn-add-institution': function () {
    var name = $('input.institution-name').val(),
      isPrivate = $('input[name="private"]:checked').val();
    Meteor.call("createInstitution", name, '', isPrivate, function (error) {
      if (error) {
        Helpers.outputErrors(error);
      }
      else {
        Helpers.changePage('main');
        Helpers.outputSuccess('New institution created.');
        $.fancybox.close();
      }
    });
  }
});