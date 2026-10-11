<?php
declare(strict_types=1);

/**
 * Endpoint de API REST - Calculadora de Juros Compostos
 * Desenvolvido por: Pedro Falconi
 * Licença: MIT (Open Source)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../includes/Calculator.php';

use App\CompoundInterestCalculator;

try {
    // Obter dados tanto via GET quanto POST (JSON ou form-data)
    $input = $_GET;
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
            $input = array_merge($input, $json);
        } else {
            $input = array_merge($input, $_POST);
        }
    }

    $initialValue = isset($input['initialValue']) ? (float)$input['initialValue'] : 1000.0;
    $monthlyValue = isset($input['monthlyValue']) ? (float)$input['monthlyValue'] : 1000.0;
    $interestRate = isset($input['interestRate']) ? (float)$input['interestRate'] : 8.0;
    $rateType = isset($input['rateType']) ? (string)$input['rateType'] : 'yearly';
    $period = isset($input['period']) ? (int)$input['period'] : 20;
    $periodType = isset($input['periodType']) ? (string)$input['periodType'] : 'years';

    // Validações básicas de segurança
    if ($period <= 0 || $period > 1000) {
        throw new InvalidArgumentException('O período deve ser entre 1 e 1000.');
    }
    if ($interestRate < 0 || $interestRate > 500) {
        throw new InvalidArgumentException('A taxa de juros deve estar entre 0% e 500%.');
    }

    $calculator = new CompoundInterestCalculator(
        $initialValue,
        $monthlyValue,
        $interestRate,
        $rateType,
        $period,
        $periodType
    );

    $result = $calculator->calculate();

    echo json_encode([
        'status' => 'success',
        'data' => $result,
        'meta' => [
            'author' => 'Pedro Falconi',
            'project' => 'Calculadora de Juros Compostos Open Source',
            'license' => 'MIT',
            'inspiredBy' => 'https://investidorsardinha.r7.com/calculadoras/calculadora-de-juros-compostos/'
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
