/**
 * Calculadora de Juros Compostos
 * Desenvolvido por: Pedro Falconi | Projeto Open Source (Licença MIT)
 * Inspirado em: Investidor Sardinha (https://investidorsardinha.r7.com/calculadoras/calculadora-de-juros-compostos/)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos Elementos do DOM
    const initialInput = document.getElementById('initialValue');
    const monthlyInput = document.getElementById('monthlyValue');
    const annualIncreaseInput = document.getElementById('annualIncrease');
    const rateInput = document.getElementById('interestRate');
    const rateTypeInputs = document.querySelectorAll('input[name="rateType"]');
    const periodInput = document.getElementById('period');
    const periodTypeInputs = document.querySelectorAll('input[name="periodType"]');
    
    const calcForm = document.getElementById('calcForm');
    const btnReset = document.getElementById('btnReset');
    const btnShare = document.getElementById('btnShare');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const btnPrint = document.getElementById('btnPrint');
    const themeToggleBtn = document.getElementById('themeToggle');

    // Switch de Valor Líquido (IR 15% + IPCA)
    const onlyNetSwitch = document.getElementById('onlyNetSwitch');
    const netActiveBadge = document.getElementById('netActiveBadge');
    const netExplanationAlert = document.getElementById('netExplanationAlert');
    const kpiNetBadge = document.getElementById('kpiNetBadge');
    const kpiFinalBalanceSubtitle = document.getElementById('kpiFinalBalanceSubtitle');
    let currentIpcaRate = 4.58;

    // KPI Display
    const kpiFinalBalance = document.getElementById('kpiFinalBalance');
    const kpiTotalInvested = document.getElementById('kpiTotalInvested');
    const kpiTotalInterest = document.getElementById('kpiTotalInterest');
    const kpiPassiveIncome = document.getElementById('kpiPassiveIncome');
    const interestPercentageBadge = document.getElementById('interestPercentageBadge');
    const investedPercentageBadge = document.getElementById('investedPercentageBadge');
    const barInvested = document.getElementById('barInvested');
    const barInterest = document.getElementById('barInterest');

    // Tabela e Gráfico
    const tableBodyYearly = document.getElementById('tableBodyYearly');
    const tableBodyMonthly = document.getElementById('tableBodyMonthly');
    const chartViewToggle = document.getElementById('chartViewToggle');
    const ctx = document.getElementById('evolutionChart')?.getContext('2d');

    // Retiradas Modal
    const withdrawalModalEl = document.getElementById('withdrawalModal');
    const withdrawalModal = withdrawalModalEl ? new bootstrap.Modal(withdrawalModalEl) : null;
    const btnOpenWithdrawal = document.getElementById('btnOpenWithdrawal');
    const modalPatrimony = document.getElementById('modalPatrimony');
    const modalPerpetualIncome = document.getElementById('modalPerpetualIncome');
    const modalRule4Income = document.getElementById('modalRule4Income');
    const customWithdrawalInput = document.getElementById('customWithdrawalInput');
    const modalDepletionText = document.getElementById('modalDepletionText');

    let chartInstance = null;
    let lastSimulationResult = null;

    // Formatadores BRL
    const currencyFormatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });

    const numberFormatter = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    function parseBRL(value) {
        if (typeof value === 'number') return isNaN(value) ? 0 : value;
        if (value === null || value === undefined) return 0;
        let str = value.toString().trim();
        if (!str) return 0;

        // Se contiver vírgula: tudo antes da vírgula é inteiro, depois é decimal
        if (str.includes(',')) {
            str = str.replace(/\./g, '').replace(',', '.');
        } else {
            // Se NÃO tiver vírgula:
            // Se tiver ponto e terminar com .XX (1 ou 2 casas, ex: 13.75):
            if (/\.\d{1,2}$/.test(str) && (str.match(/\./g) || []).length === 1) {
                // mantém o ponto decimal (ex: taxa 13.75)
            } else {
                // Caso contrário, são pontos de milhar: remove todos os pontos (ex: 1.000 -> 1000)
                str = str.replace(/\./g, '');
            }
        }
        str = str.replace(/[^\d.-]/g, '');
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    }

    // Formata valor monetário com pontos de milhar e vírgula decimal
    function formatBRLValue(value) {
        if (value === null || value === undefined) return '';
        let str = value.toString().trim();
        if (!str) return '';

        str = str.replace(/^R\$\s*/i, '');

        // Se o usuário digitou ponto no final (ex: "1000."), converter para vírgula
        if (str.endsWith('.')) {
            str = str.slice(0, -1) + ',';
        }

        // Se não contiver vírgula, mas contiver um ponto com 1 ou 2 dígitos no final (ex: "1000.50"):
        if (!str.includes(',') && /\.\d{1,2}$/.test(str)) {
            str = str.replace(/\.(\d{1,2})$/, ',$1');
        }

        let integerPart = '';
        let decimalPart = null;

        if (str.includes(',')) {
            const parts = str.split(',');
            integerPart = parts[0].replace(/\D/g, '');
            decimalPart = parts.slice(1).join('').replace(/\D/g, '').slice(0, 2);
        } else {
            integerPart = str.replace(/\D/g, '');
        }

        if (!integerPart && decimalPart === null) return '';

        if (integerPart) {
            integerPart = integerPart.replace(/^0+(?=\d)/, '');
            if (integerPart === '') integerPart = '0';
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        } else if (decimalPart !== null) {
            integerPart = '0';
        }

        if (decimalPart !== null) {
            return `${integerPart},${decimalPart}`;
        }
        return integerPart;
    }

    // Formata valor de taxa de juros (ex: 13,75 ou 8)
    function formatRateValue(value) {
        if (value === null || value === undefined) return '';
        let str = value.toString().trim().replace('%', '');
        if (!str) return '';

        if (str.endsWith('.')) {
            str = str.slice(0, -1) + ',';
        }

        if (!str.includes(',') && str.includes('.')) {
            str = str.replace('.', ',');
        }

        const parts = str.split(',');
        let intPart = parts[0].replace(/\D/g, '');
        let decPart = parts.length > 1 ? parts.slice(1).join('').replace(/\D/g, '').slice(0, 2) : null;

        if (!intPart && decPart === null) return '';
        if (!intPart && decPart !== null) intPart = '0';

        if (decPart !== null) {
            return `${intPart},${decPart}`;
        }
        return intPart;
    }

    // Aplica formatação monetária em tempo de digitação mantendo o cursor
    function formatCurrencyInput(input) {
        const raw = input.value;
        if (!raw) return;

        const selectionStart = input.selectionStart || 0;
        const digitsBefore = raw.slice(0, selectionStart).replace(/\D/g, '').length;
        const hadCommaBefore = raw.slice(0, selectionStart).includes(',') || (raw.slice(0, selectionStart).endsWith('.') && !raw.includes(','));

        const formatted = formatBRLValue(raw);
        input.value = formatted;

        let newPos = formatted.length;
        if (selectionStart < raw.length) {
            let counted = 0;
            for (let i = 0; i < formatted.length; i++) {
                if (/\d/.test(formatted[i])) counted++;
                if (counted === digitsBefore) {
                    newPos = (hadCommaBefore && formatted[i + 1] === ',') ? i + 2 : i + 1;
                    break;
                }
            }
        }
        input.setSelectionRange(newPos, newPos);
    }

    // Aplica formatação de taxa em tempo de digitação mantendo o cursor
    function formatRateInputField(input) {
        const raw = input.value;
        if (!raw) return;

        const selectionStart = input.selectionStart || 0;
        const digitsBefore = raw.slice(0, selectionStart).replace(/\D/g, '').length;
        const hadCommaBefore = raw.slice(0, selectionStart).includes(',') || raw.slice(0, selectionStart).includes('.');

        const formatted = formatRateValue(raw);
        input.value = formatted;

        let newPos = formatted.length;
        if (selectionStart < raw.length) {
            let counted = 0;
            for (let i = 0; i < formatted.length; i++) {
                if (/\d/.test(formatted[i])) counted++;
                if (counted === digitsBefore) {
                    newPos = (hadCommaBefore && formatted[i + 1] === ',') ? i + 2 : i + 1;
                    break;
                }
            }
        }
        input.setSelectionRange(newPos, newPos);
    }

    function formatCurrency(val) {
        return currencyFormatter.format(val);
    }

    // Gerenciador de Tema
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        const icon = themeToggleBtn?.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'bi bi-sun-fill text-warning';
            } else {
                icon.className = 'bi bi-moon-stars-fill text-secondary';
            }
        }
        if (chartInstance) {
            updateChartTheme();
        }
        if (fireChartInstance && lastSimulationResult) {
            renderFireProjectionChart(lastSimulationResult);
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // Inicializar presets rápidos
    document.querySelectorAll('[data-preset-rate]').forEach(badge => {
        badge.addEventListener('click', () => {
            const rate = badge.getAttribute('data-preset-rate');
            const type = badge.getAttribute('data-preset-type') || 'yearly';
            rateInput.value = formatRateValue(rate);
            const targetRadio = document.querySelector(`input[name="rateType"][value="${type}"]`);
            if (targetRadio) targetRadio.checked = true;
            calculateAndRender();
        });
    });

    document.querySelectorAll('[data-preset-period]').forEach(badge => {
        badge.addEventListener('click', () => {
            const period = badge.getAttribute('data-preset-period');
            const type = badge.getAttribute('data-preset-type') || 'years';
            periodInput.value = period;
            const targetRadio = document.querySelector(`input[name="periodType"][value="${type}"]`);
            if (targetRadio) targetRadio.checked = true;
            calculateAndRender();
        });
    });

    // Presets rápidos de aumento anual do aporte
    document.querySelectorAll('[data-preset-annual-increase]').forEach(badge => {
        badge.addEventListener('click', () => {
            const val = badge.getAttribute('data-preset-annual-increase');
            if (annualIncreaseInput) {
                annualIncreaseInput.value = formatRateValue(val);
                calculateAndRender();
            }
        });
    });

    // Lógica Financeira Matemática no Frontend (Instantânea)
    function simulate(initialVal, monthlyVal, rate, rateType, periodVal, periodType, onlyNet = false, taxRate = 15.0, inflationRate = 4.58, annualIncrease = 0.0) {
        const initial = Math.max(0, initialVal);
        const monthly = Math.max(0, monthlyVal);
        const increaseRate = Math.max(0, annualIncrease);
        const interestRate = Math.max(0, rate);
        const period = Math.max(1, periodVal);

        const totalMonths = (periodType === 'years' || periodType === 'anos') ? period * 12 : period;
        
        let monthlyRate = 0;
        let annualRate = 0;
        const rateDec = interestRate / 100.0;
        const rawAnnual = (rateType === 'yearly' || rateType === 'anual') ? rateDec : (Math.pow(1 + rateDec, 12.0) - 1.0);

        if (onlyNet) {
            // 1. Descontar IR de 15% sobre o rendimento nominal
            const netAnnual = rawAnnual * (1.0 - (taxRate / 100.0));
            // 2. Descontar IPCA (inflação) pela Equação de Fisher
            const ipcaDec = inflationRate / 100.0;
            const realAnnual = ((1.0 + netAnnual) / (1.0 + ipcaDec)) - 1.0;
            annualRate = realAnnual;
            monthlyRate = realAnnual <= -1.0 ? 0.0 : Math.pow(1.0 + realAnnual, 1.0 / 12.0) - 1.0;
        } else {
            if (rateType === 'yearly' || rateType === 'anual') {
                monthlyRate = Math.pow(1 + rateDec, 1.0 / 12.0) - 1.0;
                annualRate = rateDec;
            } else {
                monthlyRate = rateDec;
                annualRate = rawAnnual;
            }
        }

        let balance = initial;
        let totalInvested = initial;
        let totalInterest = 0;

        const monthlyTimeline = [];
        const yearlyTimeline = [];

        let accumulatedInterestYear = 0;
        let investedInYear = 0;

        for (let m = 1; m <= totalMonths; m++) {
            const yearIndex = Math.floor((m - 1) / 12);
            const currentMonthlyDeposit = increaseRate > 0
                ? monthly * Math.pow(1 + (increaseRate / 100), yearIndex)
                : monthly;

            const interestThisMonth = balance * monthlyRate;
            totalInterest += interestThisMonth;
            accumulatedInterestYear += interestThisMonth;

            balance += interestThisMonth + currentMonthlyDeposit;
            totalInvested += currentMonthlyDeposit;
            investedInYear += currentMonthlyDeposit;

            monthlyTimeline.push({
                month: m,
                deposit: currentMonthlyDeposit,
                interestThisMonth: interestThisMonth,
                totalInterest: totalInterest,
                totalInvested: totalInvested,
                balance: balance
            });

            if (m % 12 === 0 || m === totalMonths) {
                yearlyTimeline.push({
                    year: Math.ceil(m / 12),
                    monthsCompleted: m,
                    investedInYear: investedInYear,
                    interestInYear: accumulatedInterestYear,
                    totalInvested: totalInvested,
                    totalInterest: totalInterest,
                    balance: balance
                });
                accumulatedInterestYear = 0;
                investedInYear = 0;
            }
        }

        const monthlyPassiveIncome = balance * Math.max(0, monthlyRate);
        const rule4PercentMonthly = (balance * 0.04) / 12.0;

        return {
            parameters: {
                initialValue: initial,
                monthlyValue: monthly,
                annualIncrease: increaseRate,
                interestRate: interestRate,
                rateType: rateType,
                period: period,
                periodType: periodType,
                totalMonths: totalMonths,
                onlyNet: onlyNet,
                taxRate: taxRate,
                inflationRate: inflationRate,
                effectiveMonthlyRate: (monthlyRate * 100).toFixed(4),
                effectiveAnnualRate: (annualRate * 100).toFixed(4)
            },
            summary: {
                finalBalance: balance,
                totalInvested: totalInvested,
                totalInterest: totalInterest,
                interestPercentage: balance > 0 ? ((totalInterest / balance) * 100).toFixed(1) : 0,
                investedPercentage: balance > 0 ? ((totalInvested / balance) * 100).toFixed(1) : 0,
                monthlyPassiveIncome: monthlyPassiveIncome,
                rule4PercentMonthly: rule4PercentMonthly,
                onlyNet: onlyNet
            },
            yearlyTimeline: yearlyTimeline,
            monthlyTimeline: monthlyTimeline
        };
    }

    function calculateAndRender(options = {}) {
        const allowConfetti = options.allowConfetti === true;
        const initialVal = parseBRL(initialInput.value);
        const monthlyVal = parseBRL(monthlyInput.value);
        const annualIncreaseVal = annualIncreaseInput ? parseBRL(annualIncreaseInput.value) : 0;
        const rateVal = parseBRL(rateInput.value);
        const rateType = document.querySelector('input[name="rateType"]:checked')?.value || 'yearly';
        const periodVal = parseInt(periodInput.value, 10) || 1;
        const periodType = document.querySelector('input[name="periodType"]:checked')?.value || 'years';
        const onlyNet = onlyNetSwitch ? onlyNetSwitch.checked : false;

        // Atualizar badges visuais de líquido
        if (netActiveBadge) netActiveBadge.classList.toggle('d-none', !onlyNet);
        if (netExplanationAlert) netExplanationAlert.classList.toggle('d-none', !onlyNet);
        if (kpiNetBadge) kpiNetBadge.classList.toggle('d-none', !onlyNet);
        if (kpiFinalBalanceSubtitle) {
            kpiFinalBalanceSubtitle.textContent = onlyNet ? 'Poder de compra real descontando IR e IPCA' : 'Montante acumulado ao fim do período';
        }

        const result = simulate(initialVal, monthlyVal, rateVal, rateType, periodVal, periodType, onlyNet, 15.0, currentIpcaRate, annualIncreaseVal);
        lastSimulationResult = result;

        renderSummary(result.summary, allowConfetti);
        renderChart(result);
        renderTables(result);
        updateWithdrawalModalData(result);
        updateURLParams(result.parameters);
    }

    function renderSummary(summary, allowConfetti = false) {
        kpiFinalBalance.textContent = formatCurrency(summary.finalBalance);
        kpiTotalInvested.textContent = formatCurrency(summary.totalInvested);
        kpiTotalInterest.textContent = formatCurrency(summary.totalInterest);
        kpiPassiveIncome.textContent = formatCurrency(summary.monthlyPassiveIncome);

        interestPercentageBadge.textContent = `${summary.interestPercentage}% em juros`;
        investedPercentageBadge.textContent = `${summary.investedPercentage}% aportado`;

        if (barInvested && barInterest) {
            barInvested.style.width = `${summary.investedPercentage}%`;
            barInterest.style.width = `${summary.interestPercentage}%`;
        }

        // Se passar de R$ 100.000 e for uma ação explícita de cálculo, soltar celebração confetti
        if (allowConfetti && summary.finalBalance >= 100000 && typeof confetti === 'function') {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 }
            });
        }
    }

    function renderTables(result) {
        // Tabela Anual
        if (tableBodyYearly) {
            let htmlYearly = '';
            result.yearlyTimeline.forEach(row => {
                htmlYearly += `
                    <tr>
                        <td class="fw-bold">${row.year}º Ano <span class="text-muted small">(${row.monthsCompleted} meses)</span></td>
                        <td>${formatCurrency(row.investedInYear)}</td>
                        <td>${formatCurrency(row.totalInvested)}</td>
                        <td class="text-success fw-semibold">+ ${formatCurrency(row.interestInYear)}</td>
                        <td class="text-success">${formatCurrency(row.totalInterest)}</td>
                        <td class="fw-bold text-primary">${formatCurrency(row.balance)}</td>
                    </tr>
                `;
            });
            tableBodyYearly.innerHTML = htmlYearly;
        }

        // Tabela Mensal
        if (tableBodyMonthly) {
            let htmlMonthly = '';
            // Limitar a exibição inicial dos primeiros 120 meses se for muito longo para não travar DOM
            const displayLimit = Math.min(result.monthlyTimeline.length, 360);
            for (let i = 0; i < displayLimit; i++) {
                const row = result.monthlyTimeline[i];
                htmlMonthly += `
                    <tr>
                        <td class="fw-bold">Mês ${row.month}</td>
                        <td>${formatCurrency(row.deposit)}</td>
                        <td>${formatCurrency(row.totalInvested)}</td>
                        <td class="text-success fw-semibold">+ ${formatCurrency(row.interestThisMonth)}</td>
                        <td class="text-success">${formatCurrency(row.totalInterest)}</td>
                        <td class="fw-bold text-primary">${formatCurrency(row.balance)}</td>
                    </tr>
                `;
            }
            if (result.monthlyTimeline.length > displayLimit) {
                htmlMonthly += `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-3">
                            <em>Exibindo os primeiros ${displayLimit} meses na tabela. Exporte o CSV para visualizar todos os ${result.monthlyTimeline.length} meses completos!</em>
                        </td>
                    </tr>
                `;
            }
            tableBodyMonthly.innerHTML = htmlMonthly;
        }
    }

    function getChartColors() {
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        return {
            textColor: isDark ? '#94a3b8' : '#475569',
            gridColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
            investedColor: '#3b82f6',
            interestColor: '#10b981',
            totalLineColor: isDark ? '#38bdf8' : '#0284c7'
        };
    }

    function updateChartTheme() {
        if (!chartInstance) return;
        const colors = getChartColors();
        chartInstance.options.scales.x.ticks.color = colors.textColor;
        chartInstance.options.scales.x.grid.color = colors.gridColor;
        chartInstance.options.scales.y.ticks.color = colors.textColor;
        chartInstance.options.scales.y.grid.color = colors.gridColor;
        chartInstance.options.plugins.legend.labels.color = colors.textColor;
        chartInstance.update();
    }

    function renderChart(result) {
        if (!ctx) return;

        const isYearly = chartViewToggle ? chartViewToggle.checked : true;
        const timeline = isYearly ? result.yearlyTimeline : result.monthlyTimeline;
        const labels = timeline.map(item => isYearly ? `Ano ${item.year}` : `Mês ${item.month}`);
        const investedData = timeline.map(item => item.totalInvested);
        const interestData = timeline.map(item => item.totalInterest);

        const colors = getChartColors();

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Investido (Aportes)',
                        data: investedData,
                        backgroundColor: '#3b82f6',
                        borderRadius: 4,
                        stack: 'combined'
                    },
                    {
                        label: 'Total em Juros Acumulados',
                        data: interestData,
                        backgroundColor: '#10b981',
                        borderRadius: 4,
                        stack: 'combined'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: colors.textColor,
                            font: {
                                family: 'Plus Jakarta Sans',
                                weight: 600,
                                size: 12
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.92)',
                        titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 700 },
                        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            },
                            footer: function(tooltipItems) {
                                let sum = 0;
                                tooltipItems.forEach(item => { sum += item.parsed.y; });
                                return ` Montante Total: ${formatCurrency(sum)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { color: colors.gridColor },
                        ticks: {
                            color: colors.textColor,
                            maxTicksLimit: isYearly ? 20 : 15,
                            font: { family: 'Plus Jakarta Sans', size: 11 }
                        }
                    },
                    y: {
                        stacked: true,
                        grid: { color: colors.gridColor },
                        ticks: {
                            color: colors.textColor,
                            font: { family: 'Plus Jakarta Sans', size: 11 },
                            callback: function(val) {
                                if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
                                if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
                                return `R$ ${val}`;
                            }
                        }
                    }
                }
            }
        });
    }

    if (chartViewToggle) {
        chartViewToggle.addEventListener('change', () => {
            if (lastSimulationResult) {
                renderChart(lastSimulationResult);
            }
        });
    }

    const resultTabs = document.getElementById('resultTabs');
    const chartViewToggleWrapper = document.getElementById('chartViewToggleWrapper');
    if (resultTabs && chartViewToggleWrapper) {
        resultTabs.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('id');
            chartViewToggleWrapper.style.display = targetId === 'tab-chart' ? 'block' : 'none';
        });
    }

    // =========================================================================
    // Módulo Completo: Viver de Renda & FIRE (Independência Financeira)
    // =========================================================================
    const tabViverRendaBtn = document.getElementById('tab-viver-renda');
    const kpiIncomeCard = document.getElementById('kpiIncomeCard');
    const fireWithdrawalInput = document.getElementById('fireWithdrawalInput');
    const fireDepletionFeedback = document.getElementById('fireDepletionFeedback');
    const fireTargetIncomeInput = document.getElementById('fireTargetIncomeInput');
    const fireTargetPatrimony4 = document.getElementById('fireTargetPatrimony4');
    const fireTargetPatrimonyPerp = document.getElementById('fireTargetPatrimonyPerp');
    const fireProgressPercent = document.getElementById('fireProgressPercent');
    const fireProgressBar = document.getElementById('fireProgressBar');
    const fireGoalRemainingText = document.getElementById('fireGoalRemainingText');
    const fireChartCanvas = document.getElementById('fireProjectionChart');
    let fireChartInstance = null;

    function switchToFireTab() {
        if (tabViverRendaBtn) {
            const tab = bootstrap.Tab.getOrCreateInstance(tabViverRendaBtn);
            tab.show();
            document.getElementById('resultTabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                if (fireChartInstance) fireChartInstance.resize();
            }, 150);
        }
    }

    if (btnOpenWithdrawal) {
        btnOpenWithdrawal.addEventListener('click', switchToFireTab);
    }

    if (kpiIncomeCard) {
        kpiIncomeCard.addEventListener('click', switchToFireTab);
    }

    if (tabViverRendaBtn) {
        tabViverRendaBtn.addEventListener('shown.bs.tab', () => {
            if (lastSimulationResult) {
                renderFireProjectionChart(lastSimulationResult);
            }
        });
    }

    function updateWithdrawalModalData(result) {
        if (!result) return;
        const balance = result.summary.finalBalance;
        const passiveIncome = result.summary.monthlyPassiveIncome;
        const rule4Income = result.summary.rule4PercentMonthly;
        const rule3Income = (balance * 0.03) / 12;
        const rule5Income = (balance * 0.05) / 12;

        // Atualizar textos no cabeçalho e cards
        document.querySelectorAll('.fire-display-patrimony').forEach(el => el.textContent = formatCurrency(balance));
        document.querySelectorAll('.fire-display-perpetual').forEach(el => el.textContent = formatCurrency(passiveIncome));

        const fireCardPerpetualVal = document.getElementById('fireCardPerpetualVal');
        const fireCardRule4Val = document.getElementById('fireCardRule4Val');
        const fireCardRule3Val = document.getElementById('fireCardRule3Val');
        const fireCardRule5Val = document.getElementById('fireCardRule5Val');
        if (fireCardPerpetualVal) fireCardPerpetualVal.textContent = formatCurrency(passiveIncome);
        if (fireCardRule4Val) fireCardRule4Val.textContent = formatCurrency(rule4Income);
        if (fireCardRule3Val) fireCardRule3Val.textContent = formatCurrency(rule3Income);
        if (fireCardRule5Val) fireCardRule5Val.textContent = formatCurrency(rule5Income);

        // Modal antigo (sincronização)
        if (modalPatrimony) modalPatrimony.textContent = formatCurrency(balance);
        if (modalPerpetualIncome) modalPerpetualIncome.textContent = `${formatCurrency(passiveIncome)}/mês`;
        if (modalRule4Income) modalRule4Income.textContent = `${formatCurrency(rule4Income)}/mês`;

        // Se o campo de retirada estiver vazio, preencher com a renda perpétua
        if (fireWithdrawalInput && (!fireWithdrawalInput.value || fireWithdrawalInput.value === '0')) {
            fireWithdrawalInput.value = formatBRLValue(Math.round(passiveIncome));
        }
        if (customWithdrawalInput && (!customWithdrawalInput.value || customWithdrawalInput.value === '0')) {
            customWithdrawalInput.value = formatBRLValue(Math.round(passiveIncome));
        }

        calculateFireDepletion();
        calculateFireGoal();
        renderFireProjectionChart(result);
    }

    function calculateFireDepletion() {
        if (!lastSimulationResult || !fireWithdrawalInput || !fireDepletionFeedback) return;
        const withdrawal = parseBRL(fireWithdrawalInput.value);
        const balance = lastSimulationResult.summary.finalBalance;
        const monthlyRate = lastSimulationResult.summary.monthlyPassiveIncome / (balance || 1);
        const perpetualIncome = balance * monthlyRate;

        if (withdrawal <= 0) {
            fireDepletionFeedback.innerHTML = `
                <div class="alert alert-secondary d-flex align-items-center gap-2 mb-0 py-2">
                    <i class="bi bi-info-circle"></i>
                    <span>Insira um valor de retirada mensal acima para simular a sustentabilidade do seu patrimônio.</span>
                </div>
            `;
            return;
        }

        if (withdrawal <= perpetualIncome) {
            const surplus = perpetualIncome - withdrawal;
            fireDepletionFeedback.innerHTML = `
                <div class="alert alert-success d-flex align-items-start gap-3 mb-0 shadow-sm">
                    <i class="bi bi-shield-check fs-3 text-success"></i>
                    <div>
                        <div class="fw-bold fs-6">Patrimônio 100% Perpétuo e Blindado!</div>
                        <p class="mb-1 small">
                            A retirada mensal de <strong>${formatCurrency(withdrawal)}</strong> é menor ou igual ao rendimento gerado pelos juros (<strong>${formatCurrency(perpetualIncome)}/mês</strong>).
                        </p>
                        <div class="small text-success-emphasis fw-semibold">
                            <i class="bi bi-arrow-up-right me-1"></i> Sobra de segurança de <strong>${formatCurrency(surplus)}/mês</strong> reinvestida automaticamente, fazendo o patrimônio continuar crescendo para sempre!
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Simular descapitalização mês a mês
            let currentBal = balance;
            let monthsLeft = 0;
            while (currentBal > 0 && monthsLeft < 1200) { // max 100 anos
                const interest = currentBal * monthlyRate;
                currentBal = currentBal + interest - withdrawal;
                monthsLeft++;
            }
            const yearsLeft = Math.floor(monthsLeft / 12);
            const remainingMonths = monthsLeft % 12;
            const yearsStr = yearsLeft > 0 ? `${yearsLeft} ano${yearsLeft > 1 ? 's' : ''}` : '';
            const monthsStr = remainingMonths > 0 ? `${remainingMonths} m${remainingMonths > 1 ? 'eses' : 'ês'}` : '';
            const timeFormatted = [yearsStr, monthsStr].filter(Boolean).join(' e ');

            const isSafeHorizon = yearsLeft >= 35;
            const alertClass = isSafeHorizon ? 'alert-warning' : 'alert-danger';
            const iconClass = isSafeHorizon ? 'bi-exclamation-triangle-fill text-warning' : 'bi-x-octagon-fill text-danger';

            fireDepletionFeedback.innerHTML = `
                <div class="alert ${alertClass} d-flex align-items-start gap-3 mb-0 shadow-sm">
                    <i class="bi ${iconClass} fs-3"></i>
                    <div>
                        <div class="fw-bold fs-6">
                            ${isSafeHorizon ? 'Consumo Gradual de Capital (Longo Prazo)' : 'Alerta de Descapitalização!'}
                        </div>
                        <p class="mb-1 small">
                            A retirada de <strong>${formatCurrency(withdrawal)}/mês</strong> excede o rendimento mensal gerado de <strong>${formatCurrency(perpetualIncome)}/mês</strong>, consumindo o saldo principal aos poucos.
                        </p>
                        <div class="small fw-semibold">
                            <i class="bi bi-clock-history me-1"></i> O seu patrimônio durará aproximadamente <strong>${timeFormatted} (${monthsLeft} meses)</strong> até se esgotar completamente.
                        </div>
                    </div>
                </div>
            `;
        }

        // Sincronizar com o modal de retiradas se existir
        if (modalDepletionText) {
            modalDepletionText.innerHTML = fireDepletionFeedback.innerHTML;
        }
    }

    // Calculadora Reversa de Liberdade Financeira
    function calculateFireGoal() {
        if (!lastSimulationResult || !fireTargetIncomeInput) return;
        const targetMonthly = parseBRL(fireTargetIncomeInput.value);
        const currentBalance = lastSimulationResult.summary.finalBalance;
        const monthlyRate = lastSimulationResult.summary.monthlyPassiveIncome / (currentBalance || 1);

        if (targetMonthly <= 0) return;

        // Pela Regra dos 4% ao ano: Patrimônio = Meta Anual / 0.04 = Meta Mensal * 300
        const neededPatrimony4 = targetMonthly * 300;
        // Pela Renda Perpétua: Patrimônio = Meta Mensal / taxaMensal
        const effectiveRate = monthlyRate > 0 ? monthlyRate : (0.08 / 12);
        const neededPatrimonyPerp = targetMonthly / effectiveRate;

        if (fireTargetPatrimony4) fireTargetPatrimony4.textContent = formatCurrency(neededPatrimony4);
        if (fireTargetPatrimonyPerp) fireTargetPatrimonyPerp.textContent = formatCurrency(neededPatrimonyPerp);

        // Progresso em relação à Regra dos 4%
        const percent = Math.min(100, (currentBalance / (neededPatrimony4 || 1)) * 100);
        const remaining = Math.max(0, neededPatrimony4 - currentBalance);

        if (fireProgressPercent) fireProgressPercent.textContent = `${percent.toFixed(1)}%`;
        if (fireProgressBar) {
            fireProgressBar.style.width = `${percent}%`;
            if (percent >= 100) {
                fireProgressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
            } else {
                fireProgressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)';
            }
        }

        if (fireGoalRemainingText) {
            if (percent >= 100) {
                fireGoalRemainingText.innerHTML = `<span class="text-success fw-bold"><i class="bi bi-trophy-fill text-warning me-1"></i> Parabéns! O seu patrimônio simulado já ultrapassou a meta de renda de ${formatCurrency(targetMonthly)}/mês!</span>`;
            } else {
                fireGoalRemainingText.innerHTML = `Faltam <strong>${formatCurrency(remaining)}</strong> para conquistar esta renda com total tranquilidade pela Regra dos 4%.`;
            }
        }
    }

    // Gráfico de Sustentabilidade da Renda por 30 Anos
    function renderFireProjectionChart(result) {
        if (!fireChartCanvas || !result) return;
        const ctxFire = fireChartCanvas.getContext('2d');
        if (!ctxFire) return;

        const balance = result.summary.finalBalance;
        const monthlyRate = result.summary.monthlyPassiveIncome / (balance || 1);
        const withdrawal = fireWithdrawalInput ? parseBRL(fireWithdrawalInput.value) : (result.summary.monthlyPassiveIncome);

        // Projetar 30 anos (ano 0 a ano 30)
        const yearsLabels = [];
        const balancesData = [];

        let currentBal = balance;
        yearsLabels.push('Hoje');
        balancesData.push(Math.round(currentBal));

        for (let y = 1; y <= 30; y++) {
            for (let m = 1; m <= 12; m++) {
                if (currentBal > 0) {
                    const interest = currentBal * monthlyRate;
                    currentBal = currentBal + interest - withdrawal;
                    if (currentBal < 0) currentBal = 0;
                }
            }
            yearsLabels.push(`Ano ${y}`);
            balancesData.push(Math.round(currentBal));
        }

        const isGrowing = balancesData[balancesData.length - 1] >= balance;
        const isDepleted = balancesData[balancesData.length - 1] === 0;

        let lineColor = '#10b981'; // verde
        let gradientColor = 'rgba(16, 185, 129, 0.15)';
        if (isDepleted) {
            lineColor = '#ef4444'; // vermelho
            gradientColor = 'rgba(239, 68, 68, 0.15)';
        } else if (!isGrowing) {
            lineColor = '#f59e0b'; // amarelo/âmbar
            gradientColor = 'rgba(245, 158, 11, 0.15)';
        }

        const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
        const textColor = currentTheme === 'dark' ? '#94a3b8' : '#64748b';
        const gridColor = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

        if (fireChartInstance) {
            fireChartInstance.destroy();
        }

        fireChartInstance = new Chart(ctxFire, {
            type: 'line',
            data: {
                labels: yearsLabels,
                datasets: [{
                    label: 'Patrimônio Restante',
                    data: balancesData,
                    borderColor: lineColor,
                    backgroundColor: gradientColor,
                    fill: true,
                    tension: 0.25,
                    borderWidth: 2.5,
                    pointRadius: 2,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` Saldo Projetado: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, maxTicksLimit: 10, font: { family: 'Plus Jakarta Sans', size: 10 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            font: { family: 'Plus Jakarta Sans', size: 10 },
                            callback: function(val) {
                                if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
                                if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
                                return `R$ ${val}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Clique nos cards de estratégias (Perpétua, 4%, 3%, 5%)
    document.querySelectorAll('[data-fire-strategy]').forEach(card => {
        card.addEventListener('click', () => {
            if (!lastSimulationResult || !fireWithdrawalInput) return;
            const strategy = card.getAttribute('data-fire-strategy');
            const balance = lastSimulationResult.summary.finalBalance;
            const passiveIncome = lastSimulationResult.summary.monthlyPassiveIncome;

            let amount = passiveIncome;
            if (strategy === 'rule4') amount = (balance * 0.04) / 12;
            if (strategy === 'rule3') amount = (balance * 0.03) / 12;
            if (strategy === 'rule5') amount = (balance * 0.05) / 12;

            document.querySelectorAll('[data-fire-strategy]').forEach(c => c.classList.remove('active-strategy'));
            card.classList.add('active-strategy');

            fireWithdrawalInput.value = formatBRLValue(Math.round(amount));
            calculateFireDepletion();
            renderFireProjectionChart(lastSimulationResult);
        });
    });

    // Chips de retirada rápida (R$ 3k, 5k, etc)
    document.querySelectorAll('[data-quick-withdrawal]').forEach(chip => {
        chip.addEventListener('click', () => {
            if (!lastSimulationResult || !fireWithdrawalInput) return;
            const w = chip.getAttribute('data-quick-withdrawal');
            const balance = lastSimulationResult.summary.finalBalance;
            let amount = lastSimulationResult.summary.monthlyPassiveIncome;
            if (w === 'rule4') amount = (balance * 0.04) / 12;

            fireWithdrawalInput.value = formatBRLValue(Math.round(amount));
            calculateFireDepletion();
            renderFireProjectionChart(lastSimulationResult);
        });
    });

    document.querySelectorAll('[data-quick-amount]').forEach(chip => {
        chip.addEventListener('click', () => {
            if (!fireWithdrawalInput) return;
            const amount = chip.getAttribute('data-quick-amount');
            fireWithdrawalInput.value = formatBRLValue(amount);
            calculateFireDepletion();
            if (lastSimulationResult) renderFireProjectionChart(lastSimulationResult);
        });
    });

    // Digitação no input de retirada
    if (fireWithdrawalInput) {
        fireWithdrawalInput.addEventListener('input', () => {
            formatCurrencyInput(fireWithdrawalInput);
            calculateFireDepletion();
            if (lastSimulationResult) renderFireProjectionChart(lastSimulationResult);
        });
        fireWithdrawalInput.addEventListener('blur', () => {
            if (fireWithdrawalInput.value.endsWith(',')) {
                fireWithdrawalInput.value = fireWithdrawalInput.value.slice(0, -1);
            }
        });
    }

    // Calculadora reversa (digitação e chips)
    if (fireTargetIncomeInput) {
        fireTargetIncomeInput.addEventListener('input', () => {
            formatCurrencyInput(fireTargetIncomeInput);
            calculateFireGoal();
        });
        fireTargetIncomeInput.addEventListener('blur', () => {
            if (fireTargetIncomeInput.value.endsWith(',')) {
                fireTargetIncomeInput.value = fireTargetIncomeInput.value.slice(0, -1);
            }
        });
    }

    document.querySelectorAll('[data-quick-target]').forEach(chip => {
        chip.addEventListener('click', () => {
            if (!fireTargetIncomeInput) return;
            const target = chip.getAttribute('data-quick-target');
            fireTargetIncomeInput.value = formatBRLValue(target);
            calculateFireGoal();
        });
    });

    // Modal de Retiradas Legado (sincronização)
    if (customWithdrawalInput) {
        customWithdrawalInput.addEventListener('input', () => {
            formatCurrencyInput(customWithdrawalInput);
            if (fireWithdrawalInput) {
                fireWithdrawalInput.value = customWithdrawalInput.value;
                calculateFireDepletion();
            }
        });
    }

    // Exportar CSV
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
            if (!lastSimulationResult) return;
            const timeline = lastSimulationResult.monthlyTimeline;
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Mes;Valor Aportado (R$);Total Investido (R$);Juros no Mes (R$);Total Juros (R$);Saldo Acumulado (R$)\r\n";

            timeline.forEach(row => {
                csvContent += `${row.month};${row.deposit.toFixed(2)};${row.totalInvested.toFixed(2)};${row.interestThisMonth.toFixed(2)};${row.totalInterest.toFixed(2)};${row.balance.toFixed(2)}\r\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `simulacao_juros_compostos_${lastSimulationResult.parameters.period}_${lastSimulationResult.parameters.periodType}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Compartilhar Link
    function updateURLParams(params) {
        const url = new URL(window.location);
        url.searchParams.set('inicial', params.initialValue);
        url.searchParams.set('mensal', params.monthlyValue);
        if (params.annualIncrease > 0) {
            url.searchParams.set('aumentoAnual', params.annualIncrease);
        } else {
            url.searchParams.delete('aumentoAnual');
        }
        url.searchParams.set('taxa', params.interestRate);
        url.searchParams.set('tipoTaxa', params.rateType);
        url.searchParams.set('periodo', params.period);
        url.searchParams.set('tipoPeriodo', params.periodType);
        url.searchParams.set('liquido', params.onlyNet ? 'true' : 'false');
        window.history.replaceState({}, '', url);
    }

    if (btnShare) {
        btnShare.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const originalHtml = btnShare.innerHTML;
                btnShare.innerHTML = `<i class="bi bi-check2"></i> Link Copiado!`;
                btnShare.classList.add('btn-success');
                setTimeout(() => {
                    btnShare.innerHTML = originalHtml;
                    btnShare.classList.remove('btn-success');
                }, 2000);
            });
        });
    }

    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }

    // Resetar
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            initialInput.value = '1.000';
            monthlyInput.value = '1.000';
            if (annualIncreaseInput) annualIncreaseInput.value = '0';
            rateInput.value = '8';
            document.querySelector('input[name="rateType"][value="yearly"]').checked = true;
            periodInput.value = '20';
            document.querySelector('input[name="periodType"][value="years"]').checked = true;
            if (onlyNetSwitch) onlyNetSwitch.checked = false;
            calculateAndRender();
        });
    }

    // Eventos de entrada em tempo real com formatação de pontos e vírgulas
    if (initialInput) {
        initialInput.addEventListener('input', () => {
            formatCurrencyInput(initialInput);
            calculateAndRender();
        });
        initialInput.addEventListener('blur', () => {
            if (initialInput.value.endsWith(',')) {
                initialInput.value = initialInput.value.slice(0, -1);
            }
        });
    }

    if (monthlyInput) {
        monthlyInput.addEventListener('input', () => {
            formatCurrencyInput(monthlyInput);
            calculateAndRender();
        });
        monthlyInput.addEventListener('blur', () => {
            if (monthlyInput.value.endsWith(',')) {
                monthlyInput.value = monthlyInput.value.slice(0, -1);
            }
        });
    }

    if (annualIncreaseInput) {
        annualIncreaseInput.addEventListener('input', () => {
            formatRateInputField(annualIncreaseInput);
            calculateAndRender();
        });
        annualIncreaseInput.addEventListener('blur', () => {
            if (annualIncreaseInput.value.endsWith(',')) {
                annualIncreaseInput.value = annualIncreaseInput.value.slice(0, -1);
            }
        });
    }

    if (rateInput) {
        rateInput.addEventListener('input', () => {
            formatRateInputField(rateInput);
            calculateAndRender();
        });
        rateInput.addEventListener('blur', () => {
            if (rateInput.value.endsWith(',')) {
                rateInput.value = rateInput.value.slice(0, -1);
            }
        });
    }

    if (periodInput) {
        periodInput.addEventListener('input', () => {
            periodInput.value = periodInput.value.replace(/\D/g, '');
            calculateAndRender();
        });
    }

    if (onlyNetSwitch) {
        onlyNetSwitch.addEventListener('change', () => {
            calculateAndRender();
        });
    }

    rateTypeInputs.forEach(radio => radio.addEventListener('change', calculateAndRender));
    periodTypeInputs.forEach(radio => radio.addEventListener('change', calculateAndRender));

    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateAndRender({ allowConfetti: true });
        });
    }

    // Ler parâmetros da URL se existirem na inicialização
    function loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('inicial')) {
            const val = parseBRL(urlParams.get('inicial'));
            initialInput.value = formatBRLValue(val);
        }
        if (urlParams.has('mensal')) {
            const val = parseBRL(urlParams.get('mensal'));
            monthlyInput.value = formatBRLValue(val);
        }
        if (urlParams.has('aumentoAnual') && annualIncreaseInput) {
            const val = parseBRL(urlParams.get('aumentoAnual'));
            annualIncreaseInput.value = formatRateValue(val);
        } else if (urlParams.has('annualIncrease') && annualIncreaseInput) {
            const val = parseBRL(urlParams.get('annualIncrease'));
            annualIncreaseInput.value = formatRateValue(val);
        }
        if (urlParams.has('taxa')) {
            const rawRate = parseBRL(urlParams.get('taxa'));
            if (rawRate > 200) {
                rateInput.value = (rawRate / 100).toFixed(2).replace('.', ',');
            } else if (rawRate > 0) {
                rateInput.value = formatRateValue(rawRate);
            }
        }
        if (urlParams.has('tipoTaxa')) {
            const r = document.querySelector(`input[name="rateType"][value="${urlParams.get('tipoTaxa')}"]`);
            if (r) r.checked = true;
        }
        if (urlParams.has('periodo')) periodInput.value = urlParams.get('periodo').replace(/\D/g, '');
        if (urlParams.has('tipoPeriodo')) {
            const p = document.querySelector(`input[name="periodType"][value="${urlParams.get('tipoPeriodo')}"]`);
            if (p) p.checked = true;
        }
        if (urlParams.has('liquido') && onlyNetSwitch) {
            onlyNetSwitch.checked = urlParams.get('liquido') === 'true';
        }
    }

    // Carregar Taxas em Tempo Real via BrasilAPI
    async function loadLiveRates() {
        try {
            let res = await fetch('api/taxas.php');
            if (!res.ok) {
                res = await fetch('https://brasilapi.com.br/api/taxas/v1');
            }
            const json = await res.json();
            const ratesData = json.data || {};
            
            let selic = 13.75, cdi = 13.65, ipca = 4.58;
            if (Array.isArray(json)) {
                json.forEach(item => {
                    const k = item.nome?.toUpperCase();
                    if (k === 'SELIC') selic = Number(item.valor);
                    if (k === 'CDI') cdi = Number(item.valor);
                    if (k === 'IPCA') ipca = Number(item.valor);
                });
            } else if (ratesData) {
                if (ratesData.SELIC) selic = Number(ratesData.SELIC.valor);
                if (ratesData.CDI) cdi = Number(ratesData.CDI.valor);
                if (ratesData.IPCA) ipca = Number(ratesData.IPCA.valor);
            }

            // Armazenar taxa IPCA em tempo real
            currentIpcaRate = ipca;

            // Atualizar valores visuais na barra superior
            const rateSelicVal = document.getElementById('rateSelicVal');
            const rateCdiVal = document.getElementById('rateCdiVal');
            const rateIpcaVal = document.getElementById('rateIpcaVal');
            if (rateSelicVal) rateSelicVal.innerHTML = `${selic.toFixed(2).replace('.', ',')}% <small class="fw-normal text-muted" style="font-size:0.75rem;">a.a.</small>`;
            if (rateCdiVal) rateCdiVal.innerHTML = `${cdi.toFixed(2).replace('.', ',')}% <small class="fw-normal text-muted" style="font-size:0.75rem;">a.a.</small>`;
            if (rateIpcaVal) rateIpcaVal.innerHTML = `${ipca.toFixed(2).replace('.', ',')}% <small class="fw-normal text-muted" style="font-size:0.75rem;">a.a.</small>`;

            // Se o modo líquido estiver ativo, recalcular com a taxa atualizada
            if (onlyNetSwitch && onlyNetSwitch.checked) {
                calculateAndRender();
            }

            // Atualizar atributos de dados nos cards
            document.querySelectorAll('[data-apply-name="SELIC"]').forEach(el => el.setAttribute('data-apply-rate', selic));
            document.querySelectorAll('[data-apply-name="CDI"]').forEach(el => el.setAttribute('data-apply-rate', cdi));

            // Atualizar badges de presets rápidos
            const presetSelicBadge = document.getElementById('presetSelicBadge');
            if (presetSelicBadge) {
                presetSelicBadge.setAttribute('data-preset-rate', selic);
                presetSelicBadge.innerHTML = `<i class="bi bi-broadcast text-success me-1"></i>Selic Atual (${selic.toFixed(2).replace('.', ',')}%)`;
            }

            const presetCdiBadge = document.getElementById('presetCdiBadge');
            if (presetCdiBadge) {
                presetCdiBadge.setAttribute('data-preset-rate', cdi);
                presetCdiBadge.innerHTML = `<i class="bi bi-broadcast text-primary me-1"></i>CDI Atual (${cdi.toFixed(2).replace('.', ',')}%)`;
            }

            const presetIpcaIncreaseBadge = document.getElementById('presetIpcaIncreaseBadge');
            if (presetIpcaIncreaseBadge) {
                presetIpcaIncreaseBadge.setAttribute('data-preset-annual-increase', ipca);
                presetIpcaIncreaseBadge.innerHTML = `<i class="bi bi-graph-up-arrow text-warning me-1"></i>IPCA (${ipca.toFixed(2).replace('.', ',')}%)`;
            }
        } catch (e) {
            console.warn('BrasilAPI fallback ativo:', e);
        }
    }

    // Clique nos cards de taxas para aplicar diretamente na simulação
    document.querySelectorAll('.rate-badge-card[data-apply-rate]').forEach(card => {
        card.addEventListener('click', () => {
            const rate = card.getAttribute('data-apply-rate');
            if (rate) {
                rateInput.value = formatRateValue(rate);
                const yearlyRadio = document.querySelector('input[name="rateType"][value="yearly"]');
                if (yearlyRadio) yearlyRadio.checked = true;
                calculateAndRender();

                card.classList.add('border-success', 'shadow');
                setTimeout(() => card.classList.remove('border-success', 'shadow'), 700);
            }
        });
    });

    // Inicializar Tooltips do Bootstrap
    function initTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].forEach(el => new bootstrap.Tooltip(el));
    }

    // Inicialização
    initTheme();
    loadFromURL();
    loadLiveRates();
    initTooltips();
    calculateAndRender();
});

