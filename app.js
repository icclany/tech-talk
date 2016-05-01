// Setup
var express = require("express");
var app = express();
var secrets = require('./config'); // private info
app.get('/', function(req, res) { res.send('Running MiniIris.'); });
app.listen(process.env.PORT || 5000);

// CONFIGURATION
var config = {
    me: 'iccLANY', // Twitter account name
    myList: 'my-friends', // List to retweet
    regexFilter: '', // Accepts only tweets matching this regex pattern.
    regexReject: '(RT|@)', // Rejects any tweets matching this regex pattern.
    keys: {
        consumer_key: secrets.consumer_key,
        consumer_secret: secrets.consumer_secret,
        access_token_key: secrets.access_token,
        access_token_secret: secrets.access_token_secret
    },
};

// Get the members of our list, and pass them into a callback function.
function getListMembers(callback) {
    var memberIDs = [];

    // Use npm library Tuiter
    tu.listMembers({
            owner_screen_name: config.me,
            slug: config.myList
        },
        function(error, data) {
            if (!error) {
                for (var i = 0; i < data.users.length; i++) {
                    memberIDs.push(data.users[i].id_str);
                }

                // This callback is designed to run listen(memberIDs).
                callback(memberIDs);
            } else {
                console.log(error);
                console.log(data);
            }
        });
}

// Error handling: retweets
function onReTweet(err) {
    if (err) {
        console.error("retweeting failed :(");
        console.error(err);
    }
}

// Listen for tweets
function onTweet(tweet) {
    // Reject the tweet if:
    //  1. it's flagged as a retweet
    //  2. it matches our regex rejection criteria
    //  3. it doesn't match our regex acceptance filter
    var regexReject = new RegExp(config.regexReject, 'i');
    var regexFilter = new RegExp(config.regexFilter, 'i');
    if (tweet.retweeted) {
        return;
    }
    if (config.regexReject !== '' && regexReject.test(tweet.text)) {
        return;
    }
    if (regexFilter.test(tweet.text)) {
        console.log(tweet);
        console.log("RT: " + tweet.text);
        // Note we're using the id_str property since javascript is not accurate
        // for 64bit ints.
        tu.retweet({
            id: tweet.id_str
        }, onReTweet);
    }
}

// Function for listening to twitter streams and retweeting on demand.
function listen(listMembers) {
    tu.filter({
        follow: listMembers
    }, function(stream) {
        console.log("listening to stream");
        stream.on('tweet', onTweet);
    });
}

// The application itself.
// Use the tuiter node module to get access to twitter.
var tu = require('tuiter')(config.keys);

// Tracking by word
// tu.filter({ track: ['help', 'subway'] }, function(stream) {
//     stream.on('tweet', function(data) {
//         console.log(data);
//     });
// });

// // Tracking by location
// tu.filter({ location: [{ lat: -90, long: -180 }, { lat: 90, long: 180 }] }, function(stream) {
//     stream.on('tweet', function(data) {
//         console.log(data);
//     });
// });

// Run the application. The callback in getListMembers ensures we get our list
// of twitter streams before we attempt to listen to them via the twitter API.
getListMembers(listen);
