import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY ?? "";

const secureStoreAdapter = {
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key);
    return value ?? null;
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

const webStorageAdapter = {
  getItem: (key: string) => {
    if (typeof globalThis === "undefined") return null;

    const storage = globalThis.localStorage;
    if (!storage) return null;

    return storage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof globalThis === "undefined") return;

    const storage = globalThis.localStorage;
    if (!storage) return;

    storage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof globalThis === "undefined") return;

    const storage = globalThis.localStorage;
    if (!storage) return;

    storage.removeItem(key);
  },
};

const storageAdapter = Platform.OS === "web" ? webStorageAdapter : secureStoreAdapter;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: storageAdapter,
  },
});

export async function salvarSessaoNoStore(session: any) {
  if (!session) return;

  if (Platform.OS === "web") {
    webStorageAdapter.setItem("supabase_session", JSON.stringify(session));
    return;
  }

  await SecureStore.setItemAsync("supabase_session", JSON.stringify(session));
}

export async function carregarSessaoDoStore() {
  const sessaoSalva =
    Platform.OS === "web"
      ? webStorageAdapter.getItem("supabase_session")
      : await SecureStore.getItemAsync("supabase_session");

  if (!sessaoSalva) return null;

  try {
    return JSON.parse(sessaoSalva);
  } catch {
    return null;
  }
}

export async function salvarUsuarioNoStore(usuario: any) {
  if (!usuario) return;

  if (Platform.OS === "web") {
    webStorageAdapter.setItem("usuario_logado", JSON.stringify(usuario));
    return;
  }

  await SecureStore.setItemAsync("usuario_logado", JSON.stringify(usuario));
}

export async function carregarUsuarioDoStore() {
  const usuarioSalvo =
    Platform.OS === "web"
      ? webStorageAdapter.getItem("usuario_logado")
      : await SecureStore.getItemAsync("usuario_logado");

  if (!usuarioSalvo) return null;

  try {
    return JSON.parse(usuarioSalvo);
  } catch {
    return null;
  }
}

export async function obterPerfilDoUsuarioLogado() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) return null;

  const { data: agricultor } = await supabase
    .from("agricultor")
    .select("*")
    .eq("email", user.email)
    .maybeSingle();

  if (agricultor) {
    return { ...agricultor, papel: "agricultor" };
  }

  const { data: gerente } = await supabase
    .from("gerente")
    .select("*")
    .eq("email", user.email)
    .maybeSingle();

  if (gerente) {
    return { ...gerente, papel: "gerente" };
  }

  return null;
}

export async function loginAgricultor(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Email ou senha incorretos.");
  }

  const usuario = await obterPerfilDoUsuarioLogado();

  if (!usuario) {
    throw new Error("Login realizado, mas não foi possível carregar o perfil.");
  }

  return {
    session: data.session,
    usuario,
  };
}

export async function cadastrarUsuarioNoSupabase({
  nome,
  telefone,
  cpf,
  email,
  senha,
  papel = "agricultor",
}: {
  nome: string;
  telefone: string;
  cpf: string;
  email: string;
  senha: string;
  papel?: "agricultor" | "gerente";
}) {
  const papelFinal = papel === "gerente" ? "gerente" : "agricultor";

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: senha,
    options: {
      data: {
        nome: nome.trim(),
        telefone: telefone.trim(),
        cpf: cpf.trim(),
        papel: papelFinal,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Não foi possível criar o usuário.");
  }

  return {
    usuario: {
      nome,
      telefone,
      cpf,
      email,
      papel: papelFinal,
    },
    user: data.user,
  };
}

export async function listarSementesDisponiveis(tipo?: string) {
  let query = supabase.from("semente").select("*").gt("quantidade", 0);

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query.order("tipo", { ascending: true });

  return { data: data ?? [], error };
}

export async function listarRecursosDisponiveis() {
  const { data, error } = await supabase
    .from("recurso")
    .select("*")
    .gt("quantidade", 0)
    .order("nome_recurso", { ascending: true });

  return { data: data ?? [], error };
}

export async function criarOperacaoSolicitacao({
  id_semente,
  id_recurso,
  quantidade,
}: {
  id_semente?: number | null;
  id_recurso?: number | null;
  quantidade: number;
}) {
  const usuario = await obterPerfilDoUsuarioLogado();

  if (!usuario || usuario.papel !== "agricultor") {
    throw new Error("Sua sessão não está válida para esta operação.");
  }

  const { data, error } = await supabase
    .from("operação")
    .insert({
      tipo: "solicitação",
      status: "pendente",
      cpf_agricultor: usuario.cpf_agricultor,
      id_semente: id_semente ?? null,
      id_recurso: id_recurso ?? null,
      quantidade: Number(quantidade),
      data_operação: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function criarDoacaoSemente({
  tipo,
  subtipo,
  quantidade,
}: {
  tipo: string;
  subtipo: string;
  quantidade: number;
}) {
  const usuario = await obterPerfilDoUsuarioLogado();

  if (!usuario || usuario.papel !== "agricultor") {
    throw new Error("Sua sessão não está válida para esta operação.");
  }

  let { data: semente, error: erroBusca } = await supabase
    .from("semente")
    .select("*")
    .ilike("tipo", tipo.trim())
    .ilike("subtipo", subtipo.trim())
    .maybeSingle();

  if (erroBusca) {
    throw new Error(erroBusca.message);
  }

  if (!semente) {
    const { data: novaSemente, error: erroCriar } = await supabase
      .from("semente")
      .insert({
        tipo: tipo.trim(),
        subtipo: subtipo.trim(),
        quantidade: 0,
      })
      .select()
      .single();

    if (erroCriar) {
      throw new Error(erroCriar.message);
    }

    semente = novaSemente;
  }

  const { data, error } = await supabase
    .from("operação")
    .insert({
      tipo: "doação",
      status: "pendente",
      cpf_agricultor: usuario.cpf_agricultor,
      id_semente: semente.id_semente,
      quantidade: Number(quantidade),
      data_operação: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function criarDoacaoRecurso({
  nome_recurso,
  quantidade,
}: {
  nome_recurso: string;
  quantidade: number;
}) {
  const usuario = await obterPerfilDoUsuarioLogado();

  if (!usuario || usuario.papel !== "agricultor") {
    throw new Error("Sua sessão não está válida para esta operação.");
  }

  let { data: recurso, error: erroBusca } = await supabase
    .from("recurso")
    .select("*")
    .ilike("nome_recurso", nome_recurso.trim())
    .maybeSingle();

  if (erroBusca) {
    throw new Error(erroBusca.message);
  }

  if (!recurso) {
    const { data: novoRecurso, error: erroCriar } = await supabase
      .from("recurso")
      .insert({
        nome_recurso: nome_recurso.trim(),
        quantidade: 0,
      })
      .select()
      .single();

    if (erroCriar) {
      throw new Error(erroCriar.message);
    }

    recurso = novoRecurso;
  }

  const { data, error } = await supabase
    .from("operação")
    .insert({
      tipo: "doação",
      status: "pendente",
      cpf_agricultor: usuario.cpf_agricultor,
      id_recurso: recurso.id_recurso,
      quantidade: Number(quantidade),
      data_operação: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
