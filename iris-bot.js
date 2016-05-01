//  IrisBot
//
var Twit = require('./node_modules/twit/lib/twitter');
var IrisBot = module.exports = function(config) {
    this.twit = new Twit(config);
};

//
//  Post a tweet
//
IrisBot.prototype.tweet = function(status, callback) {
    // Error if tweet is invalid
    if (typeof status !== 'string') {
        return callback(new Error('Not a string'));
    } else if (status.length > 140) {
        return callback(new Error('Too long!'));
    }
    // Otherwise, post tweet
    this.twit.post('statuses/update', { status: status }, callback);
};

//
// Retweet a friend
//
IrisBot.prototype.retweetFriends = function(callback) {
    var self = this;

    this.twit.get('lists/statuses', {
        owner_screen_name: 'BlanketyBlnk',
        slug: 'my-friends',
        result_type: "recent"
    }, function(err, reply) {
        if (err) return callback(err);
        else {
            var friendTweets = randIndex(reply);
            var retweetId = friendTweets.id_str;
            self.twit.post('statuses/retweet/' + retweetId, {}, callback);
        }
    });
};

//
// Listen for stuff about me and retweet
//
IrisBot.prototype.listenForMe = function(callback) {
    var self = this;

    this.twit.get('search/tweets', { q: "#snuggle", count: 30 }, function(err, reply) {
        // log out any errors
        if (err) {
            self.twit.post('statuses/update', { status: "ZZZZZ" }, callback);
            return callback(err);
        } else {
            // Grab id of tweet to retweet
            var retweetId = randIndex(reply.statuses).id_str;
            // Retweet it
            self.twit.post('statuses/retweet/' + retweetId, {}, callback);
        }
    });
};

//
// Choose a random friend that needs snuggling
//
IrisBot.prototype.snuggleFriend = function(callback) {
    var self = this;
    this.twit.get('lists/members', {
        owner_screen_name: 'BlanketyBlnk',
        slug: 'my-friends'
    }, function(err, reply) {
        if (err) return callback(err);
        // If nothing, tweet a robot tweet
        else {
            var friend = randIndex(reply.users);
            self.twit.post('statuses/update', { status: "I'm a blanket. You need me @" + friend.screen_name, }, callback);
        }
    });
};

//
//  Follow a random blanket lover
//
IrisBot.prototype.findFriends = function(callback) {
    var self = this;

    this.twit.get('followers/ids', { screen_name: 'OriginalSnuggie' }, function(err, reply) {
        if (err) {
            return callback(err);
        }
        var followers = reply.ids,
            randFollower = randIndex(followers);
        self.twit.post('friendships/create', { id: randFollower }, callback);
    })
};

// Helper Function
function randIndex(arr) {
    var index = Math.floor(arr.length * Math.random());
    return arr[index];
};
