Meteor.startup(function () {

    if(Institutions.find().count() === 0) {
        var institutions = ["Institution 1",
            "Institution 2",
            "Institution 3"];
        for (var i = 0; i < institutions.length; i++)
            Institutions.insert({name:institutions[i]});
    }


    if (Patients.find().count() === 0) {
        var institutions = [];
        Institutions.find().forEach(function(institution){
            institutions.push(institution._id);
        });
        var names = ["Ada Lovelace",
            "Grace Hopper",
            "Marie Curie",
            "Carl Friedrich Gauss",
            "Nikola Tesla",
            "Claude Shannon"];
        for (var i = 0; i < names.length; i++) {
            var institution = institutions[Math.floor(Math.random() * institutions.length)];
            Patients.insert({name:names[i], position:i+1, institution: institution});
        }
    }

});