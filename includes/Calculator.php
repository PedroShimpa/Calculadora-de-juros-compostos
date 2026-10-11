<?php
declare(strict_types=1);

/**
 * Calculadora de Juros Compostos
 * Desenvolvido por: Pedro Falconi
 * Projeto Open Source
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

    public function __construct(
        float $initialValue = 1000.0,
        float $monthlyValue = 1000.0,
        float $interestRate = 8.0,
        string $rateType = 'yearly',
        int $period = 20,
        string $periodType = 'years'
    ) {
        $this->initialValue = max(0.0, $initialValue);
        $this->monthlyValue = max(0.0, $monthlyValue);
        $this->interestRate = max(0.0, $interestRate);
        $this->rateType = in_array(strtolower($rateType), ['yearly', 'monthly', 'anual', 'mensal']) ? strtolower($rateType) : 'yearly';
        $this->period = max(1, $period);
        $this->periodType = in_array(strtolower($periodType), ['years', 'months', 'anos', 'meses']) ? strtolower($periodType) : 'years';
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
     * Retorna a taxa mensal efetiva em formato decimal
     * Exemplo: 8% a.a. => (1 + 0.08)^(1/12) - 1 ≈ 0.00643403
     */
    public function getMonthlyRate(): float
    {
        $rateDecimal = $this->interestRate / 100.0;
        if (in_array($this->rateType, ['yearly', 'anual'])) {
            return pow(1.0 + $rateDecimal, 1.0 / 12.0) - 1.0;
        }
        return $rateDecimal;
    }

    /**
     * Retorna a taxa anual efetiva em formato decimal
     */
    public function getAnnualRate(): float
    {
        $rateDecimal = $this->interestRate / 100.0;
        if (in_array($this->rateType, ['yearly', 'anual'])) {
            return $rateDecimal;
        }
        return pow(1.0 + $rateDecimal, 12.0) - 1.0;
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
            // Rendimento sobre o saldo existente
            $interestThisMonth = $balance * $monthlyRate;
            $totalInterest += $interestThisMonth;
            $accumulatedInterestYear += $interestThisMonth;

            // Aporte mensal adicionado ao final do ciclo
            $balance += $interestThisMonth + $this->monthlyValue;
            $totalInvested += $this->monthlyValue;
            $investedInYear += $this->monthlyValue;

            $monthlyTimeline[] = [
                'month' => $month,
                'deposit' => $this->monthlyValue,
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
        $monthlyPassiveIncome = $balance * $monthlyRate;
        // Estimativa pela regra clássica dos 4% anuais
        $rule4PercentMonthly = ($balance * 0.04) / 12.0;

        return [
            'parameters' => [
                'initialValue' => $this->initialValue,
                'monthlyValue' => $this->monthlyValue,
                'interestRate' => $this->interestRate,
                'rateType' => $this->rateType,
                'period' => $this->period,
                'periodType' => $this->periodType,
                'totalMonths' => $totalMonths,
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
            ],
            'yearlyTimeline' => $yearlyTimeline,
            'monthlyTimeline' => $monthlyTimeline
        ];
    }
}
