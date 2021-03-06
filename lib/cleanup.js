
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

var context = undefined;

var dateutil = require('./dateutil');

module.exports.initialize = function (_context) {
    context = _context;
    // hacky.
}

module.exports.mongoRemovePushFromClients = function (pushUri, callback) {
    if (context.mongo.collections.clients !== null) {
        context.mongo.collections.clients.remove(
            { uri: pushUri }, 
            context.mongo.safe,
            callback);
    } else {
        console.warn('The clients collection is not currently open.');
        callback( { msg: 'no collection open' }, null);
    }
}

// ---------------------------------------------------------------------------
// Rolling history cleanup
// ---------------------------------------------------------------------------
module.exports.cleanupHistoryTable = function(callback) {
    var MAXIMUM_DAYS = 2; // 2 days.
    var oldDate = dateutil.returnNewDateMinusMinutes(new Date(), MAXIMUM_DAYS * 60 * 24);
    // console.log('Cleaning up the history table...');

    // TODO: Moving to Windows Azure. Need to add cleanup code here.
    if(callback) {
        callback();
    }
}

// ---------------------------------------------------------------------------
// Cleanup old clients from the cloud
// ---------------------------------------------------------------------------
module.exports.cleanupOldClients = function (callback) {
    var MAXIMUM_DAYS = 14;
    var oldDate = dateutil.returnNewDateMinusMinutes(new Date(), MAXIMUM_DAYS * 60 * 24);

    function cleanupOldClientsCallback(err, result)
    {
        if (err) {
            console.log("error trying to cleanup!");
        } else {
            if (result) {
                // console.log("Removed " + result + " old clients.");
            }
        }
        cleanupNonUsers();
    }

    function cleanupNonUsers() {
        context.mongo.collections.clients.remove(
            { cc: 0 },
            context.mongo.safe,
            cleanupNonUsersCallback);
    }

    function cleanupNonUsersCallback(err, result) {
        if (!err) {
            if (result) {
                console.log("Removed " + result + " non-users.");
            }
        }
        if (callback) { 
            callback();
        }
    }

    if (context.mongo && 
        context.mongo.collections &&
        context.mongo.collections.clients && 
        context.mongo.collections.clients.remove)
    {
        context.mongo.collections.clients.remove(
            { seen: { $lt : oldDate } },
            context.mongo.safe,
            cleanupOldClientsCallback);
    }
}
