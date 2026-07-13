import { useEffect, useState, useRef, useMemo } from 'react';
import { Product } from '../types';
import { fetchProducts, insertProduct, updateProductRow, deleteProductRow, signOut } from '../lib/supabase';
import { ORPHAN_LINKS, catRate } from '../lib/constants';
import ProductRow from './ProductRow';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export default function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<{ state: 'saving' | 'error' | ''; msg: string }>({ state: '', msg: 'conectado ao Supabase' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVal, setFilterVal] = useState('all');
  const [newAsin, setNewAsin] = useState('');
  
  // Track individual row statuses
  const [rowStatuses, setRowStatuses] = useState<Record<string, { state: 'saving' | 'error' | ''; text: string }>>({});
  const saveTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setSyncStatus({ state: 'saving', msg: 'carregando produtos...' });
    setIsLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
      setSyncStatus({ state: '', msg: 'conectado ao Supabase' });
    } catch (e: any) {
      setSyncStatus({ state: 'error', msg: 'erro ao carregar: ' + e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newAsin) return;
    const clean = newAsin.trim().toUpperCase();
    if (products.find(p => p.asin === clean)) {
      setSyncStatus({ state: 'error', msg: 'Esse ASIN já está na planilha.' });
      return;
    }
    
    setSyncStatus({ state: 'saving', msg: 'criando produto...' });
    try {
      const newP = await insertProduct({ asin: clean, nome: "", categoria: "", precoVenda: "", notas: "", selected: null, suppliers: [] });
      setProducts([newP, ...products]);
      setNewAsin('');
      setSyncStatus({ state: '', msg: 'sincronizado' });
    } catch (e: any) {
      setSyncStatus({ state: 'error', msg: 'erro ao criar produto: ' + e.message });
    }
  };

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const scheduleSaveRow = (p: Product) => {
    const id = p.id!;
    setRowStatuses(prev => ({ ...prev, [id]: { state: 'saving', text: 'salvando...' } }));
    
    if (saveTimersRef.current[id]) {
      clearTimeout(saveTimersRef.current[id]);
    }

    saveTimersRef.current[id] = setTimeout(async () => {
      try {
        await updateProductRow(p);
        setRowStatuses(prev => ({ ...prev, [id]: { state: '', text: 'salvo ✓ ' + new Date().toLocaleTimeString('pt-BR') } }));
      } catch (e) {
        console.error(e);
        setRowStatuses(prev => ({ ...prev, [id]: { state: 'error', text: 'erro ao salvar' } }));
      }
    }, 700);
  };

  const handleProductChange = (updatedP: Product) => {
    setProducts(products.map(p => p.id === updatedP.id ? updatedP : p));
    scheduleSaveRow(updatedP);
  };

  const handleProductDelete = async (id: string) => {
    try {
      await deleteProductRow(id);
      setProducts(products.filter(p => p.id !== id));
      // Cleanup status/timer
      setRowStatuses(prev => { const next = {...prev}; delete next[id]; return next; });
      if (saveTimersRef.current[id]) clearTimeout(saveTimersRef.current[id]);
    } catch (e: any) {
      setSyncStatus({ state: 'error', msg: 'Não consegui remover: ' + e.message });
    }
  };

  const computeMetrics = (p: Product) => {
    const venda = parseFloat(p.precoVenda);
    const selSup = (p.suppliers || []).find(s => s.id === p.selected);
    const compra = selSup ? parseFloat(selSup.price) : NaN;
    const rate = catRate(p.categoria);
    if (isNaN(venda) || isNaN(compra) || rate === null || venda <= 0) return null;
    return {
      lucro: venda - (venda * (rate / 100)) - compra,
      margem: ((venda - (venda * (rate / 100)) - compra) / venda) * 100
    };
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const term = searchTerm.trim().toLowerCase();
      if (term && !p.asin.toLowerCase().includes(term) && !(p.nome || "").toLowerCase().includes(term)) return false;
      if (filterVal === 'all') return true;
      const m = computeMetrics(p);
      if (filterVal === 'filled') return !!m;
      if (filterVal === 'empty') return !m;
      if (filterVal === 'pos') return m && m.lucro > 0;
      if (filterVal === 'neg') return m && m.lucro <= 0;
      return true;
    }).sort((a, b) => {
      const nameA = (a.nome || '').trim().toLowerCase();
      const nameB = (b.nome || '').trim().toLowerCase();
      
      if (nameA && !nameB) return -1;
      if (!nameA && nameB) return 1;
      
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [products, searchTerm, filterVal]);

  const stats = useMemo(() => {
    const metrics = products.map(computeMetrics).filter(m => m !== null);
    const pos = metrics.filter(m => m!.lucro > 0).length;
    const avg = metrics.length ? metrics.reduce((a, m) => a + m!.margem, 0) / metrics.length : null;
    return {
      total: products.length,
      filled: metrics.length,
      pos,
      avg: avg !== null ? avg.toFixed(1) + "%" : "–"
    };
  }, [products]);

  return (
    <div id="appShell">
      <header className="header-bg p-[20px] md:p-[26px_30px_20px] border-b border-line-strong flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-4">
        <div>
          <div className="font-mono text-[11px] tracking-[.14em] uppercase text-amber mb-1.5">Controle de sourcing · Shopee → Amazon</div>
          <h1 className="font-display text-[26px] m-0 tracking-[-0.02em] text-white">Painel de Arbitragem</h1>
          <div className="text-muted text-[12.5px] mt-1.5 max-w-[520px] leading-relaxed">
            Marque o fornecedor escolhido em cada produto — ele vira o preço de compra usado na margem.
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted self-end">
            <span id="userEmail">{userEmail}</span>
            <button onClick={handleLogout} className="bg-transparent border border-line-strong text-muted font-mono text-[10px] uppercase p-[4px_9px] cursor-pointer hover:text-red hover:border-red-soft transition-colors">
              sair
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-line-strong bg-panel font-mono w-full">
            <div className="p-[9px_12px] md:p-[9px_16px] border-r border-b sm:border-b-0 border-line-strong min-w-[90px] md:min-w-[100px]">
              <div className="font-display text-[19px] font-bold text-white">{stats.total}</div>
              <div className="font-mono text-[9px] md:text-[9.5px] uppercase tracking-[.08em] text-muted mt-0.5">produtos</div>
            </div>
            <div className="p-[9px_12px] md:p-[9px_16px] sm:border-r border-b sm:border-b-0 border-line-strong min-w-[90px] md:min-w-[100px]">
              <div className="font-display text-[19px] font-bold text-white">{stats.filled}</div>
              <div className="font-mono text-[9px] md:text-[9.5px] uppercase tracking-[.08em] text-muted mt-0.5">c/ margem</div>
            </div>
            <div className="p-[9px_12px] md:p-[9px_16px] border-r border-line-strong min-w-[90px] md:min-w-[100px]">
              <div className="font-display text-[19px] font-bold text-white">{stats.pos}</div>
              <div className="font-mono text-[9px] md:text-[9.5px] uppercase tracking-[.08em] text-muted mt-0.5">margem +</div>
            </div>
            <div className="p-[9px_12px] md:p-[9px_16px] min-w-[90px] md:min-w-[100px]">
              <div className="font-display text-[19px] font-bold text-white">{stats.avg}</div>
              <div className="font-mono text-[9px] md:text-[9.5px] uppercase tracking-[.08em] text-muted mt-0.5">margem média</div>
            </div>
          </div>
        </div>
      </header>
      <div className="p-[7px_20px] md:p-[7px_30px] bg-[#0e1117] border-b border-line flex items-center gap-2 font-sans text-[10.5px] text-muted2">
        <span className={`w-[7px] h-[7px] rounded-full shrink-0 transition-colors ${syncStatus.state === 'saving' ? 'bg-amber animate-pulse-sync' : syncStatus.state === 'error' ? 'bg-red' : 'bg-teal'}`}></span>
        <span className="font-mono">{syncStatus.msg}</span>
      </div>

      <main className="p-[16px_20px_60px] md:p-[20px_30px_60px]">
        <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center mb-3.5">
          <input
            type="text"
            placeholder="Buscar por ASIN ou nome do produto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 w-full md:min-w-[220px] p-[9px_12px] border border-line-strong bg-panel text-ink font-mono text-[12.5px] focus:outline-none focus:border-amber placeholder:text-muted2"
          />
          <select
            value={filterVal}
            onChange={e => setFilterVal(e.target.value)}
            className="w-full md:w-auto p-[9px_10px] border border-line-strong bg-panel text-ink font-sans text-[12.5px] focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="filled">Com margem calculada</option>
            <option value="empty">Sem margem</option>
            <option value="pos">Margem positiva</option>
            <option value="neg">Margem negativa</option>
          </select>
          <div className="flex flex-1 gap-2 w-full md:min-w-[220px]">
            <input
              type="text"
              placeholder="Digite o ASIN para adicionar..."
              value={newAsin}
              onChange={e => setNewAsin(e.target.value)}
              className="flex-1 p-[9px_12px] border border-line-strong bg-panel text-ink font-mono text-[12.5px] focus:outline-none focus:border-amber placeholder:text-muted2"
            />
            <button
              onClick={handleAddProduct}
              disabled={!newAsin}
              className="whitespace-nowrap p-[6px_10px] text-[10.5px] border border-line-strong bg-transparent text-muted font-mono font-semibold tracking-[.03em] uppercase cursor-pointer transition-colors hover:text-ink hover:border-ink disabled:opacity-50"
            >
              + adicionar
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-[60px_30px] font-mono text-muted">carregando seus produtos...</div>
        ) : products.length === 0 ? (
          <div className="p-[34px] text-center border border-dashed border-line-strong bg-panel mt-4">
            <p className="text-muted text-[12.5px] max-w-[440px] mx-auto leading-[1.6]">
              Sua conta ainda não tem produtos cadastrados. Adicione um novo produto pelo ASIN acima.
            </p>
          </div>
        ) : (
          <div className="md:border md:border-line-strong md:bg-panel -mx-[20px] md:mx-0">
            <table className="w-full border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr>
                  <th className="sticky top-0 bg-[#181c26] text-muted font-mono text-[10px] uppercase tracking-[.07em] font-semibold text-left p-[10px_12px] border-b border-line-strong border-r border-line whitespace-nowrap">Produto / ASIN</th>
                  <th className="sticky top-0 bg-[#181c26] text-muted font-mono text-[10px] uppercase tracking-[.07em] font-semibold text-left p-[10px_12px] border-b border-line-strong border-r border-line whitespace-nowrap">Fornecedores (Shopee)</th>
                  <th className="sticky top-0 bg-[#181c26] text-muted font-mono text-[10px] uppercase tracking-[.07em] font-semibold text-left p-[10px_12px] border-b border-line-strong border-r border-line whitespace-nowrap">Categoria</th>
                  <th className="sticky top-0 bg-[#181c26] text-muted font-mono text-[10px] uppercase tracking-[.07em] font-semibold text-left p-[10px_12px] border-b border-line-strong border-r border-line whitespace-nowrap">Venda</th>
                  <th className="sticky top-0 bg-[#181c26] text-muted font-mono text-[10px] uppercase tracking-[.07em] font-semibold text-left p-[10px_12px] border-b border-line-strong border-r border-line whitespace-nowrap">Margem / Lucro</th>
                  <th className="sticky top-0 bg-[#181c26] text-muted font-mono text-[10px] uppercase tracking-[.07em] font-semibold text-left p-[10px_12px] border-b border-line-strong whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {filteredProducts.length === 0 ? (
                  <tr className="block md:table-row">
                    <td colSpan={6} className="block md:table-cell p-0 md:border-r border-line last:border-r-0">
                      <div className="font-mono text-[11.5px] text-muted p-4 border border-dashed border-line-strong bg-panel m-2">
                        Nenhum produto encontrado com esse filtro.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      onChange={handleProductChange}
                      onDelete={handleProductDelete}
                      statusText={rowStatuses[p.id!]?.text || ''}
                      statusState={rowStatuses[p.id!]?.state || ''}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!searchTerm && filterVal === 'all' && products.length > 0 && (
          <div className="mt-[30px] border-t border-line-strong pt-4">
            <h2 className="font-display text-[15px] m-0 mb-1.5 text-white">Links soltos (sem ASIN identificado)</h2>
            <p className="text-muted text-[12px] m-0 mb-2.5 max-w-[640px]">
              Esses links da Shopee apareceram no grupo sem um ASIN logo abaixo — confira e associe a um produto se for o caso.
            </p>
            <div className="flex flex-col gap-1.5">
              {ORPHAN_LINKS.map((o, i) => (
                <div key={i} className="font-mono text-[11.5px] bg-panel border border-line p-[8px_12px] flex justify-between gap-2.5 items-center flex-wrap">
                  <a href={o.url} target="_blank" rel="noopener noreferrer" className="text-amber no-underline hover:underline">{o.url}</a>
                  <span className="text-muted text-[10.5px]">{o.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-[34px] pt-3.5 border-t border-line text-[10.5px] text-muted2 font-mono flex gap-[22px] flex-wrap">
          <span><b className="text-muted font-normal">Margem</b> = lucro ÷ preço de venda</span>
          <span><b className="text-muted font-normal">ROI</b> = lucro ÷ preço de compra escolhido</span>
          <span><b className="text-muted font-normal">Preço de compra</b> = fornecedor marcado</span>
          <span><b className="text-muted font-normal">Taxa Amazon</b> = % da categoria sobre o preço de venda</span>
          <span>Dados salvos no seu banco Supabase, protegidos por login.</span>
        </footer>
      </main>
    </div>
  );
}
