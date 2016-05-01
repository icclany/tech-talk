var IrisBot = require('./iris-bot'),
    config = require('./config.json');

var mrCuddles = new IrisBot(config);

console.log('mrCuddles: Running.');

setInterval(function() {

  // RETWEET A FRIEND
  mrCuddles.retweetFriends(function(err, reply) {
      if (err) return handleError(err);
      console.log('\nRetweeted Friend:' + reply.text);
  });

  // LISTEN FOR MENTION OF BLANKETS
  mrCuddles.listenForMe(function(err, reply) {
      if (err) return handleError(err);
      console.log('\nRetweeted About Me:' + reply.text);
  });

  // SNUGGLE A FRIEND
  mrCuddles.snuggleFriend(function(err, reply) {
      if (err) return handleError(err);
      console.log('\nSnuggled A Friend:' + reply.text);
  });

  // FOLLOW A BLANKET LOVER
  mrCuddles.findFriends(function(err, reply) {
      if (err) return handleError(err);
      var name = reply.screen_name
      console.log('\nFound and followed: Blanket lover @' + name);
  });
  
}, 5000);

function handleError(err) {
    console.error('response status:', err.statusCode);
    console.error('data:', err.data);
}
