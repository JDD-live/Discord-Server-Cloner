# The Gods - Discord Server Migration Tool

Uma ferramenta de linha de comando (CLI) desenvolvida em Node.js para clonar e migrar a infraestrutura completa de servidores Discord, incluindo cargos, canais e permissões.

---

## Aviso Legal

A automação de contas de usuário (self-bots) viola os Termos de Serviço do Discord. O uso desta ferramenta é de inteira responsabilidade do usuário.

Recomenda-se a utilização apenas em ambientes de teste ou com contas secundárias. O token de acesso é processado apenas em memória durante a execução e não é armazenado.

---

## Funcionalidades Técnicas

- **Replicação de Estrutura:** Clona categorias, canais de texto e voz mantendo a ordem e organização original.
- **Mapeamento de Cargos:** Recria os cargos mantendo nomes, cores, propriedades (hoist/mentionable) e permissões globais.
- **Tradução de Permissões (ACLs):** Algoritmo que mapeia as permissões específicas de cada canal (Overwrites), convertendo os IDs dos cargos antigos para os novos cargos criados.
- **Gerenciamento de Rate Limits:** Execução assíncrona controlada para evitar bloqueios da API durante a criação em massa de recursos.

## Tecnologias

- Node.js
- JavaScript (ES6+)
- Discord.js Selfbot v13

## Instalação e Uso

### Pré-requisitos
Certifique-se de ter o Node.js instalado em sua máquina.

### Execução Automática (Windows)
1. Baixe o repositório.
2. Execute o arquivo `start.bat`.
3. O script instalará as dependências e iniciará a aplicação.

### Execução Manual
Caso prefira rodar via terminal:

```bash
npm install
node index.js
