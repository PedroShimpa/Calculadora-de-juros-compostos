<?php
declare(strict_types=1);

/**
 * Calculadora de Juros Compostos
 * Desenvolvido por: Pedro Falconi
 * Projeto Open Source (Licença MIT)
 * Inspirado em: Investidor Sardinha (https://investidorsardinha.r7.com/calculadoras/calculadora-de-juros-compostos/)
 */

namespace App;

class CompoundInterestCalculator
{
    private float $initialValue;
    private float $monthlyValue;
    private float $interestRate;
    private string $rateType; // 'yearly' or 'monthly'
    private int $period;
    private string $periodType; // 'years' or 'months'
    private bool $onlyNet;
    private float $taxRate; // IR médio (padrão 15%)
    private float $inflationRate; // IPCA (padrão 4.58%)
    private float $annualContributionIncrease; // Aumento percentual anual no aporte (% a.a.)

    public function __construct(
        float $initialValue = 1000.0,
        float $monthlyValue = 1000.0,
        float $interestRate = 8.0,
        string $rateType = 'yearly',
        int $period = 20,
        string $periodType = 'years',
        bool $onlyNet = false,
        float $taxRate = 15.0,
        float $inflationRate = 4.58,
        float $annualContributionIncrease = 0.0
    ) {
        $this->initialValue = max(0.0, $initialValue);
        $this->monthlyValue = max(0.0, $monthlyValue);
        $this->interestRate = max(0.0, $interestRate);
        $this->rateType = in_array(strtolower($rateType), ['yearly', 'monthly', 'anual', 'mensal']) ? strtolower($rateType) : 'yearly';
        $this->period = max(1, $period);
        $this->periodType = in_array(strtolower($periodType), ['years', 'months', 'anos', 'meses']) ? strtolower($periodType) : 'years';
        $this->onlyNet = $onlyNet;
        $this->taxRate = max(0.0, $taxRate);
        $this->inflationRate = max(0.0, $inflationRate);
        $this->annualContributionIncrease = max(0.0, $annualContributionIncrease);
    }

    /**
     * Retorna a quantidade total de meses
     */
    public function getTotalMonths(): int
    {
        if (in_array($this->periodType, ['years', 'anos'])) {
            return $this->period * 12;
        }
        return $this->period;
    }

    /**
     * Retorna a taxa anual nominal pura (sem descontos)
     */
    public function getRawAnnualRate(): float
    {
        $rateDecimal = $this->interestRate / 100.0;
        if (in_array($this->rateType, ['yearly', 'anual'])) {
            return $rateDecimal;
        }
        return pow(1.0 + $rateDecimal, 12.0) - 1.0;
    }

    /**
     * Retorna a taxa mensal efetiva considerada no cálculo
     * Se $onlyNet estiver ativo, desconta IR (15%) e Inflação (IPCA) pela Equação de Fisher
     */
    public function getMonthlyRate(): float
    {
        $rawAnnual = $this->getRawAnnualRate();

        if ($this->onlyNet) {
            // 1. Descontar Imposto de Renda de 15% sobre o rendimento nominal
            $netAnnual = $rawAnnual * (1.0 - ($this->taxRate / 100.0));
            // 2. Descontar Inflação (IPCA) via Equação de Fisher: (1 + r_real) = (1 + r_liq) / (1 + ipca)
            $ipcaDecimal = $this->inflationRate / 100.0;
            $realAnnual = ((1.0 + $netAnnual) / (1.0 + $ipcaDecimal)) - 1.0;

            if ($realAnnual <= -1.0) {
                return 0.0;
            }
            return pow(1.0 + $realAnnual, 1.0 / 12.0) - 1.0;
        }

        $rateDecimal = $this->interestRate / 100.0;
        if (in_array($this->rateType, ['yearly', 'anual'])) {
            return pow(1.0 + $rateDecimal, 1.0 / 12.0) - 1.0;
        }
        return $rateDecimal;
    }

    /**
     * Retorna a taxa anual efetiva considerada no cálculo
     */
    public function getAnnualRate(): float
    {
        $mRate = $this->getMonthlyRate();
        return pow(1.0 + $mRate, 12.0) - 1.0;
    }

    /**
     * Executa a simulação completa mês a mês
     */
    public function calculate(): array
    {
        $totalMonths = $this->getTotalMonths();
        $monthlyRate = $this->getMonthlyRate();
        $annualRate = $this->getAnnualRate();

        $balance = $this->initialValue;
        $totalInvested = $this->initialValue;
        $totalInterest = 0.0;

        $monthlyTimeline = [];
        $yearlyTimeline = [];

        $accumulatedInterestYear = 0.0;
        $investedInYear = 0.0;

        for ($month = 1; $month <= $totalMonths; $month++) {
            // Calcular o valor do aporte considerando reajuste anual a cada 12 meses
            $yearIndex = (int)floor(($month - 1) / 12);
            $currentMonthlyDeposit = ($this->annualContributionIncrease > 0.0)
                ? $this->monthlyValue * pow(1.0 + ($this->annualContributionIncrease / 100.0), $yearIndex)
                : $this->monthlyValue;

            // Rendimento sobre o saldo existente
            $interestThisMonth = $balance * $monthlyRate;
            $totalInterest += $interestThisMonth;
            $accumulatedInterestYear += $interestThisMonth;

            // Aporte mensal adicionado ao final do ciclo
            $balance += $interestThisMonth + $currentMonthlyDeposit;
            $totalInvested += $currentMonthlyDeposit;
            $investedInYear += $currentMonthlyDeposit;

            $monthlyTimeline[] = [
                'month' => $month,
                'deposit' => round($currentMonthlyDeposit, 2),
                'interestThisMonth' => round($interestThisMonth, 2),
                'totalInterest' => round($totalInterest, 2),
                'totalInvested' => round($totalInvested, 2),
                'balance' => round($balance, 2)
            ];

            // Ao completar um ano ou no último mês
            if ($month % 12 === 0 || $month === $totalMonths) {
                $yearNumber = (int)ceil($month / 12);
                $yearlyTimeline[] = [
                    'year' => $yearNumber,
                    'monthsCompleted' => $month,
                    'investedInYear' => round($investedInYear, 2),
                    'interestInYear' => round($accumulatedInterestYear, 2),
                    'totalInvested' => round($totalInvested, 2),
                    'totalInterest' => round($totalInterest, 2),
                    'balance' => round($balance, 2)
                ];
                $accumulatedInterestYear = 0.0;
                $investedInYear = 0.0;
            }
        }

        // Estimativa de retirada perpétua (viver de juros sem tocar no principal)
        $monthlyPassiveIncome = $balance * max(0.0, $monthlyRate);
        // Estimativa pela regra clássica dos 4% anuais
        $rule4PercentMonthly = ($balance * 0.04) / 12.0;

        return [
            'parameters' => [
                'initialValue' => $this->initialValue,
                'monthlyValue' => $this->monthlyValue,
                'annualContributionIncrease' => $this->annualContributionIncrease,
                'interestRate' => $this->interestRate,
                'rateType' => $this->rateType,
                'period' => $this->period,
                'periodType' => $this->periodType,
                'totalMonths' => $totalMonths,
                'onlyNet' => $this->onlyNet,
                'taxRate' => $this->taxRate,
                'inflationRate' => $this->inflationRate,
                'effectiveMonthlyRate' => round($monthlyRate * 100, 4),
                'effectiveAnnualRate' => round($annualRate * 100, 4)
            ],
            'summary' => [
                'finalBalance' => round($balance, 2),
                'totalInvested' => round($totalInvested, 2),
                'totalInterest' => round($totalInterest, 2),
                'interestPercentage' => $balance > 0 ? round(($totalInterest / $balance) * 100, 2) : 0,
                'investedPercentage' => $balance > 0 ? round(($totalInvested / $balance) * 100, 2) : 0,
                'monthlyPassiveIncome' => round($monthlyPassiveIncome, 2),
                'rule4PercentMonthly' => round($rule4PercentMonthly, 2),
                'onlyNet' => $this->onlyNet
            ],
            'yearlyTimeline' => $yearlyTimeline,
            'monthlyTimeline' => $monthlyTimeline
        ];
    }
}
