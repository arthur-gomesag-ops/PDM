# Migração do backend Next para acesso direto ao Supabase

## Contexto

Este projeto começou com uma estrutura em que o app mobile fazia chamadas para um backend em Next.js localizado na pasta `api`, e esse backend repassava as requisições para o Supabase. A análise do código mostrou que esse backend não acrescentava lógica de negócio relevante; ele apenas fazia passagem de dados entre o app e o banco.

Diante disso, a missão desta etapa foi remover uma camada redundante, reduzir a complexidade da arquitetura e manter o sistema funcionando com acesso direto ao Supabase.

## Objetivo da mudança

Remover o backend em Next e fazer o app mobile acessar o Supabase diretamente, sem perder os fluxos principais de login, cadastro e operações.

## O que foi feito

### 1) Foram removidas as rotas do backend em Next

A pasta de backend foi removida:

- `api/`

Dentro dela estavam rotas relacionadas aos fluxos do sistema, como:

- `api/login/route.js`
- `api/cadastro/route.js`
- `api/monitoramento/route.js`
- `api/operacoes/route.js`
- `api/recursos/route.js`
- `api/sementes/route.js`
- `api/usuarios/route.js`
- `api/pendencias/[id]/route.js`
- `api/operacoes/[id]/aprovar/route.js`
- `api/operacoes/[id]/recusar/route.js`

Essas rotas eram redundantes porque o projeto já usava o Supabase para autenticação e armazenamento de dados.

### 2) Foi adicionado o cliente direto do Supabase no app

Foi criado o arquivo central de acesso ao banco:

- `lib/supabase.ts`

Ele concentra as funções do sistema, como:

- `loginAgricultor`
- `cadastrarUsuarioNoSupabase`
- `obterPerfilDoUsuarioLogado`
- `listarSementesDisponiveis`
- `listarRecursosDisponiveis`
- `criarOperacaoSolicitacao`
- `criarDoacaoSemente`
- `criarDoacaoRecurso`

Esse arquivo passou a ser o ponto central para autenticação, consultas e registros no banco.

### 3) Os fluxos do app foram ajustados para usar o Supabase diretamente

Os arquivos que antes dependiam da camada Next foram alterados para importar e consumir o cliente do Supabase diretamente:

- `app/login.tsx`
- `app/registrar.tsx`
- `app/Operacao/feijao.tsx`
- `app/Operacao/fava.tsx`
- `app/Operacao/OutrasSementes.tsx`
- `app/Operacao/solicitar-recurso.tsx`
- `app/Operacao/doar-semente.tsx`
- `app/Operacao/doar-recurso.tsx`

A ideia era manter o comportamento do app mas sem a camada extra de backend.

### 4) Foi corrigida a compatibilidade com Expo e web

A persistência de sessão foi ajustada para funcionar em ambiente web e nativo sem quebrar a execução do app. Isso foi necessário porque o app estava tentando usar armazenamento de sessão em um contexto incompatível.

Arquivo afetado:

- `lib/supabase.ts`

### 5) Foi ajustada a configuração de ambiente

A aplicação passou a priorizar as variáveis do Supabase no arquivo:

- `.env`

Valores usados:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

A variável antiga `EXPO_PUBLIC_API_URL` foi mantida apenas como compatibilidade, mas não é a fonte principal do projeto agora.

### 6) Foi removida a pasta de utilitários que estava dentro do app

A pasta:

- `app/lib/`

foi removida para evitar que o Expo Router a interpretasse como rota da aplicação. A lógica foi movida para a raiz do projeto:

- `lib/supabase.ts`

## O que foi apagado

- pasta `api/`
- toda a estrutura de rotas do backend Next
- pasta `app/lib/`

## O que foi adicionado

- cliente direto do Supabase em `lib/supabase.ts`
- lógica de autenticação e dados do app conectada diretamente ao banco
- persistência de sessão compatível com web/Expo

## O que foi modificado

- imports dos arquivos do app que antes usavam o backend
- configuração de ambiente em `.env`
- estrutura de arquivos para remover rotas falsas do Expo Router
- documentação da migração em `docs/migracao-next-supabase.md`

## Arquitetura final

A arquitetura atual ficou assim:

- app mobile em Expo / React Native
- rotas do Expo Router
- cliente direto do Supabase
- persistência local de sessão
- sem backend em Next como camada principal

## O que o sistema faz hoje

O fluxo principal da aplicação foi mantido em torno de:

- login do agricultor
- cadastro de usuário
- navegação na home
- acesso às telas de operação
- listagem de sementes e recursos
- criação de doações e solicitações

## O que ainda está pendente

A mudança cumpriu a missão de remover a camada redundante, mas o projeto ainda não está concluído como produto final. Ainda faltam refinamentos visuais e de negócio, como:

- perfil do usuário completo
- notificações
- alertas e feedbacks
- histórico funcional
- aprovação/recusa de pendências
- validação final do fluxo com dados reais

## Observação importante

A mudança foi feita com foco em simplificação, não em hardening de segurança. As regras de segurança do Supabase e políticas de acesso ainda precisam ser revisadas para uso em produção.

## Conclusão

A etapa principal foi concluída com sucesso: o backend em Next foi removido e o app passou a se comunicar diretamente com o Supabase. Isso reduziu a complexidade da arquitetura, eliminou um ponto redundante de infraestrutura e manteve o projeto em uma estrutura mais simples e direta.

Essa mudança é o marco principal da entrega atual, e o próximo passo natural é concluir o fluxo de experiência do usuário e fechar a parte de negócio do app.


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