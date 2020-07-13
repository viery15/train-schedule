'use strict';

module.exports = function(app) {
    var train = require('./controller');
    var twitter = require('./twitter');

    app.route('/')
        .post(train.index);

    app.route('/twitter')
        .post(twitter.index);
};