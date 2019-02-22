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
var getAllMembersInside = function() {
  db.any('SELECT kth_id FROM sminut WHERE tid_in IS NOT NULL AND tid_ut IS NULL', )
    .then(function (data) {
      return data
    })
    .catch(function (error) {
      console.log('ERROR:', error)
      return null
    })
}

/* If there are no SM in session it will create a new one*/
function createNewSM(sm_name, callback) {
  if(smInSession['sm_name'] == null) {
    smInSession['sm_name'] = sm_name;
    smInSession['sm_start'] = date.getTime();
    smInSession['sm_slut'] = null;

    db.none('INSERT INTO sm (sm_name, sm_start, sm_slut) VALUES (${sm_name}, ${sm_start}, ${sm_slut});', smInSession)
      .then(function (data) {
        db.one('SELECT sm_id FROM sm WHERE sm_name = $1 AND sm_start = $2', [smInSession['sm_name'], smInSession['sm_start']])
        .then(function (data) {
          smInSession['sm_id'] = data['sm_id'];
          console.log("SM created and added to Database");
          console.log(smInSession);
          return callback(null, true);
        })
        .catch(function (error) {
          console.log('ERROR:', error)
          return callback(error);
        }) 
      })
      .catch(function (error) {
        console.log('ERROR:', error)
        return callback(error);
      }) 
  } else {
    console.log("SM already exists, will not create a new one.");
    return callback(null, false);
  }
}

/* If there is a SM in session, end it and all current members is marked as walking out of the SM. */
var endSM = function(sm) {
  if(smInSession['sm_name'] != null) {
    db.none('UPDATE sm WHERE sm_id = $1 SET sm_slut = $2', [smInSession['sm_id'], date.getTime()])
      .then(function (data) {
        if(data) {
          db.none('UPDATE sminut WHERE sm_id = $1 SET sm_slut = $2', [smInSession['sm_id'], date.getTime()])
          .then(function (data) {
            return true
          })
          .catch(function (error) {
            console.log('ERROR:', error)
            return false
          })
        }
      })
      .catch(function (error) {
        console.log('ERROR:', error)
        return false
      })
  }
}

/* GET FUNCTIONS */

/* Queries the database for all members inside */
router.get('/getAllMembersInside', function(req, res) {
  res.json(JSON.stringify(getAllMembersInside()));
})

router.get('/getSMInSession', function(req, res) {
  res.json(smInSession);
})

/* POST FUNCTIONS */

router.post('/createNewSM', function(req, res, next) {
  createNewSM(req.param('sm_name'), function(err, obj) {
    if(err) {
      return err
    };
    res.json({sm_created: obj})
  })
})

router.post('/endCurrentSM', function(req, res) {
  
})


/* MISC. FUNCTIONS */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/url", (req, res, next) => {
  res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});

initSM();

module.exports = router;
