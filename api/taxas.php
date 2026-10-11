<?php
declare(strict_types=1);

/**
 * Endpoint de Taxas Oficiais em Tempo Real via BrasilAPI
 * Retorna SELIC, CDI e IPCA com cache local de 1 hora
 * Desenvolvido por: Pedro Falconi | Projeto Open Source
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$cacheDir = sys_get_temp_dir();
$cacheFile = $cacheDir . '/calc_taxas_cache.json';
$cacheTime = 3600; // 1 hora de cache

$cachedData = null;
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
    $content = @file_get_contents($cacheFile);
    if ($content) {
        $cachedData = json_decode($content, true);
    }
}

if ($cachedData) {
    echo json_encode([
        'status' => 'success',
        'source' => 'cache',
        'data' => $cachedData,
        'updated_at' => date('Y-m-d H:i:s', filemtime($cacheFile))
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Consultar BrasilAPI
$apiUrl = 'https://brasilapi.com.br/api/taxas/v1';

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 4);
curl_setopt($ch, CURLOPT_USERAGENT, 'CalculadoraJurosCompostos-PedroFalconi/1.0');
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode === 200 && $response) {
    $rates = json_decode($response, true);
    if (is_array($rates)) {
        // Formatar e indexar por sigla para fácil acesso
        $formatted = [];
        foreach ($rates as $item) {
            $key = strtoupper(trim($item['nome']));
            $formatted[$key] = [
                'nome' => $item['nome'],
                'valor' => (float)$item['valor']
            ];
        }
        @file_put_contents($cacheFile, json_encode($formatted, JSON_UNESCAPED_UNICODE));

        echo json_encode([
            'status' => 'success',
            'source' => 'brasilapi_live',
            'data' => $formatted,
            'updated_at' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}

// Fallback se a API falhar
$fallback = [
    'SELIC' => ['nome' => 'Selic', 'valor' => 13.75],
    'CDI'   => ['nome' => 'CDI', 'valor' => 13.65],
    'IPCA'  => ['nome' => 'IPCA', 'valor' => 4.58]
];

echo json_encode([
    'status' => 'fallback',
    'source' => 'default',
    'data' => $fallback,
    'message' => 'BrasilAPI indisponível temporariamente, exibindo valores de referência.',
    'updated_at' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
