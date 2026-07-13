import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('Cadastro realizado com sucesso! Verifique seu e-mail ou faça login.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_30%_20%,#141822_0%,#0b0d12_60%)]">
      <div className="w-full max-w-[380px] bg-panel border border-line-strong p-[28px_26px_26px]">
        <div className="font-mono text-[10.5px] tracking-[.14em] uppercase text-amber mb-1.5">Painel de Arbitragem</div>
        <h1 className="font-display text-[21px] m-0 mb-1 text-white">
          {isLogin ? 'Entrar na sua conta' : 'Criar sua conta'}
        </h1>
        <div className="text-muted text-[12px] mb-5 leading-relaxed">
          Seus produtos ficam salvos no seu banco Supabase — acesse do PC ou do celular.
        </div>
        
        <div className="flex border border-line-strong mb-[18px]">
          <div
            className={`flex-1 text-center py-[9px] cursor-pointer font-mono text-[11px] uppercase tracking-[.05em] transition-colors ${
              isLogin ? 'bg-amber text-[#0b0d12] font-semibold' : 'text-muted bg-panel2'
            }`}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setConfirmPassword('');
            }}
          >
            Entrar
          </div>
          <div
            className={`flex-1 text-center py-[9px] cursor-pointer font-mono text-[11px] uppercase tracking-[.05em] transition-colors ${
              !isLogin ? 'bg-amber text-[#0b0d12] font-semibold' : 'text-muted bg-panel2'
            }`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setConfirmPassword('');
            }}
          >
            Criar conta
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block font-mono text-[10px] uppercase tracking-[.06em] text-muted mb-[5px]">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-[10px_11px] border border-line-strong bg-panel2 text-ink font-sans text-[13px] focus:outline-none focus:border-amber transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div className="mb-3">
            <label className="block font-mono text-[10px] uppercase tracking-[.06em] text-muted mb-[5px]">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-[10px_11px] border border-line-strong bg-panel2 text-ink font-sans text-[13px] focus:outline-none focus:border-amber transition-colors"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="mb-3">
              <label className="block font-mono text-[10px] uppercase tracking-[.06em] text-muted mb-[5px]">Confirmar Senha</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-[10px_11px] border border-line-strong bg-panel2 text-ink font-sans text-[13px] focus:outline-none focus:border-amber transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[11px] border-none bg-amber text-[#0b0d12] font-mono text-[12px] font-bold uppercase tracking-[.04em] cursor-pointer mt-1.5 hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        {error && (
          <div className="mt-3 text-[11.5px] p-[9px_11px] font-mono leading-relaxed bg-red-soft text-red border border-[rgba(229,100,90,0.3)]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
