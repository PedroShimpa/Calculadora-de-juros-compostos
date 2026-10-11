<?php
declare(strict_types=1);
/**
 * Footer da Calculadora de Juros Compostos
 * Desenvolvido por: Pedro Falconi | Projeto Open Source
 */
?>
    <!-- Rodapé -->
    <footer class="py-5 mt-5">
        <div class="container">
            <div class="row gy-4 align-items-center">
                <div class="col-lg-6 text-center text-lg-start">
                    <div class="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 mb-2">
                        <span class="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle" style="width: 28px; height: 28px;">
                            <i class="bi bi-graph-up-arrow small"></i>
                        </span>
                        <strong class="text-primary fs-5">Calculadora de Juros Compostos</strong>
                        <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill">Open Source</span>
                    </div>
                    <p class="mb-1 text-muted">
                        Desenvolvido por <strong>Pedro Falconi</strong>. Código aberto e gratuito sob a licença 
                        <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-success fw-semibold">MIT</a>.
                    </p>
                    <p class="mb-0 text-muted small">
                        Inspirado na metodologia e conteúdo da <a href="https://investidorsardinha.r7.com/calculadoras/calculadora-de-juros-compostos/" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-muted">Calculadora do Investidor Sardinha</a>.
                    </p>
                </div>
                <div class="col-lg-6 text-center text-lg-end">
                    <div class="d-flex flex-wrap justify-content-center justify-content-lg-end gap-3 small mb-3">
                        <a href="#como-usar" class="text-muted text-decoration-none hover-link">Como Usar</a>
                        <span class="text-muted">&bull;</span>
                        <a href="#formula" class="text-muted text-decoration-none hover-link">Fórmula</a>
                        <span class="text-muted">&bull;</span>
                        <a href="#diferencas" class="text-muted text-decoration-none hover-link">Simples vs Compostos</a>
                        <span class="text-muted">&bull;</span>
                        <a href="#faq" class="text-muted text-decoration-none hover-link">Perguntas Frequentes</a>
                    </div>
                    <div class="d-inline-flex align-items-center gap-2">
                        <span class="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-pill small">
                            <i class="bi bi-code-slash me-1"></i> PHP 8.2 + Bootstrap 5 + Chart.js
                        </span>
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill small">
                            <i class="bi bi-person-check me-1"></i> Pedro Falconi &copy; <?php echo date('Y'); ?>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

    <!-- Chart.js 4 -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>

    <!-- Canvas Confetti para Marcos de Patrimônio -->
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>

    <!-- Script Customizado da Calculadora -->
    <script src="assets/js/app.js"></script>
</body>
</html>
