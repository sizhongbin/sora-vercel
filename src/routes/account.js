import express from 'express';
import * as mid from './mid.js';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const router = express.Router();

async function selectByMail(mail) {
  return new Promise(async resolve => {
    const { data, error } = await db
      .from('account')
      .select()
      .eq('mail', mail)
      .eq('is_deleted', false)
      .eq('is_dev', mid.isDev());
    return resolve({ data, error });
  });
}

async function signUp(mail, pass) {
  return new Promise(async resolve => {
    const patternMail =
      /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    const patternPass = /^.{6,32}$/;
    if (!patternMail.test(mail))
      return resolve({ error: { code: 400, message: 'Invalid mail format' } });
    if (!patternPass.test(pass))
      return resolve({ error: { code: 400, message: 'Invalid pass format' } });
    const { data, error } = await db
      .from('account')
      .insert({ mail: mail, pass: pass, is_dev: mid.isDev() })
      .select();
    return resolve({ data, error });
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
  console.debug(`[${req.trace}] Call Account API - Sign Up (${mid.env()})`);
  console.debug(`[${req.trace}] X-Request-ID: ${req.get('X-Request-ID')}`);
  console.debug(`[${req.trace}] Body: ${JSON.stringify(req.body)}`);

  // Set X-Request-ID header
  res.set('X-Request-ID', req.get('X-Request-ID'));

  let results;

  // Check body data
  if (!req.body.mail || !req.body.pass) {
    console.debug(`[${req.trace}] 400 Empty body`);
    res.status(400).send('Empty body');
    return;
  }
  console.debug(`[${req.trace}] Body data accepted`);

  // Check conflict
  results = await selectByMail(req.body.mail);
  if (results.error) {
    console.log(
      `[${req.trace}] ${results.error.code} ${results.error.message}`
    );
    res.status(results.error.code).send(results.error.message);
    return;
  }
  if (results.data.length !== 0) {
    console.debug(`[${req.trace}] 400 Account already exists`);
    res.status(400).send('Account already exists');
    return;
  }
  console.debug(`[${req.trace}] Account not exists`);

  // Create account and get ID
  results = await signUp(req.body.mail, req.body.pass);
  if (results.error) {
    console.debug(
      `[${req.trace}] ${results.error.code} ${results.error.message}`
    );
    res.status(results.error.code).send(results.error.message);
    return;
  }
  console.debug(`[${req.trace}] Data inserted`);

  console.log(`[${req.trace}] 200 Account created. Data:`, results.data);
  res.send(results.data[0].id);
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

export async function selectById(id) {
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
}

export default router;
