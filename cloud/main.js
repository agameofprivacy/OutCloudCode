
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});



Parse.Cloud.define("challengeOfDifficulty", function(request, response) {
  var query = new Parse.Query("Challenge");
  query.equalTo("difficulty", request.params.difficulty);
  query.find({
    success: function(results) {
      response.success(results.length);
    },
    error: function() {
      response.error("challenge lookup failed");
    }
  });
});

Parse.Cloud.afterSave("Notification", function(request) {
  // Our "Notification" class has a "text" key with the body of the comment itself
  var notificationType = request.object.get('type');
  var receiverObject = request.object.get('receiver');
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo('deviceType', 'ios');
  pushQuery.equalTo('currentUser', receiverObject);
    
  Parse.Push.send({
    where: pushQuery, // Set our Installation query
    data: {
      alert: "New notification of type " + notificationType
    }
  }, {
    success: function() {
    console.log("success!")
      // Push was successful
    },
    error: function(error) {
      throw "Got an error " + error.code + " : " + error.message;
    }
  });
});