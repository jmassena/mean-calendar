// server/common/testUtils.js

'use strict';

module.exports = {
  connect: connect,
  closeConnection: closeConnection
};

function connect(mongoose, uri, done) {
  if(mongoose.connection.readyState === 0) {
    mongoose.connect(uri, function (err) {
      done(err);
    });
  } else {
    done();
  }
}

function closeConnection(mongoose, done) {
  if(mongoose.connection.readyState === 1) {
    mongoose.connection.close(function (err) {

      if(err) {
        console.log('close connection error');
      }
      done(err);
    });
  } else {
    done();
  }
}
