# Calculadora de Juros Compostos PRO

[![Licença MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4.svg?logo=php&logoColor=white)](https://www.php.net/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3.svg?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384.svg?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Open Source](https://img.shields.io/badge/Open%20Source-Pedro%20Falconi-blue.svg)](https://github.com/pedroShimpa)

> Uma calculadora moderna, intuitiva e de alta precisão para simulação de **juros sobre juros**, aportes recorrentes e planejamento de independência financeira.

Desenvolvido por **Pedro Falconi** como um **projeto Open Source** gratuito sob a **Licença MIT**.  
Inspirado pedagogicamente na ferramenta de referência do **[Investidor Sardinha](https://investidorsardinha.r7.com/calculadoras/calculadora-de-juros-compostos/)**.

---

## 🚀 Funcionalidades Principais

- ⚡ **Cálculos em Tempo Real (0ms de latência)**: Feedback instantâneo conforme você digita os parâmetros ou seleciona presets rápidos.
- 📈 **Aumento Anual dos Aportes**: Simulação de progressão salarial ou correção pela inflação (IPCA), permitindo aumentar automaticamente o valor do aporte mensal a cada 12 meses.
- 🇧🇷 **Indicadores Oficiais em Tempo Real (BrasilAPI)**: Integração com a [BrasilAPI](https://brasilapi.com.br/docs#tag/TAXAS) para exibição e aplicação com 1 clique das taxas **SELIC**, **CDI** e **IPCA** com cache inteligente.
- 🎯 **Equivalência Geométrica Precisa**: Conversão rigorosa de taxas anuais em mensais através da fórmula $(1 + i_{ano})^{1/12} - 1$ (ex.: 12% a.a. = 0,95% a.m., 1% a.m. = 12,68% a.a.).
- 📊 **Gráficos Interativos (Chart.js 4)**: Visualização em barras empilhadas e evolução patrimonial comparando o esforço de aportes próprios versus os rendimentos acumulados gerados pelos juros.
- 📅 **Tabelas de Evolução Completa**: Visualização anual resumida e tabela mês a mês detalhada.
- 🏖️ **Simulador de Retiradas Mensais & Viver de Renda**: Ferramenta integrada para simular renda perpétua (sem descapitalizar) e teste da regra clássica dos 4% anuais (FIRE).
- 🌓 **Modo Escuro / Claro Dinâmico**: Alternância fluida com persistência no navegador (`localStorage`) e detecção de preferência do sistema operacional.
- 📥 **Exportação de Dados**: Baixe a série histórica em planilha **CSV** ou gere relatórios prontos para impressão/PDF.
- 🔗 **Compartilhamento de Simulação**: Copie um link direto contendo todos os parâmetros calculados nos parâmetros de URL.
- 🔍 **SEO & Dados Estruturados de Nível Avançado**:
  - Meta tags completas (`Open Graph`, `Twitter Cards`, `Canonical`).
  - Marcação JSON-LD `WebApplication` e `FAQPage` para Rich Snippets do Google.
  - Arquivos `robots.txt` e `sitemap.xml`.
  - Fallback SSR em PHP para funcionamento perfeito mesmo se o JavaScript estiver desativado no navegador.
- 🌐 **API REST Integrada**: Endpoint `/api/calculate.php` em JSON para integrações externas.

---

## 🛠️ Tecnologias Utilizadas

- **PHP 8.2+**: Lógica matemática no backend, renderização SSR e API REST.
- **Bootstrap 5.3.3**: Grid responsivo moderno e componentes de interface.
- **Vanilla CSS (Design Tokens)**: Paleta de cores moderna (Emerald / Slate / Dark), cards em glassmorphism e efeitos de micro-interação.
- **Vanilla JavaScript**: Reatividade instantânea, manipulação do DOM e formatação de moeda em BRL.
- **Chart.js 4.4**: Renderização interativa de gráficos de barras empilhadas.
- **Bootstrap Icons 1.11**: Ícones vetoriais modernos.

---

## 💻 Como Executar Localmente

### Opção 1: Via XAMPP (Recomendado)
1. Coloque a pasta do projeto no diretório `htdocs` do seu XAMPP:
   ```
   D:\programas\xampp\htdocs\calculadora-juros-compostos
   ```
2. Inicie o módulo **Apache** no painel de controle do XAMPP.
3. Abra no navegador:
   ```
   http://localhost/calculadora-juros-compostos/
   ```

### Opção 2: Via PHP Built-in Server
1. No terminal, navegue até a pasta do projeto:
   ```bash
   cd d:\programas\xampp\htdocs\calculadora-juros-compostos
   ```
2. Inicie o servidor interno do PHP:
   ```bash
   php -S localhost:8000
   ```
3. Acesse `http://localhost:8000` no seu navegador.

### Opção 3: Publicação em Nuvem no Vercel
O projeto já conta com o arquivo `vercel.json` configurado:
- **Pelo GitHub:** Conecte o repositório na plataforma [vercel.com](https://vercel.com) e clique em **Deploy**.
- **Pela linha de comando:** Execute `npx vercel` na raiz do projeto.
- Consulte o guia completo passo a passo em [VERCEL.md](VERCEL.md).

---

## 📐 Fórmulas Financeiras Utilizadas

### Montante com Aporte Único:
$$M = C \times (1 + i)^t$$

### Montante com Aportes Mensais Regulares:
$$M = C \times (1 + i)^t + PMT \times \frac{(1 + i)^t - 1}{i}$$

Onde:
- **M**: Montante final acumulado
- **C**: Capital inicial investido
- **PMT**: Valor do aporte periódico regular
- **i**: Taxa de juros efetiva no período (decimal)
- **t**: Quantidade total de períodos (meses)

---

## 👤 Autor

Desenvolvido por **Pedro Falconi**  
- **GitHub**: [@pedrofalconi](https://github.com/pedroShimpa)
- **Projeto**: Open Source licenciado sob a [Licença MIT](LICENSE)
