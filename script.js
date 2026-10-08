document.addEventListener("DOMContentLoaded", () => {

    const GITHUB_USERNAME = "ludafcull";

    // 1. PARTICLES.JS
    if (typeof particlesJS !== "undefined") {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#38bdf8" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.2, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#38bdf8", "opacity": 0.1, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "straight": false, "out_mode": "out" }
            },
            "interactivity": { "detect_on": "canvas", "events": { "onclick": { "enable": false } } },
            "retina_detect": true
        });
    }

    // 2. API DO GITHUB (PROJETOS)
    async function fetchGitHubProjects() {
        const gridContainer = document.querySelector(".archive-grid");
        if (!gridContainer) return;

        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
            if (!response.ok) throw new Error("Erro na API");
            const repos = await response.json();

            let added = 0;
            repos.forEach(repo => {
                if (repo.fork) return;

                const projectCard = document.createElement("div");
                projectCard.classList.add("archive-item");
                projectCard.setAttribute("data-category", "dev");

                const language = repo.language ? repo.language : "Código";
                const description = repo.description || "Projeto em desenvolvimento ativo no ecossistema GitHub.";

                projectCard.innerHTML = `
                    <div>
                        <span class="tag">${language} // GitHub</span>
                        <h3>${repo.name}</h3>
                        <p>${description}</p>
                        <a href="${repo.html_url}" target="_blank" class="project-link">Ver Código Fonte ↗</a>
                    </div>
                `;
                gridContainer.insertBefore(projectCard, gridContainer.firstChild);
                added++;
            });

            if (added === 0) throw new Error("Sem repositórios");
        } catch (error) {
            console.error("Erro ao carregar GitHub:", error);
            const fallbackCard = document.createElement("div");
            fallbackCard.classList.add("archive-item");
            fallbackCard.setAttribute("data-category", "dev");
            fallbackCard.innerHTML = `
                <div>
                    <span class="tag">JavaScript // Node</span>
                    <h3>LUDA BOT</h3>
                    <p>Customização baseada no GoatBot V2, com automação de respostas e moderação de grupos.</p>
                    <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" class="project-link">Aceder ao GitHub ↗</a>
                </div>
            `;
            gridContainer.insertBefore(fallbackCard, gridContainer.firstChild);
        }
    }

    // 3. FILTROS
    function setupFilters() {
        const filterButtons = document.querySelectorAll(".filter-btn");
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                filterButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");

                const filterValue = button.getAttribute("data-filter");
                const archiveItems = document.querySelectorAll(".archive-item");
                const quizSection = document.getElementById("quiz-app");

                if (quizSection) {
                    if (filterValue === "all" || filterValue === "anime") {
                        quizSection.classList.remove("hidden");
                    } else {
                        quizSection.classList.add("hidden");
                    }
                }

                archiveItems.forEach(item => {
                    if (filterValue === "all" || item.getAttribute("data-category") === filterValue) {
                        item.style.display = "flex";
                    } else {
                        item.style.display = "none";
                    }
                });
            });
        });
    }

    // 4. QUIZ
    const quizData = [
        { q: "Quem se tornou o herói número 1 após a aposentadoria do All Might em My Hero Academia?", o: ["Bakugo", "Endeavor", "Midoriya", "Todoroki"], a: 1 },
        { q: "Qual é o nome da técnica assinatura de Gon Freecss em Hunter x Hunter?", o: ["Rasengan", "Jajanken", "Chidori", "Getsuga Tenshou"], a: 1 },
        { q: "No anime Orange, de onde vêm as cartas que Naho recebe?", o: ["De um admirador secreto", "Do seu eu do futuro", "De um universo paralelo", "De um irmão desaparecido"], a: 1 }
    ];

    let currentQuestion = 0;
    let score = 0;

    function loadQuiz() {
        const titleEl = document.getElementById("quiz-question");
        const optionsContainer = document.getElementById("quiz-options");
        if (!titleEl || !optionsContainer) return;

        optionsContainer.innerHTML = "";

        if (currentQuestion < quizData.length) {
            const current = quizData[currentQuestion];
            titleEl.textContent = `[QUIZ] Pergunta ${currentQuestion + 1}: ${current.q}`;

            current.o.forEach((option, index) => {
                const btn = document.createElement("button");
                btn.classList.add("quiz-opt-btn");
                btn.textContent = option;
                btn.addEventListener("click", () => selectQuizAnswer(index));
                optionsContainer.appendChild(btn);
            });
        } else {
            titleEl.textContent = `Quiz Concluído! Pontuação Final: ${score}/${quizData.length}`;
            const restartBtn = document.createElement("button");
            restartBtn.classList.add("filter-btn");
            restartBtn.style.marginTop = "1rem";
            restartBtn.textContent = "Reiniciar Quiz";
            restartBtn.addEventListener("click", () => {
                currentQuestion = 0;
                score = 0;
                loadQuiz();
            });
            optionsContainer.appendChild(restartBtn);
        }
    }

    function selectQuizAnswer(index) {
        if (index === quizData[currentQuestion].a) {
            score++;
            alert("Resposta Correta!");
        } else {
            alert("Resposta Errada!");
        }
        currentQuestion++;
        loadQuiz();
    }

    // 5. TERMINAL INTERATIVO
    const terminalBody = document.getElementById("terminal");
    const terminalHistory = document.getElementById("terminal-history");
    const terminalInput = document.getElementById("terminal-input");

    if (terminalInput && terminalHistory) {
        terminalHistory.textContent = "Bem-vindo ao terminal do LUDA Archive v2.0.\nDigite 'help' para ver os comandos disponíveis.\n\n";

        terminalInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const command = terminalInput.value.trim().toLowerCase();
                executeTerminalCommand(command);
                terminalInput.value = "";
            }
        });
    }

    if (terminalBody && terminalInput) {
        terminalBody.addEventListener("click", () => terminalInput.focus());
    }

    function executeTerminalCommand(cmd) {
        let output = `\nluda@archive:$ ${cmd}\n`;

        if (cmd === "") {
            terminalHistory.textContent += output;
            terminalBody.scrollTop = terminalBody.scrollHeight;
            return;
        }

        switch (cmd) {
            case "help":
                output += "Comandos disponíveis:\n" +
                          "  about       - Breve resumo sobre o criador\n" +
                          "  contact     - Exibe as informações de contacto direto\n" +
                          "  theme-green - Altera o tom do layout para verde neon\n" +
                          "  theme-pink  - Altera o tom do layout para rosa neon\n" +
                          "  theme-blue  - Restaura o tema azul original do site\n" +
                          "  clear       - Limpa o histórico de comandos da consola";
                break;
            case "about":
                output += "Eu sou o Luda, desenvolvedor baseado em São Tomé e Príncipe. Focado em JavaScript, automações e apaixonado por HQs, animes e thrillers psicológicos.";
                break;
            case "contact":
                output += "E-mail: ludacrisdrede@gmail.com\nWhatsApp: +239 9883169";
                break;
            case "theme-green":
                document.body.className = "theme-green";
                output += "Tema alterado para Verde Neon com sucesso.";
                break;
            case "theme-pink":
                document.body.className = "theme-pink";
                output += "Tema alterado para Rosa Neon com sucesso.";
                break;
            case "theme-blue":
                document.body.className = "";
                output += "Tema original azul restaurado.";
                break;
            case "clear":
                terminalHistory.textContent = "";
                return;
            default:
                output += `Comando não reconhecido: '${cmd}'. Digite 'help' para ver as instruções de sistema.`;
        }

        terminalHistory.textContent += output + "\n";
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // INICIALIZAÇÃO
    fetchGitHubProjects();
    setupFilters();
    loadQuiz();
});