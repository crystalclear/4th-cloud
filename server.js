//
// Copyright (C) Jeff Wilcox
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

var express = require('express');

require('./lib/configuration')('web', function (config) {
    var appName = config.runtime.app;
    if (appName != 'www' && appName != 'api') {
        throw new Error('Unsupported known web service: ' + appName);
    }

    require('./lib/context').initialize(config, function (err, context) {
        if (err) {
            context.stats.server.startupFail();
            context.winston.error('This web server is not a web role or could not be started', { error: err });
            throw new Error(err);
        } else {
            var app = express();
            var site = require('./web/' + appName + '/')(app, context);

            // var app = webserver.initialize(context);

            var port = context.configuration.hosting.port;
            app.set('port', port);
            app.listen(port);
            
            context.stats.server.startup();
            context.winston.silly('Web server is listening on port: ' + port + ' ' + app.settings.env);
        }
    });
});
