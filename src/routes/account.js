const express = require('express');
const path = require('path');
const mid = require('./mid.js');
const nedb = require('nedb');
const router = express.Router();
const db = new nedb({
  filename: path.join(process.cwd(), '/data/db.json'),
  autoload: true
});

async function selectByMail(mail) {
  return new Promise(async resolve => {
    db.find({ table: 'account', mail: mail, isDeleted: 0 }, (err, doc) => {
      if (err) return resolve({ error: err });
      else return resolve({ data: doc });
    });
  });
}

async function signUp(mail, pass) {
  return new Promise(async resolve => {
    try {
      const patternMail =
        /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
      const patternPass = /^.{6,32}$/;
      if (!patternMail.test(mail)) throw 'Invalid mail format';
      if (!patternPass.test(pass)) throw 'Invalid pass format';
      const data = {
        table: 'account',
        createTime: mid.now(),
        updateTime: mid.now(),
        isDeleted: 0,
        mail: mail,
        pass: pass
      };
      db.insert(data, (err, doc) => {
        if (err) throw err;
        else return resolve({ data: doc });
      });
    } catch (err) {
      return resolve({ error: err });
    }
  });
}

async function signIn(mail, pass) {
  return new Promise(async resolve => {
    try {
      const query = { mail: mail, isDeleted: 0 };
      db.find(query, (err, doc) => {
        if (err) throw err;
        if (doc.length === 0) return resolve({ error: 'Incorrect mail' });
        else if (doc[0].pass !== pass)
          return resolve({ error: 'Incorrect pass' });
        else return resolve({ data: doc[0] });
      });
    } catch (err) {
      return resolve({ error: err });
    }
  });
}

// Sign Up
router.post('/signup', async function (req, res) {
  console.log('### Account API - Sign Up ###');
  let results;

  // Get body
  console.log('Body:', req.body);

  // Check body data
  if (!req.body.mail || !req.body.pass) {
    console.log('X [400] Body data not acceptable');
    console.log('### Account API - Sign Up End ###');
    res.status(400).send('Body data not acceptable');
    return;
  }
  console.log('O Body data accepted');

  // Check conflict
  results = await selectByMail(req.body.mail);
  if (results.error) {
    console.log(`X [500] ${results.error}`);
    console.log('### Account API - Sign Up End ###');
    res.status(500).send(results.error);
    return;
  }
  if (results.data.length !== 0) {
    console.log('X [409] Account conflict');
    console.log('### Account API - Sign Up End ###');
    res.status(400).send('Account already exists');
    return;
  }
  console.log('O No Conflict');

  // Create account and get ID
  results = await signUp(req.body.mail, req.body.pass);
  if (
    results.error === 'Invalid mail format' ||
    results.error === 'Invalid pass format'
  ) {
    console.log(`X [400] ${results.error}`);
    console.log('### Account API - Sign Up End ###');
    res.status(400).send(results.error);
    return;
  } else if (results.error) {
    console.log(`X [500] ${results.error}`);
    console.log('### Account API - Sign Up End ###');
    res.status(500).send(results.error);
  }
  console.log('O Data inserted');

  console.log(`O [200] Account created. ID: ${results.data._id}`);
  console.log('### Account API - Sign Up End ###');
  res.send(results.data._id);
});

// Sign In
router.post('/signin', async function (req, res) {
  console.log('### Account API - Sign In ###');
  let results;

  // Get body
  console.log('Body:', req.body);

  // Check body data
  if (!req.body.mail || !req.body.pass) {
    console.log('X [400] Body data not acceptable');
    console.log('### Account API - Sign In End ###');
    res.status(400).send('Body data not acceptable');
    return;
  }
  console.log('O Body data accepted');

  // Get ID
  results = await signIn(req.body.mail, req.body.pass);
  if (
    results.error === 'Incorrect mail' ||
    results.error === 'Incorrect pass'
  ) {
    console.log(`X [400] ${results.error}`);
    console.log('### Account API - Sign In End ###');
    res.status(400).send(results.error);
    return;
  } else if (results.error) {
    console.log(`X [500] ${results.error}`);
    console.log('### Account API - Sign In End ###');
    res.status(500).send(results.error);
  }
  console.log('O Data selected');

  console.log(`O [200] Signed in. ID: ${results.data._id}`);
  console.log('### Account API - Sign In End ###');
  res.send(results.data._id);
});

router.use((req, res, next) => {
  res.status(404).send();
});

module.exports.selectById = async function (id) {
  return new Promise(async resolve => {
    try {
      const query = { _id: id, isDeleted: 0 };
      db.find(query, (err, doc) => {
        if (err) throw err;
        else return resolve({ data: doc });
      });
    } catch (err) {
      return resolve({ error: err });
    }
  });
};

module.exports = router;
