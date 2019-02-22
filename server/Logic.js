var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://postgres:postgres@localhost:5432/smappen')


var getAllMembersInside = function() {
  db.manyOrNone('SELECT kth_id FROM sminut WHERE tid_in IS NOT NULL AND tid_in IS NULL', )
    .then(function (data) {
      return data
    })
    .catch(function (error) {
      console.log('ERROR:', error)
    })
}