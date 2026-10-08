document.addEventListener("DOMContentLoaded", () => {

    const GITHUB_USERNAME = "ludafcull";
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let currentFilter = "all";
    let loadedRepos = [];

    // ==========================================
    // 1. PARTICLES.JS
    // ==========================================
    if (typeof particlesJS !== "undefined") {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": isMobile ? 25 : 40, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#38bdf8" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.2, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#38bdf8", "opacity": 0.1, "width": 1 },
                "move": { "enable": !reduceMotion, "speed": 1.5, "direction": "none", "random": true, "straight": false, "out_mode": "out" }
            },
            "interactivity": { "detect_on": "canvas", "events": { "onclick": { "enable": false } } },
            "retina_detect": true
        });
    }

    // ==========================================
    // 2. CARTÕES + API DO GITHUB
    // ==========================================
    function createCard({ category, tag, title, description, url, linkText }) {
        const card = document.createElement("div");
        card.classList.add("archive-item");
        card.setAttribute("data-category", category);

        const inner = document.createElement("div");

        const tagEl = document.createElement("span");
        tagEl.className = "tag";
        tagEl.textContent = tag;

        const titleEl = document.createElement("h3");
        titleEl.textContent = title;

        const descEl = document.createElement("p");
        descEl.textContent = description;

        inner.append(tagEl, titleEl, descEl);

        if (url) {
            card.classList.add("has-link");
            const link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "project-link";
            link.textContent = linkText;
            inner.appendChild(link);
        }

        card.appendChild(inner);
        return card;
    }

    async function fetchGitHubProjects() {
        const gridContainer = document.querySelector(".archive-grid");
        if (!gridContainer) return;

        let cards = [];

        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
            if (!response.ok) throw new Error("Erro na API");
            const repos = await response.json();

            loadedRepos = repos.filter(repo => !repo.fork);

            cards = loadedRepos.map(repo => createCard({
                category: "dev",
                tag: `${repo.language || "Código"} // GitHub`,
                title: repo.name,
                description: repo.description || "Projeto em desenvolvimento ativo no ecossistema GitHub.",
                url: repo.html_url,
                linkText: "Ver Código Fonte ↗"
            }));

            if (cards.length === 0) throw new Error("Sem repositórios");
        } catch (error) {
            console.error("Erro ao carregar GitHub:", error);
            cards = [createCard({
                category: "dev",
                tag: "JavaScript // Node",
                title: "LUDA BOT",
                description: "Customização baseada no GoatBot V2, com automação de respostas e moderação de grupos.",
                url: `https://github.com/${GITHUB_USERNAME}`,
                linkText: "Aceder ao GitHub ↗"
            })];
        }

        // prepend mantém a ordem da API (mais recente primeiro)
        gridContainer.prepend(...cards);
        applyFilter(currentFilter);
    }

    // ==========================================
    // 3. FILTROS
    // ==========================================
    function applyFilter(filterValue) {
        currentFilter = filterValue;

        document.querySelectorAll(".filter-btn[data-filter]").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-filter") === filterValue);
        });

        const quizSection = document.getElementById("quiz-app");
        if (quizSection) {
            const showQuiz = filterValue === "all" || filterValue === "anime";
            quizSection.classList.toggle("hidden", !showQuiz);
        }

        document.querySelectorAll(".archive-item").forEach(item => {
            const visible = filterValue === "all" || item.getAttribute("data-category") === filterValue;
            item.style.display = visible ? "flex" : "none";
        });
    }

    function setupFilters() {
        document.querySelectorAll(".filter-btn[data-filter]").forEach(button => {
            button.addEventListener("click", () => applyFilter(button.getAttribute("data-filter")));
        });
    }

    // ==========================================
    // 4. QUIZ
    // ==========================================
    const quizData = [
        { q: "Quem se tornou o herói número 1 após a aposentadoria do All Might em My Hero Academia?", o: ["Bakugo", "Endeavor", "Midoriya", "Todoroki"], a: 1 },
        { q: "Qual é o nome da técnica assinatura de Gon Freecss em Hunter x Hunter?", o: ["Rasengan", "Jajanken", "Chidori", "Getsuga Tenshou"], a: 1 },
        { q: "No anime Orange, de onde vêm as cartas que Naho recebe?", o: ["De um admirador secreto", "Do seu eu do futuro", "De um universo paralelo", "De um irmão desaparecido"], a: 1 },
        { q: "Qual era a profissão de Harleen Quinzel antes de se tornar a Harley Quinn?", o: ["Detetive", "Psiquiatra", "Advogada", "Jornalista"], a: 1 },
        { q: "Quem é Jon Kent nos quadrinhos da DC?", o: ["Filho do Batman", "Filho do Superman e da Lois Lane", "Irmão do Flash", "Sobrinho do Aquaman"], a: 1 },
        { q: "Que tipo de ser é a Frieren em Sousou no Frieren?", o: ["Humana", "Anã", "Elfa", "Demónia"], a: 2 },
        { q: "Como se chama o detetive rival de Light Yagami em Death Note?", o: ["L", "Near", "Mello", "Ryuk"], a: 0 },
        { q: "Qual Besta com Caudas está selada dentro de Naruto Uzumaki?", o: ["Shukaku", "Kurama", "Matatabi", "Isobu"], a: 1 },
        { q: "Qual é o nome verdadeiro do Superman em Krypton?", o: ["Jor-El", "General Zod", "Kal-El", "Brainiac"], a: 2 },
        { q: "Como se chama o planeta natal de Goku em Dragon Ball?", o: ["Terra", "Namekusei", "Planeta Vegeta", "Planeta Kanassa"], a: 2 }
    ];

    let questions = [];
    let currentQuestion = 0;
    let score = 0;
    let answered = false;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startQuiz() {
        questions = shuffle([...quizData]);
        currentQuestion = 0;
        score = 0;
        loadQuiz();
    }

    function loadQuiz() {
        const titleEl = document.getElementById("quiz-question");
        const optionsContainer = document.getElementById("quiz-options");
        if (!titleEl || !optionsContainer) return;

        answered = false;
        optionsContainer.innerHTML = "";

        if (currentQuestion < questions.length) {
            const current = questions[currentQuestion];
            titleEl.textContent = `Pergunta ${currentQuestion + 1}/${questions.length}: ${current.q}`;

            const options = shuffle(current.o.map((text, i) => ({ text, correct: i === current.a })));

            options.forEach(option => {
                const btn = document.createElement("button");
                btn.classList.add("quiz-opt-btn");
                btn.textContent = option.text;
                btn.dataset.correct = option.correct ? "true" : "false";
                btn.addEventListener("click", () => selectQuizAnswer(btn));
                optionsContainer.appendChild(btn);
            });
        } else {
            titleEl.textContent = `Quiz Concluído! Pontuação Final: ${score}/${questions.length}`;
            const restartBtn = document.createElement("button");
            restartBtn.classList.add("filter-btn");
            restartBtn.style.marginTop = "1rem";
            restartBtn.textContent = "Reiniciar Quiz";
            restartBtn.addEventListener("click", startQuiz);
            optionsContainer.appendChild(restartBtn);
        }
    }

    function selectQuizAnswer(clickedBtn) {
        if (answered) return;
        answered = true;

        const isCorrect = clickedBtn.dataset.correct === "true";

        document.querySelectorAll(".quiz-opt-btn").forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === "true") btn.classList.add("correct");
        });

        if (isCorrect) {
            score++;
        } else {
            clickedBtn.classList.add("wrong");
        }

        setTimeout(() => {
            currentQuestion++;
            loadQuiz();
        }, 1200);
    }

    // ==========================================
    // 5. TERMINAL INTERATIVO
    // ==========================================
    const terminalBody = document.getElementById("terminal");
    const terminalHistory = document.getElementById("terminal-history");
    const terminalInput = document.getElementById("terminal-input");

    function scrollTerminal() {
        if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
    }

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
            scrollTerminal();
            return;
        }

        switch (cmd) {
            case "help":
                output += "Comandos disponíveis:\n" +
                          "  about       - Breve resumo sobre o criador\n" +
                          "  whoami      - Quem é o utilizador deste terminal\n" +
                          "  projects    - Lista os teus repositórios do GitHub\n" +
                          "  contact     - Exibe as informações de contacto direto\n" +
                          "  theme-green - Altera o tom do layout para verde neon\n" +
                          "  theme-pink  - Altera o tom do layout para rosa neon\n" +
                          "  theme-blue  - Restaura o tema azul original do site\n" +
                          "  clear       - Limpa o histórico de comandos da consola";
                break;
            case "about":
                output += "Eu sou o Luda, desenvolvedor baseado em São Tomé e Príncipe. Focado em JavaScript, automações e apaixonado por HQs, animes e thrillers psicológicos.";
                break;
            case "whoami":
                output += "luda — Desenvolvedor Frontend & Entusiasta de Cultura Pop";
                break;
            case "projects":
                if (loadedRepos.length === 0) {
                    output += "Nenhum projeto do GitHub carregado ainda.";
                } else {
                    output += "Projetos no GitHub:\n" + loadedRepos
                        .map(repo => `  - ${repo.name}${repo.language ? " (" + repo.language + ")" : ""}`)
                        .join("\n");
                }
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
        scrollTerminal();
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================
    setupFilters();
    startQuiz();
    fetchGitHubProjects();
});