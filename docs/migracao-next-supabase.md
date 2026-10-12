# Migração do backend Next para acesso direto ao Supabase

## Contexto

Este projeto começou com uma estrutura em que o app mobile fazia chamadas para um backend em Next.js, localizado na pasta `api`, e esse backend repassava as requisições para o Supabase. A análise do código mostrou que esse backend não adicionava lógica de negócio relevante; ele basicamente fazia um pass-through entre o app e o banco.

Diante disso, o objetivo principal da mudança foi simplificar a arquitetura e remover um ponto redundante de infraestrutura sem perder a funcionalidade do sistema.

## Objetivo da mudança

Remover a camada do Next.js e deixar o app mobile acessando diretamente o Supabase, preservando o comportamento do sistema enquanto reduz a complexidade da solução.

## O que foi feito

### 1. remoção da camada redundante

Foi removida a dependência do backend em Next para os fluxos principais do aplicativo, principalmente os de:

- login
- cadastro
- listagem de sementes
- listagem de recursos
- criação de operações
- doações e solicitações

### 2. criação do cliente direto do Supabase no app

Foi criado o arquivo principal de acesso ao banco em:

- `lib/supabase.ts`

Esse arquivo centraliza as conexões e as funções de domínio do app, como:

- `loginAgricultor`
- `cadastrarUsuarioNoSupabase`
- `obterPerfilDoUsuarioLogado`
- `listarSementesDisponiveis`
- `listarRecursosDisponiveis`
- `criarOperacaoSolicitacao`
- `criarDoacaoSemente`
- `criarDoacaoRecurso`

### 3. compatibilidade com variáveis de ambiente

Foi mantida a variável antiga de compatibilidade `EXPO_PUBLIC_API_URL` apenas como legado, mas a aplicação passou a priorizar as variáveis do Supabase:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 4. compatibilidade com web/Expo

Foi ajustado o uso de armazenamento de sessão para funcionar corretamente no ambiente web, evitando que o app tente usar `expo-secure-store` em contexto inadequado.

## Arquitetura atual

A arquitetura atual do projeto ficou assim:

- app mobile Expo/React Native
- rotas do Expo Router
- acesso direto ao Supabase
- sessão armazenada localmente no ambiente apropriado
- sem backend Next no fluxo principal

## Fluxos que a aplicação já tenta cobrir

A estrutura do app é organizada para o seguinte comportamento:

- login do agricultor
- cadastro do usuário
- navegação da home
- acesso à área de operações
- listagem de sementes e recursos
- criação de solicitações e doações

## Estado real do projeto

### Concluído

- remoção da camada Next redundante
- migração do acesso ao Supabase para o app
- validação básica de compilação do projeto
- compatibilidade para execução local do app

### Ainda pendente para produto final

O projeto ainda não está completamente finalizado como produto de uso real. O que continua pendente é a camada de experiência e regras de negócio do usuário, por exemplo:

- tela de perfil com dados reais do usuário
- notificações
- alertas e feedbacks visuais de ação
- confirmação de operações concluídas
- histórico funcional
- pendências e aprovações
- integrações de regras de negócio mais completas com o banco
- review final de validação de fluxo completo para usuário real

## Observação importante sobre segurança

A mudança foi feita com foco em remover redundância e simplificar a arquitetura. Não houve, nesta etapa, revisão aprofundada de políticas de segurança e RLS do Supabase. Esse é um passo posterior recomendado para ambiente de produção.

## Estrutura relevante do projeto

Arquivos diretamente ligados à migração e ao fluxo atual:

- `app/login.tsx`
- `app/registrar.tsx`
- `app/homepage/home.tsx`
- `app/homepage/perfil.tsx`
- `app/Operacao/feijao.tsx`
- `app/Operacao/fava.tsx`
- `app/Operacao/OutrasSementes.tsx`
- `app/Operacao/solicitar-recurso.tsx`
- `app/Operacao/doar-semente.tsx`
- `app/Operacao/doar-recurso.tsx`
- `lib/supabase.ts`
- `.env`

#