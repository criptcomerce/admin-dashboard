import Cookies from 'js-cookie';

export const AUTH_COOKIE = 'admin_token';

export const getToken = (): string | undefined => Cookies.get(AUTH_COOKIE);

export const setToken = (token: string) => {
  Cookies.set(AUTH_COOKIE, token, {
    expires: 1,        // 1 dia
    sameSite: 'strict',
    // secure: true,   // ativar em produção (HTTPS)
  });
};

export const removeToken = () => Cookies.remove(AUTH_COOKIE);

export const isAuthenticated = (): boolean => !!getToken();

/** Formata valor em USD */
export const formatUSD = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

/** Formata data/hora para exibição */
export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
};

/** Trunca endereço blockchain para exibição */
export const truncateAddress = (addr: string | null | undefined): string => {
  if (!addr) return '—';
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
};

/** Copia texto para clipboard */
export const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};
