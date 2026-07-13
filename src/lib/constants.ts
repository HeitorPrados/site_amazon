import { Product } from '../types';

export const CATEGORIES = [
  ["Acessórios Eletrônicos", 15],["Automotivos e Esportes a Motor", 12],["Beleza", 13],
  ["Brinquedos e Jogos", 12],["Calçados", 14],["Câmeras e Fotografia", 11],
  ["Casa e Cozinha", 12],["Celulares", 11],["Cerveja e Vinho", 11],["Colchões", 15],
  ["Comidas e Bebidas", 10],["Computadores", 12],["Consoles de Videogame", 11],
  ["DIY e Ferramentas", 11],["Eletrodomésticos Grandes", 11],["Eletrônicos Portáteis", 13],
  ["Esportes, Aventura e Lazer", 12],["Ferramentas Elétricas Essenciais", 11],
  ["Gramado e Jardim", 12],["Instrumentos Musicais e Produção Audiovisual", 12],
  ["Joias", 14],["Mídia: Livros, DVD, Música, Software, Vídeo", 15],
  ["Mochilas, Bolsas, Bagagem e Acessórios de Viagem", 14],["Móveis", 15],["Óculos", 14],
  ["Outros", 15],["Papelaria e Escritório", 13],["Pneus", 10],
  ["Produtos de Beleza de Luxo", 14],["Produtos para Animais de Estimação", 12],
  ["Produtos para Bebês", 12],["Produtos para Cuidados Pessoais", 12],["Relógios", 13],
  ["Roupas e Acessórios", 14],["Saúde e Cuidado Pessoal", 12],
  ["Suprimentos Comerciais, Industriais e Científicos", 12],
  ["TV, Áudio e Cinema em Casa", 10],["Videogames e Acessórios para Jogos", 11],
] as const;

export const catRate = (cat: string) => {
  const f = CATEGORIES.find(c => c[0] === cat);
  return f ? f[1] : null;
};

export const sup = (id: string, label: string, url: string, price = "") => ({id, label, url, price});

export const DEFAULT_PRODUCTS: Product[] = [
  {asin:"B072VJ9BKX", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/xn6SPQWn")]},
  {asin:"B0D7Z8MHZK", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/PXXF6y42")]},
  {asin:"B09FJ8X1CX", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[
      sup("s1","principal","https://br.shp.ee/zDiGpWAu"), sup("s2","reserva","https://br.shp.ee/jPcdPFWQ"),
      sup("s3","reserva","https://br.shp.ee/2wjM4VKa"), sup("s4","reserva","https://br.shp.ee/hgw40sp7"),
  ]},
  {asin:"B0CBGZHBV7", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/y2h58n17")]},
  {asin:"B0CGVYKPPT", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/TBuB9kjm")]},
  {asin:"B0G278GR2P", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/8y3yZwMT")]},
  {asin:"B07N1V7S6Z", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/5LxMgj4m")]},
  {asin:"B0CFV5LZ3R", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/gcSyqD8x")]},
  {asin:"B0DC8VMRZL", nome:"", categoria:"", precoVenda:"", notas:"Precisa criar conta pra pegar 25% off na compra, pagando 29,99 em cada.", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/Ya5rwmgX")]},
  {asin:"B09NCFXWJL", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/cv646Dga")]},
  {asin:"B08V6KHNWT", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/wdg68f9f")]},
  {asin:"B082P7DC85", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/DRF5G1Tb")]},
  {asin:"B0CRDJBKGL", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/mWY8Da13")]},
  {asin:"B096PBCJLX", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/84Pyd8ZL")]},
  {asin:"B0C4JX1SBB", nome:"", categoria:"", precoVenda:"", notas:"", selected:"s1", suppliers:[sup("s1","principal","https://br.shp.ee/PcNxhTTL")]},
];

export const ORPHAN_LINKS = [
  {url:"https://br.shp.ee/xqbbmdvW", note:"sem ASIN logo abaixo — mensagem seguinte era telefone/CPF"},
  {url:"https://br.shp.ee/qVZ58UsW", note:"sem ASIN associado no grupo"},
  {url:"https://onelink.shein.com/42/5vilfgdb4x8e", note:"link da Shein, não da Shopee — conferir se é fornecedor"},
  {url:"https://br.shp.ee/ZSm4J5sg", note:"último link da conversa, sem ASIN em seguida"},
];
