Patients = new Meteor.Collection("patients");
Institutions = new Meteor.Collection("institutions");
Alerts = new Meteor.Collection("alerts");

if(Meteor.isClient) {
  //Stub methods for faster auto-corrected results
  Meteor.methods({
    //...
  });
}