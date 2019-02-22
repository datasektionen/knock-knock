var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://postgres:postgres@localhost:5432/smappen')
var date = new Date();

var smInSession = {
  sm_id: null,
  sm_name: null,
  sm_start: null,
  sm_slut: null
}

function initSM() {
  db.oneOrNone('SELECT sm_id,sm_name,sm_start FROM sm WHERE sm_start IS NOT NULL AND sm_slut IS NULL')
  .then(function (data) {
    if(data != null) {
      smInSession = {
        sm_id: data['sm_id'],
        sm_name: data['sm_name'],
        sm_start: data['sm_start'],
        sm_slut: null
      }
    }
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })
}

/* DB INTERACTION */

/* Get all the members that are checked inside the SM. */
function getAllMembersInside(callback) {
  db.any('SELECT DISTINCT kth_id FROM sminut WHERE tid_in IS NOT NULL AND tid_ut IS NULL;', )
    .then(function (data) {
      return callback(null, data)
    })
    .catch(function (error) {
      console.log('ERROR:', error)
      return callback(error, null)
    })
}

/* Get all the members that were in the SM. */
function getAllMembersOfSm(sm_id, callback) {
  if(sm_id === "") {
    return callback("No sm_id supplied, no members returned.", {});
  }
  db.any('SELECT DISTINCT kth_id FROM sminut WHERE sm_id = $1', [sm_id])
    .then(function (data) {
      return callback(null, data)
    })
    .catch(function (error) {
      console.log('ERROR:', error)
      return callback(error, null)
    })
}

/* Return a list of all SM in db */
function getAllSM(callback) {
  db.any('SELECT * FROM sm;')
    .then(function (data) {
      return callback(null, data);
    })
    .catch(function (error) {
      console.log('ERROR:', error);
      return callback(error, null);
    })
}

/* If there are no SM in session it will create a new one*/
function createNewSM(sm_name, callback) {
  if(sm_name === "") {
    return callback(null, "No name supplied, no SM created.");
  }
  if(smInSession['sm_name'] == null) {
    smInSession['sm_name'] = sm_name;
    smInSession['sm_start'] = date.getTime();
    smInSession['sm_slut'] = null;

    db.none('INSERT INTO sm (sm_name, sm_start, sm_slut) VALUES (${sm_name}, ${sm_start}, ${sm_slut});', [smInSession])
      .then(function (data) {
        db.one('SELECT sm_id FROM sm WHERE sm_name = $1 AND sm_start = $2', [smInSession['sm_name'], smInSession['sm_start']])
        .then(function (data) {
          smInSession['sm_id'] = data['sm_id'];
          console.log(smInSession);
          return callback(null, "SM created with id: " + smInSession['sm_id'] + "and added to Database.");
        })
        .catch(function (error) {
          console.log('ERROR:', error)
          return callback(error, "Something went wrong while creating a new SM.");
        }) 
      })
      .catch(function (error) {
        console.log('ERROR:', error)
        return callback(error, "Something went wrong while creating a new SM.");
      }) 
  } else {
    return callback(null, "SM already exists and in session, will not create a new one. End the last SM if you want to create a new one.");
  }
}

/* If there is a SM in session, end it and all current members is marked as walking out of the SM. */
function endSM(callback) {
  if(smInSession['sm_name'] != null) {
    db.none('UPDATE sm WHERE sm_id = $1 SET sm_slut = $2;', [smInSession['sm_id'], date.getTime()])
      .then(function (data) {
        if(data) {
          db.none('UPDATE sminut WHERE sm_id = $1 SET sm_slut = $2', [smInSession['sm_id'], date.getTime()])
          .then(function (data) {
            return callback(null, "SM with id: " + smInSession['sm_id'] + " ended.")
          })
          .catch(function (error) {
            console.log('ERROR:', error)
            return callback(error, null)
          })
        }
      })
      .catch(function (error) {
        console.log('ERROR:', error)
        return callback(error, null)
      })
  }
}

function isCheckedIn(kth_id, callback) {
  db.one("SELECT kth_id FROM sminut WHERE kth_id = $1 AND tid_ut IS NULL", [kth_id])
    .then( function (data) {
      if(data != null) {
        return callback(true)
      }
    })
    .catch(function (error) {
      console.log('Error; ', error)
      return callback(error, null)
    })
}

/*
  Check in to current SM in session if user not already checked in. 
  
  Expects two inputs kth_id and punkt_in.
*/
function checkIn(kth_id, punkt_in, callback) {
  db.none("INSERT INTO sminut (kth_id, punkt_in) VALUES (punkt_in)")
}

/* GET FUNCTIONS */

/* Queries the database for all members inside the current SM */
router.get('/getAllMembersInside', function(req, res) {
  getAllMembersInside(function(err, obj) {
    if(err) {
      return err
    };
    res.json(JSON.stringify(obj));
  })  
})

/* Return an object representing the current SM in session */
router.get('/getSMInSession', function(req, res) {
  res.json(smInSession);
})

/* Return a list of all SM in db */
router.get('/getAllSM', function(req, res) {
  getAllSM(function(err, obj) {
    if(err) {
      return err
    };
    res.json(JSON.stringify(obj));
  })
}) 

/* POST FUNCTIONS */

/* Check in a member into the SM */
router.post('/checkIn', function(req, res) {

})

/* Check out a member from SM */
router.post('/checkOut', function(req, res) {

})

/* Create a new sm with supplied sm_name */
router.post('/createNewSM', function(req, res) {
  createNewSM(req.param('sm_name'), function(err, obj) {
    if(err) {
      return err
    };
    res.json({sm_created: obj})
  })
})

/* End the current SM in session */
router.post('/endCurrentSM', function(req, res) {
  endSM(function(err, obj){
    if(err) {
      return err
    };
    res.json({sm_ended: obj})
  })
})

/* Get all members of supplied sm_id */
router.post('/getAllMembersOfSm', function(req, res) {
  getAllMembersOfSm(req.param('sm_name'), function(err, obj) {
    if(err) {
      return err
    };
    res.json(JSON.stringify(obj));
  })  
})


/* MISC. FUNCTIONS */


initSM();

module.exports = router;
