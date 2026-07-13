import { Product, Supplier } from '../types';
import { CATEGORIES, catRate } from '../lib/constants';

interface ProductRowProps {
  key?: string | number;
  product: Product;
  onChange: (updatedProduct: Product) => void;
  onDelete: (id: string) => void | Promise<void>;
  statusText: string;
  statusState: 'saving' | 'error' | '';
}

function money(v: number) {
  if (isNaN(v)) return "R$ 0,00";
  return "R$ " + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function computeMetrics(p: Product) {
  const venda = parseFloat(p.precoVenda);
  const selSup = (p.suppliers || []).find((s) => s.id === p.selected);
  const compra = selSup ? parseFloat(selSup.price) : NaN;
  const rate = catRate(p.categoria);
  if (isNaN(venda) || isNaN(compra) || rate === null || venda <= 0) return null;
  const taxa = venda * (rate / 100);
  const lucro = venda - taxa - compra;
  const margem = (lucro / venda) * 100;
  const roi = compra > 0 ? (lucro / compra) * 100 : null;
  return { taxa, lucro, margem, roi, rate };
}

function shortLink(url: string) {
  return (url || '').replace('https://', '').replace('http://', '');
}

export default function ProductRow({ product: p, onChange, onDelete, statusText, statusState }: ProductRowProps) {
  const m = computeMetrics(p);
  const rate = catRate(p.categoria);
  
  const lucroClass = m ? (m.lucro > 0 ? 'text-teal' : 'text-red') : 'text-muted2 text-[11px] font-normal';
  const margemClass = m ? (m.margem > 0 ? 'bg-teal-soft text-teal' : 'bg-red-soft text-red') : '';

  const handleFieldChange = (field: keyof Product, value: string) => {
    onChange({ ...p, [field]: value });
  };

  const handleSupplierPriceChange = (id: string, price: string) => {
    const suppliers = p.suppliers.map(s => s.id === id ? { ...s, price } : s);
    onChange({ ...p, suppliers });
  };

  const handleRemoveSupplier = (id: string) => {
    const suppliers = p.suppliers.filter(s => s.id !== id);
    let selected = p.selected;
    if (selected === id) {
      selected = suppliers.length > 0 ? suppliers[0].id : null;
    }
    onChange({ ...p, suppliers, selected });
  };

  const handleAddSupplier = (url: string) => {
    if (!url.trim()) return;
    const newId = 's' + Date.now() + Math.floor(Math.random() * 1000);
    const newSup: Supplier = {
      id: newId,
      label: p.suppliers.length === 0 ? 'principal' : 'reserva',
      url: url.trim(),
      price: ''
    };
    const suppliers = [...p.suppliers, newSup];
    onChange({ ...p, suppliers, selected: p.selected || newId });
  };

  return (
    <tr className="border-b border-line hover:bg-[rgba(224,152,63,0.035)] group">
      <td className="p-3 border-r border-line align-top w-[190px]">
        <div className="font-mono font-semibold text-[14px] text-white">{p.asin}</div>
        <a 
          href={`https://www.amazon.com.br/dp/${p.asin}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block mt-1 text-[10.5px] text-amber no-underline border-b border-dotted border-amber"
        >
          ver na Amazon →
        </a>
        <input
          type="text"
          placeholder="nome do produto..."
          value={p.nome}
          onChange={(e) => handleFieldChange('nome', e.target.value)}
          className="w-full mt-2 border-none border-b border-line-strong bg-transparent text-ink font-display text-[12.5px] py-1 focus:outline-none focus:border-amber transition-colors"
        />
        <textarea
          placeholder="observações..."
          value={p.notas}
          onChange={(e) => handleFieldChange('notas', e.target.value)}
          className="w-full mt-2 resize-y min-h-[32px] border border-line bg-panel2 text-muted font-sans text-[10.5px] p-[5px_6px] focus:outline-none focus:border-line-strong"
        />
      </td>

      <td className="p-3 border-r border-line align-top min-w-[320px]">
        <table className="w-full border-collapse">
          <tbody>
            {p.suppliers.map(s => (
              <tr key={s.id} className="border-b border-line last:border-b-0">
                <td className="w-[22px] text-center py-1">
                  <input
                    type="radio"
                    name={`pick-${p.id}`}
                    checked={p.selected === s.id}
                    onChange={() => handleFieldChange('selected', s.id)}
                    className="appearance-none w-[14px] h-[14px] border-[1.5px] border-muted2 rounded-full cursor-pointer relative m-0 checked:border-select checked:bg-select after:content-[''] after:absolute after:inset-[3px] after:bg-[#0b0d12] after:rounded-full after:opacity-0 checked:after:opacity-100"
                  />
                </td>
                <td className="w-[56px] pr-1.5 py-1">
                  <span className={`font-mono text-[8.5px] uppercase py-[2px] px-[5px] tracking-[.04em] whitespace-nowrap inline-block ${s.label === 'principal' ? 'bg-select-soft text-select' : 'bg-amber-soft text-amber'}`}>
                    {s.label}
                  </span>
                </td>
                <td className="max-w-[150px] overflow-hidden py-1">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" title={s.url} className="text-muted text-[11px] no-underline border-b border-dotted border-line-strong inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap align-bottom hover:text-ink hover:border-muted">
                    {shortLink(s.url) || '(sem link)'}
                  </a>
                </td>
                <td className="w-[100px] pl-2 py-1">
                  <div className={`flex items-center border bg-panel2 ${p.selected === s.id ? 'border-select' : 'border-line-strong'}`}>
                    <span className="pl-1.5 font-mono text-[10.5px] text-muted2">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={s.price}
                      onChange={(e) => handleSupplierPriceChange(s.id, e.target.value)}
                      className="border-none w-full p-[5px_5px_5px_3px] bg-transparent text-ink font-mono text-[11.5px] focus:outline-none"
                    />
                  </div>
                </td>
                <td className="w-[20px] text-center py-1">
                  <button onClick={() => handleRemoveSupplier(s.id)} title="remover fornecedor" className="cursor-pointer text-muted2 text-[12px] border-none bg-none p-0.5 hover:text-red">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-1.5 mt-2">
          <input
            type="text"
            placeholder="link do novo fornecedor..."
            className="flex-1 text-[10.5px] p-[5px_6px] border border-line bg-panel2 text-ink font-mono focus:outline-none focus:border-amber"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSupplier(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            id={`add-sup-${p.id}`}
          />
          <button 
            onClick={() => {
              const input = document.getElementById(`add-sup-${p.id}`) as HTMLInputElement;
              handleAddSupplier(input.value);
              input.value = '';
            }}
            className="p-[6px_10px] text-[10.5px] border border-line-strong bg-transparent text-muted font-mono font-semibold tracking-[.03em] uppercase cursor-pointer transition-colors hover:text-ink hover:border-ink"
          >
            + fornecedor
          </button>
        </div>
      </td>

      <td className="p-3 border-r border-line align-top w-[170px]">
        <select
          value={p.categoria}
          onChange={(e) => handleFieldChange('categoria', e.target.value)}
          className="w-full p-[7px_8px] border border-line-strong font-sans text-[11.5px] bg-panel2 text-ink focus:outline-none focus:border-amber"
        >
          <option value="">— selecionar —</option>
          {CATEGORIES.map(([name, r]) => (
            <option key={name} value={name}>{name} ({r as number}%)</option>
          ))}
        </select>
        {rate !== null && <span className="inline-block mt-[7px] font-mono text-[10px] bg-panel2 border border-line-strong text-muted p-[2px_7px]">taxa {rate}%</span>}
      </td>

      <td className="p-3 border-r border-line align-top w-[120px]">
        <div className="flex items-center border border-line-strong bg-panel2 focus-within:border-teal transition-colors">
          <span className="pl-[7px] font-mono text-[11px] text-muted2">R$</span>
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={p.precoVenda}
            onChange={(e) => handleFieldChange('precoVenda', e.target.value)}
            className="border-none w-full p-[7px_7px_7px_4px] bg-transparent text-ink font-mono text-[12.5px] focus:outline-none"
          />
        </div>
      </td>

      <td className="p-3 border-r border-line align-top w-[170px]">
        {m ? (
          <>
            <div className="font-mono text-[9.5px] text-muted uppercase tracking-[.06em]">lucro líquido</div>
            <div className={`font-display text-[19px] font-bold mt-0.5 ${lucroClass}`}>{money(m.lucro)}</div>
            <div className="mt-[7px] text-[10.5px] text-muted flex flex-col gap-0.5">
              <span>taxa ({m.rate}%): <b className="text-ink font-mono">{money(m.taxa)}</b></span>
            </div>
            <div className="mt-2 flex gap-[5px] flex-wrap">
              <span className={`font-mono text-[9.5px] p-[2px_6px] ${margemClass}`}>margem {m.margem.toFixed(1)}%</span>
              {m.roi !== null && <span className="font-mono text-[9.5px] p-[2px_6px] bg-amber-soft text-amber">ROI {m.roi.toFixed(1)}%</span>}
            </div>
          </>
        ) : (
          <>
            <div className="font-mono text-[9.5px] text-muted uppercase tracking-[.06em]">lucro líquido</div>
            <div className="font-display text-[11px] text-muted2 font-normal mt-0.5 font-mono">defina venda, categoria<br />e preço do fornecedor ●</div>
          </>
        )}
      </td>

      <td className="p-3 align-top w-[76px] text-center">
        <span className={`font-mono text-[9px] block mb-1.5 min-h-[11px] ${statusState === 'error' ? 'text-red' : statusState === 'saving' ? 'text-amber' : 'text-muted2'}`}>
          {statusText}
        </span>
        <button
          onClick={() => onDelete(p.id!)}
          className="p-[6px_10px] text-[10.5px] border border-red-soft bg-transparent text-red font-mono font-semibold tracking-[.03em] uppercase cursor-pointer hover:bg-red-soft transition-colors"
        >
          remover
        </button>
      </td>
    </tr>
  );
}
