/**
 * Calculadora de Juros Compostos
 * Desenvolvido por: Pedro Falconi | Projeto Open Source (Licença MIT)
 * Inspirado em: Investidor Sardinha (https://investidorsardinha.r7.com/calculadoras/calculadora-de-juros-compostos/)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos Elementos do DOM
    const initialInput = document.getElementById('initialValue');
    const monthlyInput = document.getElementById('monthlyValue');
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
        // Se contiver vírgula (formatação pt-BR como "13,75" ou "1.000,50")
        if (str.includes(',')) {
            str = str.replace(/\./g, '').replace(',', '.');
        } else {
            // Se contiver ponto ou formato numérico padrão ("13.75" de input number)
            str = str.replace(/[^\d.-]/g, '');
        }
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
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
            rateInput.value = rate;
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

    // Lógica Financeira Matemática no Frontend (Instantânea)
    function simulate(initialVal, monthlyVal, rate, rateType, periodVal, periodType, onlyNet = false, taxRate = 15.0, inflationRate = 4.58) {
        const initial = Math.max(0, initialVal);
        const monthly = Math.max(0, monthlyVal);
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
            const interestThisMonth = balance * monthlyRate;
            totalInterest += interestThisMonth;
            accumulatedInterestYear += interestThisMonth;

            balance += interestThisMonth + monthly;
            totalInvested += monthly;
            investedInYear += monthly;

            monthlyTimeline.push({
                month: m,
                deposit: monthly,
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

    function calculateAndRender() {
        const initialVal = parseBRL(initialInput.value);
        const monthlyVal = parseBRL(monthlyInput.value);
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

        const result = simulate(initialVal, monthlyVal, rateVal, rateType, periodVal, periodType, onlyNet, 15.0, currentIpcaRate);
        lastSimulationResult = result;

        renderSummary(result.summary);
        renderChart(result);
        renderTables(result);
        updateWithdrawalModalData(result);
        updateURLParams(result.parameters);
    }

    function renderSummary(summary) {
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

        // Se passar de R$ 100.000, soltar celebração confetti se biblioteca estiver disponível
        if (summary.finalBalance >= 100000 && typeof confetti === 'function' && !window.confettiFired) {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 }
            });
            window.confettiFired = true;
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

    // Modal de Retiradas
    function updateWithdrawalModalData(result) {
        if (!modalPatrimony) return;
        const balance = result.summary.finalBalance;
        const passiveIncome = result.summary.monthlyPassiveIncome;
        const rule4Income = result.summary.rule4PercentMonthly;

        modalPatrimony.textContent = formatCurrency(balance);
        modalPerpetualIncome.textContent = formatCurrency(passiveIncome);
        modalRule4Income.textContent = formatCurrency(rule4Income);

        if (customWithdrawalInput) {
            if (!customWithdrawalInput.value || customWithdrawalInput.value === '0') {
                customWithdrawalInput.value = Math.round(passiveIncome);
            }
            calculateDepletion();
        }
    }

    function calculateDepletion() {
        if (!lastSimulationResult || !customWithdrawalInput || !modalDepletionText) return;
        const withdrawal = parseBRL(customWithdrawalInput.value);
        const balance = lastSimulationResult.summary.finalBalance;
        const monthlyRate = lastSimulationResult.summary.monthlyPassiveIncome / (balance || 1);

        if (withdrawal <= 0) {
            modalDepletionText.innerHTML = `<span class="text-muted">Insira um valor de retirada mensal para simular a sustentabilidade.</span>`;
            return;
        }

        const perpetualIncome = balance * monthlyRate;

        if (withdrawal <= perpetualIncome) {
            modalDepletionText.innerHTML = `
                <div class="alert alert-success d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-shield-check fs-4"></i>
                    <div>
                        <strong>Patrimônio Perpétuo!</strong> A retirada mensal de <strong>${formatCurrency(withdrawal)}</strong> é inferior ou igual ao rendimento mensal gerado (${formatCurrency(perpetualIncome)}). Seu dinheiro nunca acabará e continuará crescendo ou estável!
                    </div>
                </div>
            `;
        } else {
            // Simular descapitalização
            let currentBal = balance;
            let monthsLeft = 0;
            while (currentBal > 0 && monthsLeft < 1200) { // max 100 anos
                const interest = currentBal * monthlyRate;
                currentBal = currentBal + interest - withdrawal;
                monthsLeft++;
            }
            const yearsLeft = (monthsLeft / 12).toFixed(1);

            modalDepletionText.innerHTML = `
                <div class="alert alert-warning d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-exclamation-triangle-fill fs-4"></i>
                    <div>
                        <strong>Consumo de Principal:</strong> A retirada mensal de <strong>${formatCurrency(withdrawal)}</strong> excede o rendimento gerado pelos juros. O seu patrimônio durará aproximadamente <strong>${monthsLeft} meses (~${yearsLeft} anos)</strong> até se esgotar.
                    </div>
                </div>
            `;
        }
    }

    if (customWithdrawalInput) {
        customWithdrawalInput.addEventListener('input', calculateDepletion);
    }

    if (btnOpenWithdrawal) {
        btnOpenWithdrawal.addEventListener('click', () => {
            if (withdrawalModal) {
                withdrawalModal.show();
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
            initialInput.value = '1000';
            monthlyInput.value = '1000';
            rateInput.value = '8';
            document.querySelector('input[name="rateType"][value="yearly"]').checked = true;
            periodInput.value = '20';
            document.querySelector('input[name="periodType"][value="years"]').checked = true;
            if (onlyNetSwitch) onlyNetSwitch.checked = false;
            window.confettiFired = false;
            calculateAndRender();
        });
    }

    // Eventos de entrada em tempo real
    [initialInput, monthlyInput, rateInput, periodInput].forEach(inp => {
        if (inp) {
            inp.addEventListener('input', () => {
                calculateAndRender();
            });
        }
    });

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
            calculateAndRender();
        });
    }

    // Ler parâmetros da URL se existirem na inicialização
    function loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('inicial')) initialInput.value = urlParams.get('inicial');
        if (urlParams.has('mensal')) monthlyInput.value = urlParams.get('mensal');
        if (urlParams.has('taxa')) {
            const rawRate = parseBRL(urlParams.get('taxa'));
            if (rawRate > 200) {
                rateInput.value = (rawRate / 100).toFixed(2).replace(/\.00$/, '');
            } else if (rawRate > 0) {
                rateInput.value = rawRate;
            }
        }
        if (urlParams.has('tipoTaxa')) {
            const r = document.querySelector(`input[name="rateType"][value="${urlParams.get('tipoTaxa')}"]`);
            if (r) r.checked = true;
        }
        if (urlParams.has('periodo')) periodInput.value = urlParams.get('periodo');
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
        } catch (e) {
            console.warn('BrasilAPI fallback ativo:', e);
        }
    }

    // Clique nos cards de taxas para aplicar diretamente na simulação
    document.querySelectorAll('.rate-badge-card[data-apply-rate]').forEach(card => {
        card.addEventListener('click', () => {
            const rate = card.getAttribute('data-apply-rate');
            if (rate) {
                rateInput.value = rate;
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

