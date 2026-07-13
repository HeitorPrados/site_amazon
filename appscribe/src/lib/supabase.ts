import { supabase } from './supabaseClient';
import { Product } from '../types';

export const TABLE = "produtos_arbitragem";

function dbToProduct(row: any): Product {
  return {
    id: row.id,
    asin: row.asin,
    nome: row.nome || '',
    categoria: row.categoria || '',
    precoVenda: row.preco_venda === null || row.preco_venda === undefined ? '' : String(row.preco_venda),
    notas: row.notas || '',
    selected: row.selected_supplier,
    suppliers: row.suppliers || [],
  };
}

function productToDb(p: Product) {
  return {
    asin: p.asin,
    nome: p.nome,
    categoria: p.categoria,
    preco_venda: p.precoVenda === '' || p.precoVenda === null || p.precoVenda === undefined ? null : parseFloat(p.precoVenda),
    notas: p.notas,
    selected_supplier: p.selected,
    suppliers: p.suppliers,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message || 'Erro ao carregar seus produtos do Supabase.');
  return (data || []).map(dbToProduct);
}

export async function insertProduct(p: Product): Promise<Product> {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) throw new Error('Usuário não autenticado.');

  const payload = { user_id: userData.user.id, ...productToDb(p) };
  
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select();

  if (error) throw new Error(error.message || 'Erro ao criar produto.');
  if (!data || data.length === 0) throw new Error('Produto não retornado após inserção.');
  return dbToProduct(data[0]);
}

export async function updateProductRow(p: Product): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update(productToDb(p))
    .eq('id', p.id);

  if (error) throw new Error(error.message || 'Erro ao salvar.');
}

export async function deleteProductRow(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message || 'Erro ao remover produto.');
}

export async function bulkImportDefaults(defaultProducts: Product[]): Promise<Product[]> {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) throw new Error('Usuário não autenticado.');

  const rows = defaultProducts.map(p => ({ user_id: userData.user.id, ...productToDb(p) }));
  
  const { data, error } = await supabase
    .from(TABLE)
    .insert(rows)
    .select();

  if (error) throw new Error(error.message || 'Erro ao importar produtos.');
  return (data || []).map(dbToProduct);
}

export async function signOut() {
  await supabase.auth.signOut();
}
