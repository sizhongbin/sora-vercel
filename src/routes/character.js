import express from 'express';
import { isDev } from '../utils/env.js';
import { createClient } from '@supabase/supabase-js';
import { selectById as checkAccount } from './account.js';

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const router = express.Router();

async function selectByAccount(accountId) {
  return new Promise(async resolve => {
    const { data, error } = await db
      .from('character')
      .select()
      .eq('account', accountId)
      .eq('is_deleted', false)
      .eq('is_dev', isDev());
    return resolve({ data, error });
  });
}

async function selectByName(name) {
  return new Promise(async resolve => {
    const { data, error } = await db
      .from('character')
      .select()
      .eq('name', name)
      .eq('is_deleted', false)
      .eq('is_dev', isDev());
    return resolve({ data, error });
  });
}

async function create(name, accountId) {
  return new Promise(async resolve => {
    const patternName = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/;
    if (!patternName.test(name))
      return resolve({
        error: { response: 400, message: 'Invalid name format' }
      });
    const nameLength = name.replace(/[\u4e00-\u9fa5]/g, '**').length;
    if (nameLength < 4 || nameLength > 16)
      return resolve({
        error: { response: 400, message: 'Invalid name length' }
      });
    const privateInfo = JSON.stringify({ str: 2 });
    const publicInfo = JSON.stringify({ hp: 10 });
    const { data, error } = await db
      .from('character')
      .insert({
        name: name,
        account: accountId,
        is_dev: isDev(),
        private_info: privateInfo,
        public_info: public_info
      })
      .select();
    return resolve({ data, error });
  });
}

// List characters in an account
router.post('/list', async function (req, res) {
  let results;

  // Check body
  if (!req.body.accountId) {
    req.info('400 Empty body');
    res.status(400).send('Empty body');
    return;
  }
  req.debug('Body accepted');

  // Check account
  results = await checkAccount(req.body.accountId);
  if (results.error) {
    req.error(`${results.error.code} ${results.error.message}`);
    res.status(500).send(results.error.message);
    return;
  }
  if (results.data.length === 0) {
    req.info('400 Account not exists');
    res.status(400).send('Account not exists');
    return;
  }
  req.debug('Account exists');

  // Get characters
  results = await selectByAccount(req.body.accountId);
  if (results.error) {
    req.error(`${results.error.code} ${results.error.message}`);
    res.status(500).send(results.error.message);
    return;
  }
  req.debug('Character selected');

  // Send character list
  req.info(`200 Characters listed. Data: ${JSON.stringify(results.data)}`);
  res.send(results.data);
});
/*
export async function selectById(id, db) {
  return new Promise(async resolve => {
    try {
      const { results } = await db.prepare(
        "SELECT * FROM Character WHERE ID = ?"
      )
        .bind(id)
        .all();
      return resolve({ error: null, data: results });
    } catch (e) {
      return resolve({ error: e.message, data: null });
    }
  })
}

async function deactive(name, db) {

}

export async function updateInfo(type, character, key, value, db) {
  // type 0 = private, type 1 = public
  return new Promise(async resolve => {
    try {
      switch (key) {
        case "party":
          break;
        default:
          throw ({ message: "Invalid key" });
      }
      const row = await selectById(character, db);
      if (row.error)
        return resolve(new Response(row.error, {
          status: 500,
        }));
      let info, sql;
      if (type) {
        info = JSON.parse(row.data[0].INFO_PUBLIC);
        sql = "UPDATE Character SET UPDATE_TIME = ?1, INFO_PUBLIC = ?2 WHERE ID = ?3 RETURNING *";
      }
      else {
        info = JSON.parse(row.data[0].INFO_PRIVATE);
        sql = "UPDATE Character SET UPDATE_TIME = ?1, INFO_PRIVATE = ?2 WHERE ID = ?3 RETURNING *";
      }
      info[key] = value;
      const { results } = await db.prepare(sql)
        .bind(now(), JSON.stringify(info), character)
        .all();
      return resolve({ error: null, data: results });
    } catch (e) {
      return resolve({ error: e.message, data: null });
    }
  })
}

router.post('/list', async function (req, res) {
  console.log('### Character API - List ###');

  // Get body data
  console.log('Body:', req.body);

  // Check body data
  if (!req.body.account) {
    console.log('X [400] Body data not acceptable');
    console.log('### Character API - List End ###');
    res.status(400).send('Body data not acceptable');
  };

  // Check account
  results = await account.selectById(req.body.account);
  if (results.error) {
    console.log(`X [500] ${results.error}`);
    console.log('### Character API - List End ###');
    res.status(500).send(results.error);
  };
  if (results.data.length === 0) {
    console.log(`X [406] Account not exists`);
    console.log('### Character API - List End ###');
    res.status(400).send('Account not exists');
  };

  // Get characters
  results = await selectByAccount(account);
  if (results.error) {
    console.log(`X [500] ${results.error}.`);
    console.log("### List Character End ###");
    return resolve(new Response(characters.error, {
      status: 500,
    }));
  };
  console.log("O [200] Success. Data:");
  console.log(results.data);
  console.log("### List Character End ###");
  return resolve(new Response(JSON.stringify(results.data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  }));
}

/*

export default async function (request, env) {
  return new Promise(async resolve => {
    console.log("$$$$$ Call character API $$$$$");
    const db = env.DB;
    const url = new URL(request.url);
    console.log("> Path: ", url.pathname);
    var results;

    // List characters in account
    if (url.pathname === "/character/list") {
      console.log("### List Character ###");

      // Get param
      const account = url.searchParams.get("account");
      console.log(`> Param: account: ${account}`)

      // Check param
      if (!account) {
        console.log("X [406] Params not acceptable.");
        console.log("### List Character End ###");
        return resolve(new Response(null, {
          status: 406,
        }));
      };

      // Check account
      results = await checkAccount(account, db);
      if (results.error) {
        console.log(`X [500] ${results.error}.`);
        console.log("### List Character End ###");
        return resolve(new Response(results.error, {
          status: 500,
        }));
      };
      if (results.data.length === 0) {
        console.log(`X [406] Account not exists.`);
        console.log("### List Character End ###");
        return resolve(new Response(null, {
          status: 406,
        }));
      };

      // Get characters
      results = await selectByAccount(account, db);
      if (results.error) {
        console.log(`X [500] ${results.error}.`);
        console.log("### List Character End ###");
        return resolve(new Response(characters.error, {
          status: 500,
        }));
      };
      console.log("O [200] Success. Data:");
      console.log(results.data);
      console.log("### List Character End ###");
      return resolve(new Response(JSON.stringify(results.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // Create character
    if (url.pathname === "/character/create") {
      console.log("### Create Character ###");

      // Get param
      const name = url.searchParams.get("name");
      const account = url.searchParams.get("account");
      console.log(`> Param: name: ${name} account: ${account}`)

      // Check param
      if (!account || !name) {
        console.log("X [406] Params not acceptable.");
        console.log("### Create Character End ###");
        return resolve(new Response(null, {
          status: 406,
        }));
      };

      // Check account
      results = await checkAccount(account, db);
      if (results.error) {
        console.log(`X [500] ${results.error}.`);
        console.log("### Create Character End ###");
        return resolve(new Response(results.error, {
          status: 500,
        }));
      };
      if (results.data.length === 0) {
        console.log(`X [406] Account not exists.`);
        console.log("### Create Character End ###");
        return resolve(new Response(null, {
          status: 406,
        }));
      };
      console.log("O Account exists.");

      // Check conflict
      results = await selectByName(name, db);
      if (results.error) {
        console.log(`X [500] ${results.error}.`);
        console.log("### Create Character End ###");
        return resolve(new Response(results.error, {
          status: 500,
        }));
      };
      if (results.data.length !== 0) {
        console.log(`X [409] NAME conflict.`);
        console.log("### Create Character End ###");
        return resolve(new Response(null, {
          status: 409,
        }));
      };
      results = await selectByAccount(account, db);
      if (results.error) {
        console.log(`X [500] ${results.error}.`);
        console.log("### Create Character End ###");
        return resolve(new Response(results.error, {
          status: 500,
        }));
      };
      if (results.data.length !== 0) {
        console.log(`X [409] Character full.`);
        console.log("### Create Character End ###");
        return resolve(new Response(null, {
          status: 409,
        }));
      };
      console.log("O No Conflict.");

      // Create characters
      results = await create(name, account, db);
      if (results.error === "Invalid NAME format" || results.error === "Invalid NAME length") {
        console.log(`X [406] ${results.error}.`);
        console.log("### Create Character End ###");
        return resolve(new Response(results.error, {
          status: 406,
        }));
      }
      else if (results.error) {
        console.log(`X [500] ${results.error}.`);
        console.log("### Create Character End ###");
        return resolve(new Response(results.error, {
          status: 500,
        }));
      };

      console.log(`O [201] Character created. ID: ${results.data}`);
      console.log("### Create Character End ###");
      return resolve(new Response(results.data, {
        status: 201,
        // headers: { 'Content-Type': 'application/json' }
      }));
    }

    // Unacceptable pathname
    console.log("X [406] Unacceptable pathname")
    return resolve(new Response(null, {
      status: 406,
    }));
  })
}

*/
router.use((req, res, next) => {
  req.info('404');
  res.status(404).send();
});

export default router;
