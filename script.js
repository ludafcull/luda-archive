document.addEventListener("DOMContentLoaded", () => {
    
    // --- SISTEMA DE FILTROS ---
    const filterButtons = document.querySelectorAll(".filter-btn");
    const archiveItems = document.querySelectorAll(".archive-item");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove classe ativa de todos e adiciona no clicado
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");

            archiveItems.forEach(item => {
                if (filterValue === "all" || item.getAttribute("data-category") === filterValue) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });

    // --- ANIMAÇÃO DE DIGITAÇÃO DO TERMINAL ---
    const commandText = "ls -la projetos/ativos";
    const outputContent = `
total 3
drwxr-xr-x  luda  staff   102B Oct  7 23:42 .
drwxr-xr-x  luda  staff   512B Oct  7 23:42 luda-bot-active/
drwxr-xr-x  luda  staff   256B Oct  7 23:42 character-quiz-game/
    `;
    
    const typedCommandElement = document.getElementById("typed-command");
    const outputElement = document.getElementById("terminal-output");
    
    let index = 0;

    function typeCommand() {
        if (index < commandText.length) {
            typedCommandElement.textContent += commandText.charAt(index);
            index++;
            setTimeout(typeCommand, 100); // Velocidade da digitação
        } else {
            // Quando terminar de digitar, exibe o resultado do comando
            setTimeout(() => {
                outputElement.textContent = outputContent;
                outputElement.classList.remove("hidden");
            }, 500);
        }
    }

    // Inicia a animação após 1 segundo que a página carregou
    setTimeout(typeCommand, 1000);
});
