import express from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const router = express.Router();

router.get('/', async (req, res) => {
    const { data, error } = await supabase
      .from('account')
      .insert({ mail: '178958037@qq.com', pass: '123456789' })
      .select();
      if (error) {
        console.error(error);
        res.status(500).send({ error });
        return;
      }
    console.log(data);
    res.status(200).send({ data });
    return;
});

export default router;
