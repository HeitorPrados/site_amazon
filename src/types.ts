export interface Supplier {
  id: string;
  label: string;
  url: string;
  price: string;
}

export interface Product {
  id?: string;
  asin: string;
  nome: string;
  categoria: string;
  precoVenda: string;
  notas: string;
  selected: string | null;
  suppliers: Supplier[];
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string };
  expires_at: number;
}
