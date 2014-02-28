if(Meteor.isServer) {
  Meteor.methods({
    addFavorite: function(id) {
      if(!Meteor.user()) return;

      var favorites = Meteor.user().profile.favorites;
      if(!favorites) {
        Meteor.users.update({_id:Meteor.user()._id}, {$set: {"profile.favorites": []}});
      }
      if(favorites.indexOf(id) == -1) {
        Meteor.users.update({_id: Meteor.user()._id}, {$addToSet: {"profile.favorites": id}});
      }
    },
    removeFavorite: function(id) {
      if(!Meteor.user()) return;

      var favorites = Meteor.user().profile.favorites;
      if(!favorites) return;

      Meteor.users.update({_id: Meteor.user()._id}, {$pull: {"profile.favorites": id}});
    }
  });
}