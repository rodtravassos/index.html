import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TABELA = 'painel_dados';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from(TABELA)
        .select('chave,valor');
      if (error) throw error;
      const out = {};
      (data || []).forEach(r => { out[r.chave] = r.valor; });
      return res.status(200).json(out);
    }

    if (req.method === 'POST') {
      const { chave, valor } = req.body || {};
      if (!chave) return res.status(400).json({ error: 'chave obrigatória' });
      const { error } = await supabase
        .from(TABELA)
        .upsert({ chave, valor, atualizado_em: new Date().toISOString() });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'método não permitido' });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
