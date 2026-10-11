<?php
declare(strict_types=1);
/**
 * Header e SEO da Calculadora de Juros Compostos
 * Desenvolvido por: Pedro Falconi | Open Source
 * Inspirado em: Investidor Sardinha
 */
?>
<!DOCTYPE html>
<html lang="pt-BR" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- Título SEO -->
    <title>Calculadora de Juros Compostos [Cálculos Financeiros] &#8211; Pedro Falconi</title>
    
    <!-- Meta Tags SEO Principais -->
    <meta name="description" content="Calcule quanto seu dinheiro rende com juros sobre juros e aportes mensais. Veja a evolução ano a ano e descubra o quanto o tempo pesa no resultado. Ferramenta gratuita desenvolvida por Pedro Falconi.">
    <meta name="keywords" content="calculadora juros compostos, juros sobre juros, simulador de investimentos, simulador de aposentadoria, renda fixa, cdb, tesouro direto, pedro falconi, projeto open source">
    <meta name="author" content="Pedro Falconi">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="http://localhost/calculadora-juros-compostos/">

    <!-- Open Graph / Facebook -->
    <meta property="og:locale" content="pt_BR">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Calculadora de Juros Compostos [Cálculos Financeiros] - Pedro Falconi">
    <meta property="og:description" content="Calcule quanto seu dinheiro rende com juros sobre juros e aportes mensais. Veja a evolução ano a ano e descubra o quanto o tempo pesa no resultado.">
    <meta property="og:url" content="http://localhost/calculadora-juros-compostos/">
    <meta property="og:site_name" content="Calculadora de Juros Compostos - Pedro Falconi">

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Calculadora de Juros Compostos [Cálculos Financeiros] - Pedro Falconi">
    <meta name="twitter:description" content="Calcule quanto seu dinheiro rende com juros sobre juros e aportes mensais. Veja a evolução ano a ano e descubra o quanto o tempo pesa no resultado.">
    <meta name="twitter:creator" content="@pedrofalconi">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Bootstrap 5.3 & Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">

    <!-- Schema.org JSON-LD (Web Application & FAQPage) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": "http://localhost/calculadora-juros-compostos/#app",
          "name": "Calculadora de Juros Compostos",
          "url": "http://localhost/calculadora-juros-compostos/",
          "description": "Calcule quanto seu dinheiro rende com juros sobre juros e aportes mensais. Veja a evolução ano a ano e descubra o quanto o tempo pesa no resultado.",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript. Requires HTML5.",
          "author": {
            "@type": "Person",
            "name": "Pedro Falconi",
            "url": "https://github.com/pedrofalconi"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL"
          },
          "license": "https://opensource.org/licenses/MIT",
          "isAccessibleForFree": true
        },
        {
          "@type": "FAQPage",
          "@id": "http://localhost/calculadora-juros-compostos/#faq",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Como funciona a calculadora de juros compostos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A calculadora calcula o rendimento do capital investido ao longo do tempo considerando a incidência de juros sobre juros, além dos aportes periódicos realizados mensalmente."
              }
            },
            {
              "@type": "Question",
              "name": "Qual é a fórmula dos juros compostos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A fórmula básica é M = C * (1 + i)^t, onde M é o montante acumulado, C é o capital inicial, i é a taxa de juros e t é o período de tempo."
              }
            },
            {
              "@type": "Question",
              "name": "Qual a diferença entre taxa anual e taxa mensal?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Taxas de investimento como Selic e CDB são divulgadas ao ano. Para calcular o rendimento composto equivalente mensal, aplica-se a equivalência geométrica (1 + taxa_anual)^(1/12) - 1. Por exemplo, 12% ao ano equivale a 0,95% ao mês, e 1% ao mês equivale a 12,68% ao ano."
              }
            },
            {
              "@type": "Question",
              "name": "Como calcular retiradas mensais para viver de renda?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Para viver de renda sem consumir o patrimônio principal (renda perpétua), você retira exatamente os juros mensais gerados pela aplicação: Rendimento Mensal = Montante * Taxa Mensal."
              }
            }
          ]
        }
      ]
    }
    </script>
</head>
<body>

    <!-- Navegação Superior -->
    <nav class="navbar navbar-expand-lg navbar-custom">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none" href="index.php">
                <span class="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle" style="width: 36px; height: 36px;">
                    <i class="bi bi-graph-up-arrow"></i>
                </span>
                <span>Juros Compostos</span>
                <span class="brand-badge ms-1">PRO</span>
            </a>

            <div class="d-flex align-items-center gap-2 ms-auto">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-secondary d-none d-sm-inline-flex align-items-center gap-1 rounded-pill px-3">
                    <i class="bi bi-github"></i>
                    <span>Open Source</span>
                </a>

                <button class="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" id="themeToggle" type="button" title="Alternar Modo Claro / Escuro" style="width: 38px; height: 38px;">
                    <i class="bi bi-moon-stars-fill"></i>
                </button>
            </div>
        </div>
    </nav>
