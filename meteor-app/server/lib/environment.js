function isAdmin(user,institution) {
  if (user) {
    var is_institution_admin = Institutions.findOne({users: user, _id: institution});
    if (is_institution_admin) {
      return true;
    }
  }

  return false;
}