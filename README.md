# COMO RODAR O PROJETO

O projeto utiliza o Node.js para rodar em um servidor, sem nenhuma versão específica, mas priorizando mais recentes.

É necessário a criação de um arquivo config.json na raíz do projeto, que não pode ser colocado no GitHub por privacidade de chaves de API.
Dentro do arquivo, existem configurações de servidor (definindo configurações de diretórios e rotas, portas e hosts) e chaves de API para Firebase e Supabase.

É necessário instalar as dependências utilizadas através de `npm install`.
Caso não sejam instaladas corretamente, são:
- @supabase/supabase-js: 2.49.4
- chalk: 4.1.2
- chokidar: 4.0.3
- firebase: 11.7.1
- formidable: 3.5.4

O arquivo de entrada do projeto é index.js do diretório raíz.

Para inicializar, utilize o comando `node .` e abra o URL indicado no terminal, se não alterado do padrão http://localhost:8080.