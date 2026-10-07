document.addEventListener("DOMContentLoaded", () => {
    
    // Configuração do GitHub - Substitua 'ludafcull' pelo nome correto de utilizador se necessário
    const GITHUB_USERNAME = "ludafcull"; 

    // --- 1. PROCURAR REPOSITÓRIOS DO GITHUB DYNAMICAMENTE ---
    async function fetchGitHubProjects() {
        const gridContainer = document.querySelector(".archive-grid");
        
        try {
            const response = await fetch(`https://github.com{GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
            
            if (!response.ok) throw new Error("Erro ao carregar repositórios");
            
            const repos = await response.json();

            // Filtrar e remover os itens estáticos antigos de desenvolvimento antes de inserir os reais
            const staticDevItems = gridContainer.querySelectorAll('.archive-item[data-category="dev"]');
            staticDevItems.forEach(item => item.remove());

            // Renderizar cada repositório retornado pela API
            repos.forEach(repo => {
                // Ignorar forks para mostrar apenas projetos originais (opcional)
                if (repo.fork) return; 

                const projectCard = document.createElement("div");
                projectCard.classList.add("archive-item");
                projectCard.setAttribute("data-category", "dev");

                // Captura a linguagem principal do projeto ou define como código geral
                const language = repo.language ? repo.language : "Código";

                projectCard.innerHTML = `
                    <span class="tag">${language} // GitHub</span>
                    <h3>${repo.name}</h3>
                    <p>${repo.description || "Sem descrição disponível no momento. Projeto em desenvolvimento ativo."}</p>
                    <a href="${repo.html_url}" target="_blank" class="project-link">Ver Código Fonte ↗</a>
                `;

                gridContainer.appendChild(projectCard);
            });

        } catch (error) {
            console.error("Erro na API do GitHub:", error);
            // Fallback caso a API falhe ou atinja o limite de requisições
            const errorNotice = document.querySelector('.archive-item[data-category="dev"] p');
            if (errorNotice) errorNotice.textContent = "Não foi possível carregar os projetos do GitHub no momento.";
        }
    }

    // --- 2. SISTEMA DE FILTROS ---
    const filterButtons = document.querySelectorAll(".filter-btn");

    function setupFilters() {
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                filterButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");

                const filterValue = button.getAttribute("data-filter");
                const archiveItems = document.querySelectorAll(".archive-grid .archive-item");

                archiveItems.forEach(item => {
                    if (filterValue === "all" || item.getAttribute("data-category") === filterValue) {
                        item.style.display = "block";
                    } else {
                        item.style.display = "none";
                    }
                });
            });
        });
    }

    // --- 3. ANIMAÇÃO DE DIGITAÇÃO DO TERMINAL ---
    const commandText = `curl -s https://github.com{GITHUB_USERNAME}`;
    const outputContent = `
{
  "login": "${GITHUB_USERNAME}",
  "type": "User",
  "public_repos": 3,
  "status": "online",
  "blog": "https://github.io"
}
    `;
    
    const typedCommandElement = document.getElementById("typed-command");
    const outputElement = document.getElementById("terminal-output");
    let index = 0;

    function typeCommand() {
        if (index < commandText.length) {
            typedCommandElement.textContent += commandText.charAt(index);
            index++;
            setTimeout(typeCommand, 80); 
        } else {
            setTimeout(() => {
                outputElement.textContent = outputContent;
                outputElement.classList.remove("hidden");
            }, 500);
        }
    }

    // --- INICIALIZAÇÃO ---
    // Executa a procura da API e configura os filtros ao carregar a página
    fetchGitHubProjects().then(() => {
        setupFilters(); // Configura os filtros após os novos elementos existirem no DOM
    });
    
    setTimeout(typeCommand, 1000);
});
