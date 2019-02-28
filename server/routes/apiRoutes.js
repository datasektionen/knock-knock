var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')(/*options*/)
var fetch = require('node-fetch');

// Use when on mjukglass
var db_string = "postgres://" + process.env.DB_USER
  + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME;

var db = pgp('postgres://postgres:postgres@localhost:5432/knockknock')
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
  db.any('SELECT DISTINCT ON (kth_id) kth_id, namn FROM sminut WHERE tid_in IS NOT NULL AND tid_ut IS NULL;', )
    .then(function (data) {
      return callback(null, data)
    })
    .catch(function (error) {
      console.log('ERROR:', error)
      return callback(error, null)
    })
}

/* Get all the members that were in the SM. */
function getAllMembersOfSM(sm_id, callback) {
  if(sm_id === "") {
    return callback(1, "No sm_id supplied, no members returned.");
  }
  db.any('SELECT DISTINCT ON (kth_id) kth_id, namn FROM sminut WHERE sm_id = $1', [sm_id])
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
    return callback(1, "No name supplied, no SM created.");
  }
  if(smInSession['sm_name'] == null) {
    smInSession['sm_name'] = sm_name;
    smInSession['sm_start'] = date.getTime();
    smInSession['sm_slut'] = null;

    db.none('INSERT INTO sm (sm_name, sm_start, sm_slut) VALUES (${sm_name}, ${sm_start}, ${sm_slut});', smInSession)
      .then(function (data) {
        db.one('SELECT sm_id FROM sm WHERE sm_name = $1 AND sm_start = $2', [smInSession['sm_name'], smInSession['sm_start']])
        .then(function (data) {
          smInSession['sm_id'] = data['sm_id'];
          console.log(smInSession);
          return callback(null, "SM created with id: " + smInSession['sm_id'] + " and added to Database.");
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
    return callback(2, "SM already exists and in session, will not create a new one. End the last SM if you want to create a new one.");
  }
}

/* If there is a SM in session, end it and all current members is marked as walking out of the SM. */
function endSM(callback) {
  if(smInSession['sm_name'] != null) {
    db.none('UPDATE sm SET sm_slut = $2 WHERE sm_id = $1;', [smInSession['sm_id'], date.getTime()])
      .then(function (data) {
        db.none('UPDATE sminut SET tid_ut = $2, punkt_ut = $3 WHERE sm_id = $1;', [smInSession['sm_id'], date.getTime(), "Slut"])
        .then(function (data) {
          return callback(null, "SM with id: " + smInSession['sm_id'] + " ended.")
        })
        .catch(function (error) {
          console.log('ERROR:', error)
          return callback(error, null)
        })
        .catch(function (error) {
          console.log('ERROR:', error)
          return callback(error, null)
        })
      })
  } else {
    console.log("sm not in session")
    return callback(1, "No SM in session to end.")
  }
}

function isCheckedIn(kth_id, callback) {
  db.oneOrNone("SELECT kth_id FROM sminut WHERE kth_id = $1 AND tid_ut IS NULL", [kth_id])
    .then( function (data) {
      if(data != null) {
        return callback(null, true)
      } else {
        return callback(null, false)
      }
    })
    .catch(function (error) {
      console.log('Error; ', error)
      return callback(error, null)
    })
}

/*
  Check in to current SM in session if user not already checked in. 
  
  Expects two inputs kth_id and punkt_in and a SM in session.
*/
function checkIn(kth_id, punkt_in, callback) {
  if(kth_id === "") {
    return callback(1, "Member not checked out, kth_id empty.")
  }
  if(smInSession['sm_id'] == null) {
    return callback(1, "No SM in session, create one.")
  }

  fetch("https://hodis.datasektionen.se/uid/" + kth_id)
    .then(response => response.json())
    .catch(e => new Error('Authentication error from login'))
    .then(response => {
      db.none("INSERT INTO sminut (sm_id, tid_in, kth_id, punkt_in, namn) VALUES ($1, $2, $3, $4, $5)", [smInSession['sm_id'], date.getTime(), kth_id, punkt_in, response.displayName])
        .then( function (data) {
          return callback(null, response.displayName + " is now checked in (" + kth_id + ").")
        })
        .catch(function (err) {
          console.log('Error; ', err);
          return callback(err, "Something unexpected happened, see logs");
      })
    }).catch(e => new Error('Something went wrong when looking up the user-id' + kth_id + ", only adding userid."))
}

/* Check out a member from SM */
function checkOut(kth_id, punkt_ut, callback) {
  if(kth_id === "") {
    return callback(1, "Member not checked out, kth_id empty.")
  }
  if(smInSession['sm_id'] == null) {
    return callback(1, "No SM in session, create one.")
  }
  db.any("UPDATE sminut SET tid_ut = $1, punkt_ut = $2 WHERE kth_id = $3 AND sm_id = $4 AND tid_ut IS NULL", [date.getTime(), punkt_ut, kth_id, smInSession['sm_id']])
    .then( function(data) {
      return callback(null, kth_id + " checked out from SM with id: " + smInSession['sm_id'])
    })
    .catch(function(err) {
      console.log('Error; ', err);
      return callback(1, "Something went wrong when trying to check out " + kth_id);
    })
}

/* GET FUNCTIONS */

/* Queries the database for all members inside the current SM */
router.get('/getAllMembersInside', function(req, res) {
  getAllMembersInside(function(err, obj) {
    if(err) {
      res.status(500)
      res.send(err)
      return
    };
    res.json(obj);
  })  
})

/* Return an object representing the current SM in session */
router.get('/getSMInSession', function(req, res) {
  res.json(smInSession);
})

/* Return a list of all SM in db */
router.get('/getAllSM', function(req, res) {
  getAllSM(function(err, obj, next) {
    if(err) {
      res.status(500)
      res.send(err)
      return
    };
    res.json(obj);
  })
})

/* get in-ut-lista */
router.get('/getAllSMInUt', function(req, res) {
  db.any('SELECT * FROM sminut WHERE sm_id = $1 ORDER BY id DESC;', [smInSession.sm_id])
    .then( function(data) {
      res.json(data)
    })
    .catch(function(err) {
      console.log('Error; ', err);
      res.status(500);
      res.send(err);
      return
    })
})

/* End the current SM in session */
router.get('/endCurrentSM', function(req, res) {
  endSM(function(err, obj){
    if(err) {
      res.status(409)
      res.json(obj)
      return
    };
    smInSession = {
      sm_id: null,
      sm_name: null,
      sm_start: null,
      sm_slut: null
    }
    res.json({sm_ended: obj})
  })
})

/* Generates a knock-knock joke */
router.get('/knock-knock', function(req, res) {
  res.json({joke: "Knock, knock. \nRace condition. \nWho’s there."})
})


/* POST FUNCTIONS */

router.post('/isCheckedIn', function(req, res) {
  isCheckedIn(req.param('kth_id'), function(err, obj) {
    if(err) {
      res.status(500)
      res.send(err)
      return
    }
    res.json({ isCheckedIn: obj})
    return
  })
})

/* Check in a member into the current SM in session */
router.post('/checkIn', function(req, res) {
  var kth_id = req.param('kth_id');
  isCheckedIn(kth_id, function(err, obj) {
    if(err) {
      res.status(400)
      res.send(obj)
      return
    }
    if(!obj) {
      checkIn(kth_id, req.param('punkt_in'), function(err, nobj) {
        if(err) {
          res.status(400)
          res.send(nobj)
          return
        };
        res.json({check_in: nobj});
      })
    } else {
      res.json({check_in: null})
    }
  })
})

/* Check out a member from SM */
router.post('/checkOut', function(req, res) {
  isCheckedIn(req.param('kth_id'), function(err, obj) {
    if(err) {
      res.status(400)
      res.send(obj)
      return
    }
    if(obj) {
      checkOut(req.param('kth_id'), req.param('punkt_ut'), function(err, nobj) {
        if(err) {
          res.status(400)
          res.send(nobj)
          return
        };
        res.json({check_in: nobj});
      })
    } else {
      res.json({check_in: null})
    }
  })
})

/* Create a new sm with supplied sm_name */
router.post('/createNewSM', function(req, res) {
  createNewSM(req.param('sm_name'), function(err, obj) {
    if(err === 1) {
      res.status(400)
      res.send(obj)
      return
    } else if(err === 2) {
      res.status(409)
      res.send(obj)
      return
    } else if(err) {
      res.status(500)
      res.send(obj)
      return
    } 
    res.json({sm_created: obj})
  })
})

/* Get all members of supplied sm_id */
router.post('/getAllMembersOfSM', function(req, res) {
  getAllMembersOfSM(req.param('sm_id'), function(err, obj) {
    if(err === 1) {
      res.status(400)
      res.send(obj)
      return
    } else if(err) {
      res.status(500)
      res.send(obj)
      return
    }
    res.json(obj);
  })  
})


/* MISC. FUNCTIONS */

// Read current SM from db if crash or restart.
initSM();

module.exports = router;
