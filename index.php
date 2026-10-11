<?php
declare(strict_types=1);

/**
 * Calculadora de Juros Compostos
 * Desenvolvido por: Pedro Falconi
 * Projeto Open Source (Licença MIT)
 * Inspirado em: Investidor Sardinha (https://investidorsardinha.r7.com/calculadoras/calculadora-de-juros-compostos/)
 */

require_once __DIR__ . '/includes/Calculator.php';

use App\CompoundInterestCalculator;

// Obter taxas em tempo real (cache ou padrão inicial)
$cacheFile = sys_get_temp_dir() . '/calc_taxas_cache.json';
$taxasData = [
    'SELIC' => ['nome' => 'Selic', 'valor' => 13.75],
    'CDI'   => ['nome' => 'CDI', 'valor' => 13.65],
    'IPCA'  => ['nome' => 'IPCA', 'valor' => 4.58]
];
if (file_exists($cacheFile)) {
    $c = @file_get_contents($cacheFile);
    if ($c) {
        $decoded = json_decode($c, true);
        if (is_array($decoded)) {
            $taxasData = array_merge($taxasData, $decoded);
        }
    }
}
$selicRate = $taxasData['SELIC']['valor'] ?? 13.75;
$cdiRate = $taxasData['CDI']['valor'] ?? 13.65;
$ipcaRate = $taxasData['IPCA']['valor'] ?? 4.58;

function parseBRL_PHP($val, float $default = 0.0): float {
    if ($val === null || $val === '') return $default;
    if (is_numeric($val)) return (float)$val;
    $str = trim((string)$val);
    if (strpos($str, ',') !== false) {
        $str = str_replace('.', '', $str);
        $str = str_replace(',', '.', $str);
    } else {
        $dotCount = substr_count($str, '.');
        if ($dotCount > 1 || ($dotCount === 1 && strlen(substr($str, strrpos($str, '.') + 1)) === 3)) {
            $str = str_replace('.', '', $str);
        }
    }
    $str = preg_replace('/[^\d.-]/', '', $str);
    return is_numeric($str) ? (float)$str : $default;
}

// Valores iniciais padrão ou vindos da URL (SSR fallback para SEO e navegação sem JS)
$initialVal = isset($_GET['inicial']) ? parseBRL_PHP($_GET['inicial'], 1000.0) : 1000.0;
$monthlyVal = isset($_GET['mensal']) ? parseBRL_PHP($_GET['mensal'], 1000.0) : 1000.0;
$rawTaxa    = isset($_GET['taxa']) ? parseBRL_PHP($_GET['taxa'], 8.0) : 8.0;
$rateVal    = $rawTaxa > 200.0 ? round($rawTaxa / 100.0, 2) : $rawTaxa;
$rateType   = isset($_GET['tipoTaxa']) ? (string)$_GET['tipoTaxa'] : 'yearly';
$periodVal  = isset($_GET['periodo']) ? (int)preg_replace('/\D/', '', (string)$_GET['periodo']) : 20;
$periodType = isset($_GET['tipoPeriodo']) ? (string)$_GET['tipoPeriodo'] : 'years';
$onlyNet    = isset($_GET['liquido']) ? filter_var($_GET['liquido'], FILTER_VALIDATE_BOOLEAN) : false;

$calculator = new CompoundInterestCalculator(
    $initialVal,
    $monthlyVal,
    $rateVal,
    $rateType,
    $periodVal,
    $periodType,
    $onlyNet,
    15.0,
    $ipcaRate
);

$serverSimulation = $calculator->calculate();
$summary = $serverSimulation['summary'];

require_once __DIR__ . '/includes/header.php';
?>

<main class="container py-4 flex-grow-1">

    <!-- Hero Header -->
    <header class="text-center mb-4 pt-2">
        <div class="mb-3">
            <span class="hero-badge">
                <i class="bi bi-code-slash text-success"></i>
                Projeto Open Source desenvolvido por <strong>Pedro Falconi</strong>
            </span>
        </div>
        <h1 class="display-5 fw-bold text-gradient mb-2">Calculadora de Juros Compostos</h1>
        <p class="lead text-muted mx-auto" style="max-width: 780px;">
            Calcule quanto seu dinheiro rende com juros sobre juros e aportes mensais. Veja a evolução ano a ano e descubra o quanto o tempo pesa no resultado.
        </p>
    </header>

    <!-- Barra de Indicadores Oficiais em Tempo Real (BrasilAPI) -->
    <div class="rates-bar calc-card p-3 mb-4 shadow-sm" id="liveRatesContainer">
        <div class="row g-3 align-items-center">
            <div class="col-lg-3 col-md-12 d-flex align-items-center gap-2">
                <span class="live-dot" title="Dados atualizados em tempo real via BrasilAPI"></span>
                <div>
                    <strong class="d-block small text-uppercase text-muted" style="letter-spacing: 0.05em;">Taxas em Tempo Real</strong>
                    <span class="badge bg-success-subtle text-success border border-success-subtle small">
                        <i class="bi bi-broadcast me-1"></i>Fonte: BrasilAPI
                    </span>
                </div>
            </div>
            <div class="col-lg-3 col-sm-4">
                <div class="rate-badge-card d-flex align-items-center justify-content-between p-2 px-3 rounded-3" data-apply-rate="<?php echo htmlspecialchars((string)$selicRate); ?>" data-apply-name="SELIC" title="Clique para simular com a Taxa Selic">
                    <div>
                        <span class="text-muted small fw-semibold">SELIC (Meta)</span>
                        <strong class="d-block fs-5 text-success" id="rateSelicVal"><?php echo number_format($selicRate, 2, ',', '.'); ?>% <small class="fw-normal text-muted" style="font-size:0.75rem;">a.a.</small></strong>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-success rounded-pill px-2 py-0 small" style="font-size: 0.72rem;">Usar</button>
                </div>
            </div>
            <div class="col-lg-3 col-sm-4">
                <div class="rate-badge-card d-flex align-items-center justify-content-between p-2 px-3 rounded-3" data-apply-rate="<?php echo htmlspecialchars((string)$cdiRate); ?>" data-apply-name="CDI" title="Clique para simular com a Taxa CDI">
                    <div>
                        <span class="text-muted small fw-semibold">CDI (Interbancário)</span>
                        <strong class="d-block fs-5 text-primary" id="rateCdiVal"><?php echo number_format($cdiRate, 2, ',', '.'); ?>% <small class="fw-normal text-muted" style="font-size:0.75rem;">a.a.</small></strong>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 small" style="font-size: 0.72rem;">Usar</button>
                </div>
            </div>
            <div class="col-lg-3 col-sm-4">
                <div class="rate-badge-card d-flex align-items-center justify-content-between p-2 px-3 rounded-3" title="IPCA - Inflação Oficial acumulada (IBGE)">
                    <div>
                        <span class="text-muted small fw-semibold">IPCA (Inflação 12m)</span>
                        <strong class="d-block fs-5 text-warning" id="rateIpcaVal"><?php echo number_format($ipcaRate, 2, ',', '.'); ?>% <small class="fw-normal text-muted" style="font-size:0.75rem;">a.a.</small></strong>
                    </div>
                    <span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill small" style="font-size: 0.7rem;">IBGE</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Grid Principal da Ferramenta -->
    <div class="row g-4 mb-5">
        
        <!-- Coluna da Esquerda: Formulário de Simulação -->
        <div class="col-lg-5">
            <div class="calc-card p-4 h-100 shadow-sm">
                <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <h2 class="h5 fw-bold mb-0 d-flex align-items-center gap-2">
                        <i class="bi bi-sliders text-success"></i>
                        <span>Parâmetros do Cálculo</span>
                    </h2>
                    <button type="button" class="btn btn-sm btn-link text-muted text-decoration-none p-0" id="btnReset" title="Restaurar valores padrão">
                        <i class="bi bi-arrow-counterclockwise"></i> Redefinir
                    </button>
                </div>

                <form id="calcForm" novalidate>
                    
                    <!-- Valor Inicial -->
                    <div class="mb-3">
                        <label for="initialValue" class="form-label d-flex justify-content-between align-items-center">
                            <span>Valor inicial</span>
                            <small class="text-muted fw-normal">quanto você já tem hoje</small>
                        </label>
                        <div class="input-group">
                            <span class="input-group-text">R$</span>
                            <input type="number" step="any" min="0" class="form-control form-control-lg fw-semibold" id="initialValue" name="initialValue" value="<?php echo htmlspecialchars((string)$initialVal); ?>" placeholder="0,00">
                        </div>
                    </div>

                    <!-- Valor Mensal -->
                    <div class="mb-3">
                        <label for="monthlyValue" class="form-label d-flex justify-content-between align-items-center">
                            <span>Valor mensal (Aporte)</span>
                            <small class="text-muted fw-normal">quanto pretende aplicar por mês</small>
                        </label>
                        <div class="input-group">
                            <span class="input-group-text">R$</span>
                            <input type="number" step="any" min="0" class="form-control form-control-lg fw-semibold" id="monthlyValue" name="monthlyValue" value="<?php echo htmlspecialchars((string)$monthlyVal); ?>" placeholder="0,00">
                        </div>
                    </div>

                    <!-- Taxa de Juros -->
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <label for="interestRate" class="form-label mb-0">Taxa de juros</label>
                            <div class="btn-group btn-group-sm" role="group">
                                <input type="radio" class="btn-check" name="rateType" id="rateYearly" value="yearly" <?php echo $rateType === 'yearly' ? 'checked' : ''; ?>>
                                <label class="btn btn-toggle-unit" for="rateYearly">Anual</label>

                                <input type="radio" class="btn-check" name="rateType" id="rateMonthly" value="monthly" <?php echo $rateType === 'monthly' ? 'checked' : ''; ?>>
                                <label class="btn btn-toggle-unit" for="rateMonthly">Mensal</label>
                            </div>
                        </div>
                        <div class="input-group">
                            <input type="number" step="any" min="0" class="form-control form-control-lg fw-semibold" id="interestRate" name="interestRate" value="<?php echo htmlspecialchars((string)$rateVal); ?>" placeholder="0,00">
                            <span class="input-group-text">%</span>
                        </div>
                        <div class="d-flex flex-wrap gap-1 mt-2">
                            <span class="preset-badge" data-preset-rate="<?php echo htmlspecialchars((string)$selicRate); ?>" data-preset-type="yearly" id="presetSelicBadge"><i class="bi bi-broadcast text-success me-1"></i>Selic Atual (<?php echo number_format($selicRate, 2, ',', '.'); ?>%)</span>
                            <span class="preset-badge" data-preset-rate="<?php echo htmlspecialchars((string)$cdiRate); ?>" data-preset-type="yearly" id="presetCdiBadge"><i class="bi bi-broadcast text-primary me-1"></i>CDI Atual (<?php echo number_format($cdiRate, 2, ',', '.'); ?>%)</span>
                            <span class="preset-badge" data-preset-rate="6.0" data-preset-type="yearly">Poupança (6% a.a.)</span>
                            <span class="preset-badge" data-preset-rate="12.0" data-preset-type="yearly">Ações/FIIs (12% a.a.)</span>
                            <span class="preset-badge" data-preset-rate="1.0" data-preset-type="monthly">1% ao mês</span>
                        </div>
                    </div>

                    <!-- Período de Tempo -->
                    <div class="mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <label for="period" class="form-label mb-0">Período de aplicação</label>
                            <div class="btn-group btn-group-sm" role="group">
                                <input type="radio" class="btn-check" name="periodType" id="periodYears" value="years" <?php echo $periodType === 'years' ? 'checked' : ''; ?>>
                                <label class="btn btn-toggle-unit" for="periodYears">Ano(s)</label>

                                <input type="radio" class="btn-check" name="periodType" id="periodMonths" value="months" <?php echo $periodType === 'months' ? 'checked' : ''; ?>>
                                <label class="btn btn-toggle-unit" for="periodMonths">Mês(es)</label>
                            </div>
                        </div>
                        <div class="input-group">
                            <input type="number" min="1" max="1000" class="form-control form-control-lg fw-semibold" id="period" name="period" value="<?php echo htmlspecialchars((string)$periodVal); ?>" placeholder="1">
                            <span class="input-group-text"><i class="bi bi-clock-history"></i></span>
                        </div>
                        <div class="d-flex flex-wrap gap-1 mt-2">
                            <span class="preset-badge" data-preset-period="5" data-preset-type="years">5 anos</span>
                            <span class="preset-badge" data-preset-period="10" data-preset-type="years">10 anos</span>
                            <span class="preset-badge" data-preset-period="20" data-preset-type="years">20 anos</span>
                            <span class="preset-badge" data-preset-period="30" data-preset-type="years">30 anos</span>
                        </div>
                    </div>

                    <!-- Toggle: Considerar somente valor líquido -->
                    <div class="p-3 mb-4 rounded-3 border bg-body-tertiary">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="form-check form-switch mb-0">
                                <input class="form-check-input" type="checkbox" role="switch" id="onlyNetSwitch" name="onlyNet" <?php echo $onlyNet ? 'checked' : ''; ?>>
                                <label class="form-check-label fw-bold d-inline-flex align-items-center gap-1" for="onlyNetSwitch" style="cursor: pointer;">
                                    <span>Considerar somente valor líquido</span>
                                    <span class="badge rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center" 
                                          style="width: 20px; height: 20px; font-size: 0.78rem; cursor: help;" 
                                          data-bs-toggle="tooltip" 
                                          data-bs-placement="top" 
                                          title="Ao ativar, a calculadora desconta a inflação oficial (IPCA de <?php echo number_format($ipcaRate, 2, ',', '.'); ?>% a.a.) e o Imposto de Renda médio de 15% sobre os rendimentos, revelando o poder de compra real e líquido no futuro.">
                                        ?
                                    </span>
                                </label>
                            </div>
                            <span class="badge bg-info-subtle text-info border border-info-subtle small <?php echo $onlyNet ? '' : 'd-none'; ?>" id="netActiveBadge">
                                IR 15% + IPCA
                            </span>
                        </div>
                        <div class="small text-muted mt-2 <?php echo $onlyNet ? '' : 'd-none'; ?>" id="netExplanationAlert">
                            <i class="bi bi-shield-check text-info me-1"></i>
                            Descontando <strong>15% de IR</strong> sobre os lucros e <strong><?php echo number_format($ipcaRate, 2, ',', '.'); ?>% de inflação (IPCA)</strong> para projetar o patrimônio real em poder de compra de hoje.
                        </div>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary-gradient btn-lg d-flex align-items-center justify-content-center gap-2">
                            <i class="bi bi-calculator-fill"></i>
                            <span>Calcular Rendimento</span>
                        </button>
                        
                        <button type="button" class="btn btn-secondary-custom d-flex align-items-center justify-content-center gap-2" id="btnOpenWithdrawal">
                            <i class="bi bi-cash-stack text-warning"></i>
                            <span>Simular Retiradas Mensais</span>
                        </button>
                    </div>

                    <!-- Ações Secundárias -->
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top small">
                        <button type="button" class="btn btn-sm btn-link text-muted text-decoration-none p-0" id="btnShare">
                            <i class="bi bi-share"></i> Compartilhar link
                        </button>
                        <button type="button" class="btn btn-sm btn-link text-muted text-decoration-none p-0" id="btnExportCSV">
                            <i class="bi bi-download"></i> Baixar CSV
                        </button>
                        <button type="button" class="btn btn-sm btn-link text-muted text-decoration-none p-0" id="btnPrint">
                            <i class="bi bi-printer"></i> Imprimir
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Coluna da Direita: Resultados e KPIs -->
        <div class="col-lg-7">
            
            <!-- Cards de Métricas Principais -->
            <div class="row g-3 mb-4">
                
                <!-- Montante Total -->
                <div class="col-sm-6">
                    <div class="kpi-card kpi-total">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="kpi-label d-flex align-items-center gap-1">
                                <span>Valor Total Final</span>
                                <span class="badge bg-info-subtle text-info border border-info-subtle <?php echo $onlyNet ? '' : 'd-none'; ?>" id="kpiNetBadge" style="font-size: 0.68rem;">Líquido Real</span>
                            </span>
                            <i class="bi bi-wallet2 text-success fs-5"></i>
                        </div>
                        <div class="kpi-value text-success" id="kpiFinalBalance">
                            R$ <?php echo number_format($summary['finalBalance'], 2, ',', '.'); ?>
                        </div>
                        <small class="text-muted" id="kpiFinalBalanceSubtitle">
                            <?php echo $onlyNet ? 'Poder de compra real descontando IR e IPCA' : 'Montante acumulado ao fim do período'; ?>
                        </small>
                    </div>
                </div>

                <!-- Total em Juros -->
                <div class="col-sm-6">
                    <div class="kpi-card kpi-interest">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="kpi-label">Total em Juros</span>
                            <i class="bi bi-stars text-primary fs-5"></i>
                        </div>
                        <div class="kpi-value text-primary" id="kpiTotalInterest">
                            R$ <?php echo number_format($summary['totalInterest'], 2, ',', '.'); ?>
                        </div>
                        <small class="text-muted" id="interestPercentageBadge"><?php echo $summary['interestPercentage']; ?>% fruto dos juros sobre juros</small>
                    </div>
                </div>

                <!-- Total Investido -->
                <div class="col-sm-6">
                    <div class="kpi-card kpi-invested">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="kpi-label">Total Investido</span>
                            <i class="bi bi-piggy-bank text-info fs-5"></i>
                        </div>
                        <div class="kpi-value text-info" id="kpiTotalInvested">
                            R$ <?php echo number_format($summary['totalInvested'], 2, ',', '.'); ?>
                        </div>
                        <small class="text-muted" id="investedPercentageBadge"><?php echo $summary['investedPercentage']; ?>% do seu próprio bolso</small>
                    </div>
                </div>

                <!-- Renda Passiva Estimada -->
                <div class="col-sm-6">
                    <div class="kpi-card kpi-income">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="kpi-label">Renda Mensal Estimada</span>
                            <i class="bi bi-arrow-repeat text-warning fs-5"></i>
                        </div>
                        <div class="kpi-value text-warning" id="kpiPassiveIncome">
                            R$ <?php echo number_format($summary['monthlyPassiveIncome'], 2, ',', '.'); ?>
                        </div>
                        <small class="text-muted">Viver de renda sem tocar no patrimônio</small>
                    </div>
                </div>

            </div>

            <!-- Barra de Distribuição Patrimonial -->
            <div class="calc-card p-3 mb-4 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-2 small fw-semibold">
                    <span>Composição do Patrimônio</span>
                    <span class="text-muted">Aportes vs Rendimento</span>
                </div>
                <div class="patrimony-bar mb-2">
                    <div class="patrimony-invested-bar" id="barInvested" style="width: <?php echo $summary['investedPercentage']; ?>%;" title="Total Investido"></div>
                    <div class="patrimony-interest-bar" id="barInterest" style="width: <?php echo $summary['interestPercentage']; ?>%;" title="Juros Compostos"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span class="d-flex align-items-center gap-1">
                        <span class="d-inline-block rounded-circle" style="width: 10px; height: 10px; background: #3b82f6;"></span>
                        Aportes Próprios
                    </span>
                    <span class="d-flex align-items-center gap-1">
                        <span class="d-inline-block rounded-circle" style="width: 10px; height: 10px; background: #10b981;"></span>
                        Juros Compostos
                    </span>
                </div>
            </div>

            <!-- Abas de Visualização (Gráfico & Tabelas) -->
            <div class="calc-card p-4 shadow-sm">
                
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 border-bottom pb-2">
                    <ul class="nav nav-pills gap-1" id="resultTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active py-1 px-3 fw-semibold small" id="tab-chart" data-bs-toggle="tab" data-bs-target="#content-chart" type="button" role="tab">
                                <i class="bi bi-bar-chart-fill me-1"></i> Gráfico
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link py-1 px-3 fw-semibold small" id="tab-yearly" data-bs-toggle="tab" data-bs-target="#content-yearly" type="button" role="tab">
                                <i class="bi bi-calendar-check me-1"></i> Tabela Ano a Ano
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link py-1 px-3 fw-semibold small" id="tab-monthly" data-bs-toggle="tab" data-bs-target="#content-monthly" type="button" role="tab">
                                <i class="bi bi-calendar3 me-1"></i> Detalhado Mês a Mês
                            </button>
                        </li>
                    </ul>

                    <!-- Alternador de Visão do Gráfico -->
                    <div class="form-check form-switch small mb-0">
                        <input class="form-check-input" type="checkbox" id="chartViewToggle" checked>
                        <label class="form-check-label text-muted" for="chartViewToggle">Visão Anual no Gráfico</label>
                    </div>
                </div>

                <div class="tab-content" id="resultTabsContent">
                    
                    <!-- Aba 1: Gráfico -->
                    <div class="tab-pane fade show active" id="content-chart" role="tabpanel">
                        <div class="chart-container-box">
                            <canvas id="evolutionChart"></canvas>
                        </div>
                    </div>

                    <!-- Aba 2: Tabela Anual -->
                    <div class="tab-pane fade" id="content-yearly" role="tabpanel">
                        <div class="table-responsive" style="max-height: 420px; overflow-y: auto;">
                            <table class="table custom-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Período</th>
                                        <th>Aportes no Ano</th>
                                        <th>Total Aportado</th>
                                        <th>Juros no Ano</th>
                                        <th>Total em Juros</th>
                                        <th>Total Acumulado</th>
                                    </tr>
                                </thead>
                                <tbody id="tableBodyYearly">
                                    <?php foreach ($serverSimulation['yearlyTimeline'] as $row): ?>
                                    <tr>
                                        <td class="fw-bold"><?php echo $row['year']; ?>º Ano <span class="text-muted small">(<?php echo $row['monthsCompleted']; ?> m)</span></td>
                                        <td>R$ <?php echo number_format($row['investedInYear'], 2, ',', '.'); ?></td>
                                        <td>R$ <?php echo number_format($row['totalInvested'], 2, ',', '.'); ?></td>
                                        <td class="text-success fw-semibold">+ R$ <?php echo number_format($row['interestInYear'], 2, ',', '.'); ?></td>
                                        <td class="text-success">R$ <?php echo number_format($row['totalInterest'], 2, ',', '.'); ?></td>
                                        <td class="fw-bold text-primary">R$ <?php echo number_format($row['balance'], 2, ',', '.'); ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Aba 3: Tabela Mensal -->
                    <div class="tab-pane fade" id="content-monthly" role="tabpanel">
                        <div class="table-responsive" style="max-height: 420px; overflow-y: auto;">
                            <table class="table custom-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Mês</th>
                                        <th>Aporte Mensal</th>
                                        <th>Total Aportado</th>
                                        <th>Juros no Mês</th>
                                        <th>Total em Juros</th>
                                        <th>Total Acumulado</th>
                                    </tr>
                                </thead>
                                <tbody id="tableBodyMonthly">
                                    <?php 
                                    $displayCount = min(count($serverSimulation['monthlyTimeline']), 120);
                                    for ($i = 0; $i < $displayCount; $i++): 
                                        $row = $serverSimulation['monthlyTimeline'][$i];
                                    ?>
                                    <tr>
                                        <td class="fw-bold">Mês <?php echo $row['month']; ?></td>
                                        <td>R$ <?php echo number_format($row['deposit'], 2, ',', '.'); ?></td>
                                        <td>R$ <?php echo number_format($row['totalInvested'], 2, ',', '.'); ?></td>
                                        <td class="text-success fw-semibold">+ R$ <?php echo number_format($row['interestThisMonth'], 2, ',', '.'); ?></td>
                                        <td class="text-success">R$ <?php echo number_format($row['totalInterest'], 2, ',', '.'); ?></td>
                                        <td class="fw-bold text-primary">R$ <?php echo number_format($row['balance'], 2, ',', '.'); ?></td>
                                    </tr>
                                    <?php endfor; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>

        </div>

    </div>

    <!-- Modal: Simular Retiradas Mensais (Renda Passiva) -->
    <div class="modal fade" id="withdrawalModal" tabindex="-1" aria-labelledby="withdrawalModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content calc-card border-0">
                <div class="modal-header border-bottom">
                    <h5 class="modal-title fw-bold d-flex align-items-center gap-2" id="withdrawalModalLabel">
                        <i class="bi bi-cash-coin text-warning"></i>
                        <span>Simulador de Retiradas Mensais & Viver de Renda</span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body p-4">
                    <p class="text-muted mb-4">
                        Com base no patrimônio acumulado calculado pela simulação, descubra quanto você pode resgatar mensalmente para viver de renda de acordo com estratégias consagradas de planejamento financeiro.
                    </p>

                    <div class="row g-3 mb-4">
                        <div class="col-md-4">
                            <div class="p-3 rounded-3 bg-body-tertiary border text-center">
                                <span class="d-block text-muted small fw-semibold text-uppercase">Patrimônio Base</span>
                                <strong class="fs-5 text-primary" id="modalPatrimony">R$ <?php echo number_format($summary['finalBalance'], 2, ',', '.'); ?></strong>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 rounded-3 bg-body-tertiary border text-center">
                                <span class="d-block text-muted small fw-semibold text-uppercase">Renda Perpétua</span>
                                <strong class="fs-5 text-success" id="modalPerpetualIncome">R$ <?php echo number_format($summary['monthlyPassiveIncome'], 2, ',', '.'); ?>/mês</strong>
                                <small class="d-block text-muted" style="font-size: 0.75rem;">Sem consumir o principal</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 rounded-3 bg-body-tertiary border text-center">
                                <span class="d-block text-muted small fw-semibold text-uppercase">Regra dos 4% (FIRE)</span>
                                <strong class="fs-5 text-warning" id="modalRule4Income">R$ <?php echo number_format($summary['rule4PercentMonthly'], 2, ',', '.'); ?>/mês</strong>
                                <small class="d-block text-muted" style="font-size: 0.75rem;">Retirada segura anual</small>
                            </div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="customWithdrawalInput" class="form-label fw-bold">Testar Retirada Personalizada por Mês (R$)</label>
                        <div class="input-group">
                            <span class="input-group-text">R$</span>
                            <input type="number" class="form-control form-control-lg fw-semibold" id="customWithdrawalInput" placeholder="Valor desejado por mês">
                        </div>
                    </div>

                    <div id="modalDepletionText" class="mt-3">
                        <!-- Preenchido dinamicamente pelo JS -->
                    </div>
                </div>
                <div class="modal-footer border-top">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- ====================================================================
         CONTEÚDO EDITORIAL COMPLETO, EDUCATIVO E OTIMIZADO PARA SEO
         (Inspirado no conteúdo do Investidor Sardinha)
         ==================================================================== -->
    <article class="calc-card p-4 p-md-5 mt-5 shadow-sm">
        
        <!-- Seção 1: Como Usar -->
        <section id="como-usar" class="mb-5">
            <h2 class="h3 fw-bold mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-question-circle text-success"></i>
                Como usar a calculadora de juros compostos
            </h2>
            <p>
                Os juros compostos só trabalham para quem sabe onde colocar o dinheiro e compreende a dinâmica do tempo. Nossa calculadora foi desenvolvida de forma interativa e precisa para você planejar a sua independência financeira.
            </p>

            <h3 class="h5 fw-bold text-primary mt-4 mb-3">O que colocar em cada campo:</h3>
            <ul class="list-group list-group-flush mb-4">
                <li class="list-group-item bg-transparent px-0 py-2">
                    <strong>Valor inicial:</strong> quanto você já possui guardado hoje para começar o investimento. Pode ficar vazio ou ser R$ 0,00 caso esteja iniciando do zero.
                </li>
                <li class="list-group-item bg-transparent px-0 py-2">
                    <strong>Valor mensal:</strong> a quantia recorrente (aporte mensal) que você pretende investir fielmente todos os meses.
                </li>
                <li class="list-group-item bg-transparent px-0 py-2">
                    <strong>Taxa de juros:</strong> informe a rentabilidade esperada e selecione se a taxa é <strong>anual</strong> ou <strong>mensal</strong>. Lembre-se: investimentos como taxa Selic, CDBs, LCIs e Poupança são cotados e divulgados tradicionalmente ao ano.
                </li>
                <li class="list-group-item bg-transparent px-0 py-2">
                    <strong>Período:</strong> o horizonte de tempo em que a aplicação permanecerá rendendo. Marque ano(s) ou mês(es).
                </li>
            </ul>

            <div class="alert alert-info border-info-subtle d-flex align-items-center gap-3">
                <i class="bi bi-info-circle-fill fs-3 text-info"></i>
                <div>
                    <strong>Erro mais comum ao simular:</strong> digitar uma taxa anual tendo a opção "mensal" selecionada. Confira sempre a equivalência matemática: <strong>12% ao ano equivale a 0,95% ao mês</strong>, e <strong>1% ao mês equivale a 12,68% ao ano</strong>.
                </div>
            </div>

            <p class="mt-3">
                <strong>Quanto dá para retirar por mês?</strong> Depois de calcular seu patrimônio futuro, utilize o botão <em>"Simular retiradas mensais"</em> logo ao lado de calcular para projetar quanto o montante acumulado gerará de salário perpétuo na aposentadoria.
            </p>
        </section>

        <!-- Seção 2: Exemplo Ilustrado da Força dos Juros Compostos -->
        <section class="mb-5">
            <h2 class="h3 fw-bold mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-lightning-charge text-warning"></i>
                Exemplo prático: O poder dos juros compostos em 20 anos
            </h2>
            <p>
                Para exemplificar o impacto exponencial do tempo, imagine uma simulação com os seguintes parâmetros reais: <strong>R$ 1.000,00 de valor inicial</strong>, <strong>R$ 1.000,00 investidos todos os meses</strong> durante um período de <strong>20 anos</strong>, rendendo uma taxa conservadora de <strong>8% ao ano</strong>.
            </p>

            <div class="row g-3 my-3">
                <div class="col-md-4">
                    <div class="p-3 rounded-3 bg-body-tertiary border text-center">
                        <span class="d-block text-muted small">Total Aportado em 20 Anos</span>
                        <strong class="fs-4 text-primary">R$ 241.000,00</strong>
                        <div class="small text-muted mt-1">Seu esforço pessoal</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 rounded-3 bg-body-tertiary border text-center">
                        <span class="d-block text-muted small">Juros sobre Juros Gerados</span>
                        <strong class="fs-4 text-success">R$ 332.660,03</strong>
                        <div class="small text-muted mt-1">58% do patrimônio veio do tempo</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 rounded-3 bg-body-tertiary border text-center">
                        <span class="d-block text-muted small">Montante Total Acumulado</span>
                        <strong class="fs-4 text-success fw-bold">R$ 573.660,03</strong>
                        <div class="small text-muted mt-1">Mais de meio milhão de reais</div>
                    </div>
                </div>
            </div>

            <p>
                O valor total que saiu do seu bolso durante essas duas décadas foi de R$ 241 mil. No entanto, uma transformação fantástica aconteceu: o valor final ultrapassou <strong>R$ 573 mil</strong>! O valor gerado apenas pelos juros sobre juros (mais de R$ 332 mil) foi consideravelmente superior ao total do próprio dinheiro que você economizou. Essa é a mágica comprovada dos juros compostos.
            </p>
        </section>

        <!-- Seção 3: Fórmula Matemática dos Juros Compostos -->
        <section id="formula" class="mb-5">
            <h2 class="h3 fw-bold mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-calculator text-primary"></i>
                Qual é a fórmula e como se calculam os juros compostos?
            </h2>
            <p>
                A fórmula clássica dos juros compostos para um aporte único é expressa da seguinte forma:
            </p>

            <div class="formula-box text-center py-3">
                M = C &times; (1 + i)<sup>t</sup>
            </div>

            <p>Na equação matemática, cada letra representa uma grandeza financeira fundamental:</p>
            <ul class="list-unstyled ps-3">
                <li class="mb-2"><strong class="text-primary">M:</strong> é o montante final acumulado da aplicação.</li>
                <li class="mb-2"><strong class="text-primary">C:</strong> é o capital investido inicialmente.</li>
                <li class="mb-2"><strong class="text-primary">i:</strong> é a taxa de juros expressa em formato decimal (por exemplo, 8% = 0,08).</li>
                <li class="mb-2"><strong class="text-primary">t:</strong> é o tempo ou número de períodos em que o capital permanecerá aplicado.</li>
            </ul>

            <p>
                Quando realizamos <strong>aportes mensais periódicos</strong> (valor mensal regular recorrente), o cálculo combina a rentabilidade do montante acumulado anterior somada à série de pagamentos uniformes futuros:
            </p>

            <div class="formula-box text-center py-3">
                M = C &times; (1 + i)<sup>t</sup> + PMT &times; [((1 + i)<sup>t</sup> - 1) / i]
            </div>

            <p>
                Fazer essas contas à mão mês a mês seria uma tarefa árdua e propensa a erros. É por isso que nossa calculadora automatiza todas as equivalências e projeções instantaneamente.
            </p>
        </section>

        <!-- Seção 4: Onde os Juros Compostos são Aplicados -->
        <section class="mb-5">
            <h2 class="h3 fw-bold mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-briefcase text-info"></i>
                Onde os juros compostos são aplicados?
            </h2>
            <p>
                Os juros compostos são conhecidos popularmente como "juros sobre juros". Eles estão presentes em diversas operações do mercado financeiro e no cotidiano. Os juros em si não são vilões nem mocinhos: o resultado depende inteiramente de que lado da mesa você está posicionado:
            </p>

            <div class="row g-4 mt-1">
                
                <div class="col-md-4">
                    <div class="p-4 rounded-4 bg-body-tertiary border h-100">
                        <div class="d-flex align-items-center gap-2 mb-2 text-danger fw-bold">
                            <i class="bi bi-receipt-cutoff fs-4"></i>
                            <span>1. Contas em Atraso</span>
                        </div>
                        <p class="text-muted small mb-0">
                            Instituições de crédito e empresas utilizam juros compostos para desencorajar o atraso de faturas de cartão de crédito e contas. Se você atrasar, a dívida acumula encargos sobre encargos e pode se transformar em uma bola de neve perigosa.
                        </p>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="p-4 rounded-4 bg-body-tertiary border h-100">
                        <div class="d-flex align-items-center gap-2 mb-2 text-warning fw-bold">
                            <i class="bi bi-house-door fs-4"></i>
                            <span>2. Financiamentos</span>
                        </div>
                        <p class="text-muted small mb-0">
                            Empréstimos imobiliários, crédito consignado e financiamentos de automóveis também utilizam taxas compostas. Ao longo de 20 ou 30 anos, o cliente acaba pagando muitas vezes o dobro ou triplo do valor do bem emprestado.
                        </p>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="p-4 rounded-4 bg-body-tertiary border h-100">
                        <div class="d-flex align-items-center gap-2 mb-2 text-success fw-bold">
                            <i class="bi bi-graph-up-arrow fs-4"></i>
                            <span>3. Investimentos</span>
                        </div>
                        <p class="text-muted small mb-0">
                            Aqui é onde a mágica trabalha <strong>a seu favor</strong>! Em investimentos de renda fixa (CDBs, Tesouro Direto, LCIs) e na bolsa de valores (reinvestindo proventos e dividendos de ações e fundos imobiliários), o efeito composto multiplica seu patrimônio aceleradamente.
                        </p>
                    </div>
                </div>

            </div>
        </section>

        <!-- Seção 5: Diferença entre Juros Simples e Compostos -->
        <section id="diferencas" class="mb-5">
            <h2 class="h3 fw-bold mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-arrow-left-right text-purple"></i>
                Diferenças entre juros simples e compostos
            </h2>
            <p>
                A principal diferença entre as duas modalidades está na base de cálculo de cada período:
            </p>

            <div class="row g-4 mb-4">
                <div class="col-md-6">
                    <div class="p-3 rounded-3 border bg-body-tertiary h-100">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="comparison-pill comparison-pill-simple">Linear</span>
                            <h3 class="h6 fw-bold mb-0">Juros Simples</h3>
                        </div>
                        <ul class="text-muted small mb-0 ps-3">
                            <li>Incidem única e exclusivamente em cima do capital inicial;</li>
                            <li>Formam uma reta matemática contínua (ex: 100, 110, 120, 130...);</li>
                            <li>Os rendimentos nominais são constantes, mas perdem força em termos reais perante a inflação;</li>
                            <li>Geralmente utilizados em aplicações de curtíssimo prazo.</li>
                        </ul>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="p-3 rounded-3 border bg-body-tertiary h-100">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="comparison-pill comparison-pill-compound">Exponencial</span>
                            <h3 class="h6 fw-bold mb-0">Juros Compostos</h3>
                        </div>
                        <ul class="text-muted small mb-0 ps-3">
                            <li>Incidem sobre o montante total acumulado (capital inicial + juros anteriores);</li>
                            <li>Formam uma curva ascendente exponencial voltada para cima;</li>
                            <li>São crescentes em termos reais e nominais se a rentabilidade superar a inflação;</li>
                            <li>A base de criação de riqueza para a aposentadoria no longo prazo.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h3 class="h5 fw-bold mb-3">Exemplo Comparativo: Aplicação de R$ 5.000 a 1% ao mês</h3>
            <p class="text-muted small">
                Veja o que acontece com um investimento inicial de R$ 5.000,00 sem aportes adicionais sob taxa de 1% ao mês ao longo das décadas:
            </p>

            <div class="table-responsive">
                <table class="table custom-table">
                    <thead>
                        <tr>
                            <th>Prazo de Aplicação</th>
                            <th>Juros Simples</th>
                            <th>Juros Compostos</th>
                            <th>Diferença a Favor dos Compostos</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="fw-bold">5 anos (60 meses)</td>
                            <td>R$ 8.000,00</td>
                            <td class="fw-bold text-success">R$ 9.083,48</td>
                            <td class="text-success">+ R$ 1.083,48 (+13,5%)</td>
                        </tr>
                        <tr>
                            <td class="fw-bold">10 anos (120 meses)</td>
                            <td>R$ 11.000,00</td>
                            <td class="fw-bold text-success">R$ 16.501,93</td>
                            <td class="text-success">+ R$ 5.501,93 (+50,0%)</td>
                        </tr>
                        <tr>
                            <td class="fw-bold">20 anos (240 meses)</td>
                            <td>R$ 17.000,00</td>
                            <td class="fw-bold text-success">R$ 54.462,77</td>
                            <td class="text-success fw-bold">+ R$ 37.462,77 (+220,3%)</td>
                        </tr>
                        <tr>
                            <td class="fw-bold">30 anos (360 meses)</td>
                            <td>R$ 23.000,00</td>
                            <td class="fw-bold text-success fs-6">R$ 179.748,21</td>
                            <td class="text-success fw-bold">+ R$ 156.748,21 (+681,5%)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="p-3 rounded-3 bg-success-subtle border border-success-subtle mt-3">
                <i class="bi bi-quote fs-4 text-success me-2"></i>
                <em class="text-success-emphasis fw-medium">
                    "Os juros compostos são a oitava maravilha do mundo. Aquele que os entende, ganha; aquele que não os entende, paga." — Frase atribuída a Albert Einstein.
                </em>
            </div>
        </section>

        <!-- Seção 6: Perguntas Frequentes (FAQ) -->
        <section id="faq">
            <h2 class="h3 fw-bold mb-4 d-flex align-items-center gap-2">
                <i class="bi bi-patch-question text-warning"></i>
                Perguntas Frequentes (FAQ)
            </h2>

            <div class="accordion accordion-custom" id="faqAccordion">
                
                <div class="accordion-item">
                    <h3 class="accordion-header" id="headingOne">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            O que são juros compostos?
                        </button>
                    </h3>
                    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            Juros compostos são os juros calculados sobre o capital inicial acrescido de todos os juros acumulados nos períodos anteriores. Por isso são chamados de "juros sobre juros", proporcionando um crescimento exponencial ao longo do tempo.
                        </div>
                    </div>
                </div>

                <div class="accordion-item">
                    <h3 class="accordion-header" id="headingTwo">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            Como converter taxa de juros anual para mensal de forma correta?
                        </button>
                    </h3>
                    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            No regime de juros compostos, a taxa mensal equivalente não é simplesmente dividida por 12. A fórmula matemática da taxa equivalente é: <code>Taxa Mensal = (1 + Taxa Anual)^(1/12) - 1</code>. Assim, uma taxa de 12% ao ano corresponde geometricamente a 0,9488% ao mês. Nossa ferramenta realiza essa conversão automática para você.
                        </div>
                    </div>
                </div>

                <div class="accordion-item">
                    <h3 class="accordion-header" id="headingThree">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                            Como calcular quanto posso retirar por mês na aposentadoria?
                        </button>
                    </h3>
                    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            Para viver de renda perpétua sem descapitalizar o montante principal, a retirada mensal deve ser menor ou igual ao rendimento líquido mensal gerado pelos juros: <code>Renda Mensal = Patrimônio &times; Taxa Mensal</code>. Outra referência amplamente usada é a Regra dos 4% ao ano (Trinity Study), onde você resgata 4% do patrimônio ao ano dividido em 12 parcelas mensais ajustadas pela inflação.
                        </div>
                    </div>
                </div>

                <div class="accordion-item">
                    <h3 class="accordion-header" id="headingFour">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                            Este projeto é gratuito e Open Source?
                        </button>
                    </h3>
                    <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            Sim! A ferramenta foi totalmente desenvolvida por <strong>Pedro Falconi</strong> como um projeto Open Source licenciado sob a <strong>Licença MIT</strong>. O código-fonte é aberto para estudos, customizações e contribuições da comunidade.
                        </div>
                    </div>
                </div>

            </div>
        </section>

    </article>

</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
