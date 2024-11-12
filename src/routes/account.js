import express from 'express';
import { isDev } from '../utils/env.js';
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
      .eq('is_dev', isDev());
    return resolve({ data, error });
  });
}

async function signUp(mail, pass) {
  return new Promise(async resolve => {
    const patternMail =
      /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    const patternPass = /^.{6,32}$/;
    if (!patternMail.test(mail))
      return resolve({
        error: { response: 400, message: 'Invalid mail format' }
      });
    if (!patternPass.test(pass))
      return resolve({
        error: { response: 400, message: 'Invalid pass format' }
      });
    const { data, error } = await db
      .from('account')
      .insert({ mail: mail, pass: pass, is_dev: isDev() })
      .select();
    return resolve({ data, error });
  });
}

async function signIn(mail, pass) {
  return new Promise(async resolve => {
    const results = await selectByMail(mail);
    if (results.error) return resolve({ error: results.error });
    if (results.data.length === 0)
      return resolve({
        error: { response: 400, message: 'Account not exists' }
      });
    if (results.data[0].pass !== pass)
      return resolve({
        error: { response: 400, message: 'Incorrect pass' }
      });
    return resolve({ data: results.data });
  });
}

// Sign Up
router.post('/signup', async function (req, res) {
  let results;

  // Check body
  if (!req.body.mail || !req.body.pass) {
    req.info('400 Empty body');
    res.status(400).send('Empty body');
    return;
  }
  req.debug('Body accepted');

  // Check duplication
  results = await selectByMail(req.body.mail);
  if (results.error) {
    req.error(`${results.error.code} ${results.error.message}`);
    res.status(500).send(results.error.message);
    return;
  }
  if (results.data.length !== 0) {
    req.info('400 Account already exists');
    res.status(400).send('Account already exists');
    return;
  }
  req.debug('Account not exists');

  // Create account and get ID
  results = await signUp(req.body.mail, req.body.pass);
  if (results.error) {
    if (results.error.response) {
      req.info(`${results.error.response} ${results.error.message}`);
      res.status(results.error.response).send(results.error.message);
    } else {
      req.error(`${results.error.code} ${results.error.message}`);
      res.status(500).send(results.error.message);
    }
    return;
  }
  req.debug('Account inserted');

  // Send account ID
  req.info(`200 Account created. Data: ${JSON.stringify(results.data)}`);
  res.send(results.data[0].id);
});

// Sign In
router.post('/signin', async function (req, res) {
  let results;

  // Check body
  if (!req.body.mail || !req.body.pass) {
    req.info('400 Empty body');
    res.status(400).send('Empty body');
    return;
  }
  req.debug('Body accepted');

  // Get ID
  results = await signIn(req.body.mail, req.body.pass);
  if (results.error) {
    if (results.error.response) {
      req.info(`${results.error.response} ${results.error.message}`);
      res.status(results.error.response).send(results.error.message);
    } else {
      req.error(`${results.error.code} ${results.error.message}`);
      res.status(500).send(results.error.message);
    }
    return;
  }
  req.debug('Account selected');

  req.info(`200 Signed in. ID: ${results.data[0].id}`);
  res.send(results.data[0].id);
});

router.use((req, res, next) => {
  req.info('404');
  res.status(404).send();
});

export async function selectById(id) {
  return new Promise(async resolve => {
    const { data, error } = await db
      .from('account')
      .select()
      .eq('id', id)
      .eq('is_deleted', false)
      .eq('is_dev', isDev());
    return resolve({ data, error });
  });
}

export default router;
