var fs = require('fs');
var layer = require('cloud/layer-parse-module/layer-module.js');

var layerProviderID = '7f9c41c4-b3e9-11e4-b65d-7dab3d0102b4';
var layerKeyID = '207c9852-06f9-11e5-8907-84d07e027702';
var privateKey = fs.readFileSync('cloud/layer-parse-module/keys/layer-key.js');
layer.initialize(layerProviderID, layerKeyID, privateKey);

Parse.Cloud.define("generateToken", function(request, response) {
    var userID = request.params.userID;
    var nonce = request.params.nonce;
    if (!userID) throw new Error('Missing userID parameter');
    if (!nonce) throw new Error('Missing nonce parameter');
        response.success(layer.layerIdentityToken(userID, nonce));
});


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
    if (request.object.existed()==false){
		var notificationType = request.object.get('type');
		var senderObject = request.object.get('sender');
		var receiverObject = request.object.get('receiver');
		if (receiverObject.id != senderObject.id) {
			var receiverAlias = receiverObject.get('alias');
			var senderAlias = "";
			var actionString = "";
			if (notificationType == "comment" || notificationType == "like"){
				var activityObject = request.object.get('activity');
				var query = new Parse.Query("Activity");
				query.include("challenge");
				query.get(activityObject.id, {
					success: function(activityObjectReal) {
						// The object was retrieved successfully.
						var challengeObject = activityObjectReal.get("challenge");
						actionString = challengeObject.get("action");
						console.log("string is " + actionString);
						var userQuery = new Parse.Query("_User");
						userQuery.get(senderObject.id, {
							success: function(senderObjectReal) {
								// The object was retrieved successfully.
								senderAlias = senderObjectReal.get("username");
								var notificationTypeActionString = "";
								if (notificationType == "comment") {
									notificationTypeActionString = " commented on ";
								} else if (notificationType == "like") {
									notificationTypeActionString = " liked ";
								}
								var notificationText = senderAlias + notificationTypeActionString + "your activity " + "\"" + actionString + ".\"";
								var receiverPushQuery = new Parse.Query(Parse.Installation);
								receiverPushQuery.equalTo('deviceType', 'ios');
								receiverPushQuery.equalTo('currentUser', receiverObject);
								Parse.Push.send({
									where: receiverPushQuery, // Set our Installation query
									data: {
										alert: notificationText
									}
								}, {
									success: function() {
										console.log("success!")
											// Push was successful
										console.log(receiverPushQuery);
									},
									error: function(error) {
										throw "Got an error " + error.code + " : " + error.message;
									}
								});
							},
							error: function(object, error) {
								// The object was not retrieved successfully.
								// error is a Parse.Error with an error code and message.
								console.log("failed user query ");

							}
						});
					},
					error: function(object, error) {
						// The object was not retrieved successfully.
						// error is a Parse.Error with an error code and message.

					}
				});
			}
			else if (notificationType == "followRequestApproved"){
				var userQuery = new Parse.Query("_User");
				userQuery.get(senderObject.id, {
					success: function(senderObjectReal) {
						// The object was retrieved successfully.
						senderAlias = senderObjectReal.get("username");

						var receiverNotificationText = senderAlias + " approved your follow request.";
						var receiverPushQuery = new Parse.Query(Parse.Installation);
						receiverPushQuery.equalTo('deviceType', 'ios');
						receiverPushQuery.equalTo('currentUser', receiverObject);
						Parse.Push.send({
							where: receiverPushQuery, // Set our Installation query
							data: {
								alert: receiverNotificationText
							}
						}, {
							success: function() {
								console.log("success!")
									// Push was successful
								console.log(receiverPushQuery);
							},
							error: function(error) {
								throw "Got an error " + error.code + " : " + error.message;
							}
						});
					},
					error: function(object, error){
					
					}
				});
			}
			else if (notificationType == "followRequestSent"){
				var userQuery = new Parse.Query("_User");
				userQuery.get(senderObject.id, {
					success: function(senderObjectReal) {
						// The object was retrieved successfully.
						senderAlias = senderObjectReal.get("username");

						var receiverNotificationText = senderAlias + " sent you a follow request.";
						var receiverPushQuery = new Parse.Query(Parse.Installation);
						receiverPushQuery.equalTo('deviceType', 'ios');
						receiverPushQuery.equalTo('currentUser', receiverObject);
						Parse.Push.send({
							where: receiverPushQuery, // Set our Installation query
							data: {
								alert: receiverNotificationText
							}
						}, {
							success: function() {
								console.log("success!")
									// Push was successful
								console.log(receiverPushQuery);
							},
							error: function(error) {
								throw "Got an error " + error.code + " : " + error.message;
							}
						});
					},
					error: function(object, error){
					
					}
				});
			}
        }
    }
});