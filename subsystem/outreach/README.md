# Demo Outreach - Docker Orchestrator dos Containers de Jupyter Notebooks

Este repositório contém o código-fonte de um Orquestrador Docker desenvolvido em Node.js com TypeScript. O objetivo do projeto é automatizar a implantação de notebooks Jupyter a partir de projetos armazenados em um repositório GitLab, gerenciando a construção de imagens Docker, envio para um Docker Registry privado e execução dos contêineres correspondentes.

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração Inicial](#configuração-inicial)
  - [1. Clonar o Repositório](#1-clonar-o-repositório)
  - [2. Gerar a Chave SSH](#2-gerar-a-chave-ssh)
  - [3. Configurar o GitLab](#3-configurar-o-gitlab)
  - [4. Configurar o Arquivo de Ambiente](#4-configurar-o-arquivo-de-ambiente)
  - [5. Instalar Dependências](#5-instalar-dependências)
- [Uso do Orquestrador](#uso-do-orquestrador)
  - [Iniciar o Orquestrador](#iniciar-o-orquestrador)
  - [Parar e Remover o Orquestrador](#parar-e-remover-o-orquestrador)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configurações](#configurações)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Considerações de Segurança](#considerações-de-segurança)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Visão Geral

O Docker Orchestrator automatiza o processo de implantação de notebooks Jupyter a partir de projetos em um repositório GitLab. Ele:

- Clona ou atualiza o repositório GitLab.
- Gera um Dockerfile personalizado para cada projeto de notebook.
- Constrói a imagem Docker do notebook.
- Envia a imagem para um Docker Registry privado.
- Executa o contêiner Docker do notebook.
- Atualiza o arquivo `URL.md` no GitLab com o link para acessar o notebook.

## Arquitetura do Projeto

- **Node.js com TypeScript**: Linguagem de programação e tipagem estática.
- **Express.js**: Framework web para criar uma API REST.
- **Dockerode**: Biblioteca para interagir com o Docker via Node.js.
- **Simple-Git**: Biblioteca para operações Git em Node.js.
- **pnpm**: Gerenciador de pacotes rápido e eficiente.
- **tsx**: Ferramenta para executar arquivos TypeScript diretamente.

## Pré-requisitos

- **Node.js** versão 20 ou superior.
- **Docker** instalado e em execução.
- **pnpm** instalado globalmente.
- Acesso ao repositório GitLab com os projetos de notebooks.
- Acesso ao Docker Registry privado (`registry.simple4decision.com`).

## Configuração Inicial

### 1. Gerar a Chave SSH

Gere uma chave SSH específica para o orquestrador:

```bash
ssh-keygen -t rsa -b 4096 -C "outreach" -f ~/outreach_id_rsa
chmod 600 ~/outreach_id_rsa
```

### 2. Configurar o GitLab

- **Adicionar a Chave Pública**: Vá até **Settings > Repository > Deploy Keys** no GitLab.
- **Adicionar Chave**: Cole o conteúdo de `~/outreach_id_rsa.pub`.
- **Permissões**: Marque a opção **"Write access"** para permitir commits.

### 3. Configurar o Arquivo de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```dotenv
AUTH_TOKEN=seu-token-secreto
HOSTNAME=seu-servidor
REGISTRY_USERNAME=seu-usuario
REGISTRY_PASSWORD=sua-senha
```

**Importante**:

- Substitua os valores pelas suas credenciais reais.
- **Não** adicione este arquivo ao controle de versão.
- Adicione `.env` ao `.gitignore`.

### 5. Instalar Dependências

Instale as dependências do projeto:

```bash
pnpm install
```

## Uso do Orquestrador

### Iniciar o Orquestrador

Para construir a imagem Docker e iniciar o orquestrador, execute:

```bash
pnpm run docker:start
```

### Parar e Remover o Orquestrador

Para parar e remover o contêiner do orquestrador:

```bash
pnpm run docker:stop
pnpm run docker:rm
```

## Estrutura do Projeto

```
outreach/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── orchestrator.env
├── Dockerfile
├── .gitignore
└── src/
    ├── config.ts
    ├── index.ts
    ├── orchestrator.ts
    ├── gitManager.ts
    └── dockerManager.ts
```

- **package.json**: Configurações do projeto e scripts.
- **tsconfig.json**: Configurações do TypeScript.
- **orchestrator.env**: Variáveis de ambiente sensíveis.
- **Dockerfile**: Instruções para construir a imagem Docker do orquestrador.
- **src/**: Código-fonte do orquestrador.

## Configurações

### src/config.ts

Centraliza as configurações do projeto:

```typescript
export const config = {
  git: {
    repoUrl: 'git@gitlab.uspdigital.usp.br:eixosia/utils-public.git',
    branch: 'main',
  },
  docker: {
    registry: 'registry.simple4decision.com',
    registryUsername: process.env.REGISTRY_USERNAME,
    registryPassword: process.env.REGISTRY_PASSWORD,
  },
  paths: {
    repoPath: '/app/repo',
  },
  server: {
    hostname: process.env.HOSTNAME,
  },
  authToken: process.env.AUTH_TOKEN,
};
```

**Nota**: Informações sensíveis são obtidas das variáveis de ambiente.

## Scripts Disponíveis

- **pnpm run start**: Inicia o aplicativo localmente.
- **pnpm run build**: Compila o código TypeScript.
- **pnpm run docker:build**: Constrói a imagem Docker do orquestrador.
- **pnpm run docker:run**: Executa o contêiner Docker do orquestrador.
- **pnpm run docker:stop**: Para o contêiner do orquestrador.
- **pnpm run docker:rm**: Remove o contêiner do orquestrador.
- **pnpm run docker:start**: Executa `docker:stop`, `docker:rm`, `docker:build` e `docker:run` em sequência.

## Fluxo de Trabalho

1. **Atualização no GitLab**: Um novo projeto é adicionado ou atualizado no repositório GitLab.
2. **Notificação**: O pipeline CI/CD do GitLab notifica o orquestrador via API.
3. **Orquestrador Processa o Projeto**:
   - Clona ou atualiza o repositório.
   - Gera o Dockerfile do projeto.
   - Constrói a imagem Docker.
   - Envia a imagem para o Docker Registry.
   - Executa o contêiner do notebook.
   - Atualiza o `URL.md` no GitLab com o link do notebook.
4. **Acesso ao Notebook**: O usuário acessa o notebook via URL fornecida.

## Considerações de Segurança

- **Proteja o arquivo `.env`**:
  - Não o adicione ao controle de versão.
  - Defina permissões restritivas (`chmod 600`).
- **Chave SSH Privada**:
  - Mantenha a chave privada segura.
  - Não compartilhe a chave com terceiros.
- **Acesso ao Servidor**:
  - Restrinja o acesso ao servidor onde o orquestrador está executando.
- **Credenciais**:
  - Use variáveis de ambiente para informações sensíveis.
  - Evite colocar credenciais diretamente no código.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
