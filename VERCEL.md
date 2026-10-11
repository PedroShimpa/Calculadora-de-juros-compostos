# Como Publicar a Calculadora de Juros Compostos no Vercel

Este projeto já está **100% configurado** para publicação no [Vercel](https://vercel.com) através do arquivo [`vercel.json`](./vercel.json) e do runtime PHP Serverless (`vercel-php`).

---

## 🚀 Método 1: Publicação Direta pelo GitHub (Recomendado)

Esta é a forma mais simples e profissional:

1. **Crie um repositório no seu GitHub**:
   - Acesse [github.com/new](https://github.com/new) e crie um repositório (ex.: `calculadora-de-juros-compostos`).

2. **Faça o commit e envie seu código**:
   No terminal, dentro da pasta do projeto (`d:\programas\xampp\htdocs\calculadora-juros-compostos`), execute:
   ```bash
   git init
   git add .
   git commit -m "feat: calculadora de juros compostos com brasilapi"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/calculadora-de-juros-compostos.git
   git push -u origin main
   ```

3. **Importe no Vercel**:
   - Acesse [vercel.com](https://vercel.com) e entre na sua conta (pode usar login com GitHub).
   - Clique no botão **"Add New..."** e depois em **"Project"**.
   - Localize o repositório `calculadora-de-juros-compostos` e clique em **"Import"**.
   - O Vercel detectará automaticamente o arquivo `vercel.json`.
   - Clique em **"Deploy"**.

4. **Pronto!** Em menos de 1 minuto seu site estará no ar com HTTPS gratuito e domínio do tipo:
   `https://calculadora-de-juros-compostos.vercel.app`

---

## 💻 Método 2: Publicação pelo Terminal (Vercel CLI)

Se você preferir publicar diretamente pela linha de comando:

1. Abra o terminal na pasta do projeto:
   ```bash
   cd d:\programas\xampp\htdocs\calculadora-juros-compostos
   ```

2. Execute o comando do Vercel via `npx` (não precisa instalar nada globalmente):
   ```bash
   npx vercel
   ```

3. Responda às perguntas simples do assistente:
   - **Set up and deploy?** `Y` (Sim)
   - **Which scope?** Pressione Enter na sua conta
   - **Link to existing project?** `N` (Não)
   - **Project name?** Pressione Enter para manter o nome padrão
   - **In which directory is your code located?** `./` (Pressione Enter)

4. Para publicar na URL final de produção:
   ```bash
   npx vercel --prod
   ```

---

## ⚙️ O Que Foi Configurado para o Vercel

* **[`vercel.json`](./vercel.json):** Define o runtime Serverless `vercel-php@0.7.3` para `index.php` e para os endpoints `api/*.php`.
* **Roteamento:** Mapeia corretamente os arquivos estáticos (`/assets/*`, `/robots.txt`, `/sitemap.xml`) e redireciona rotas para o backend PHP.
* **Cache em Memória/Temp:** O sistema utiliza `sys_get_temp_dir()` para armazenar o cache de taxas da BrasilAPI de forma compatível com a arquitetura serverless somente-leitura do Vercel Lambda.
* **[`.vercelignore`](./.vercelignore):** Evita upload de pastas desnecessárias como `cache/`, temporários e scripts de desenvolvimento local.
