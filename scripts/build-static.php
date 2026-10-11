<?php
declare(strict_types=1);

/**
 * Script de Build Estático (Static Site Generator)
 * Gera uma versão 100% estática HTML em dist/ caso deseje publicar no Vercel como site estático
 * Desenvolvido por: Pedro Falconi | Projeto Open Source
 */

$distDir = __DIR__ . '/../dist';
if (!is_dir($distDir)) {
    mkdir($distDir, 0777, true);
}

// 1. Renderizar index.php para dist/index.html
ob_start();
$_GET = [];
require __DIR__ . '/../index.php';
$html = ob_get_clean();

// Salvar dist/index.html
file_put_contents($distDir . '/index.html', $html);
echo "✓ Gerado dist/index.html com sucesso!\n";

// 2. Copiar assets/
function recurseCopy(string $src, string $dst): void {
    $dir = opendir($src);
    @mkdir($dst, 0777, true);
    while (false !== ($file = readdir($dir))) {
        if (($file !== '.') && ($file !== '..')) {
            if (is_dir($src . '/' . $file)) {
                recurseCopy($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

recurseCopy(__DIR__ . '/../assets', $distDir . '/assets');
echo "✓ Copiada pasta dist/assets/\n";

// 3. Copiar robots.txt e sitemap.xml
if (file_exists(__DIR__ . '/../robots.txt')) {
    copy(__DIR__ . '/../robots.txt', $distDir . '/robots.txt');
    echo "✓ Copiado dist/robots.txt\n";
}
if (file_exists(__DIR__ . '/../sitemap.xml')) {
    copy(__DIR__ . '/../sitemap.xml', $distDir . '/sitemap.xml');
    echo "✓ Copiado dist/sitemap.xml\n";
}

echo "\n🎉 Build estático concluído em " . realpath($distDir) . "!\n";
