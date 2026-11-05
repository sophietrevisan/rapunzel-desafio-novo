document.getElementById("hairButton").addEventListener("click", function() {
    const hair = document.getElementById("hair");
    const message = document.getElementById("message");

    if (hair.classList.contains("hidden")) {
        // Mostra o cabelo
        hair.classList.remove("hidden");
        message.textContent = "As tranças douradas foram jogadas pela janela!";
        this.textContent = "Subir na torre";
    } else {
        // Esconde o cabelo
        hair.classList.add("hidden");
        message.textContent = "Rapunzel, Rapunzel, jogue suas tranças!";
        this.textContent = "Chamar Rapunzel";
    }
});
