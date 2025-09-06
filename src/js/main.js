document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formContato").addEventListener("submit", async function (e) {
        e.preventDefault();

        const button = document.getElementById("btn-enviar")
        const buttonOldValue = button.innerHTML
        const nome = document.getElementById("nome").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const email = document.getElementById("email").value.trim();
        const mensagem = document.getElementById("mensagem").value.trim();

        // Validação
        if (!nome || !telefone || !email || !mensagem) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        // Validação de email simples
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Por favor, insira um email válido.");
            return;
        }

        const data = { nome, telefone, email, mensagem };

        try {
            button.innerHTML = "Enviando..."
            button.disabled = true
            const res = await fetch("https://formspree.io/f/xkgvknk", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert("Recebemos sua mensagem com sucesso! Entraremos em contato em breve");
                e.target.reset();
                button.innerHTML = buttonOldValue
                button.disabled = false
            } else {
                alert("Erro ao enviar. Tente novamente.");
                button.innerHTML = buttonOldValue
                button.disabled = false
            }
        } catch (err) {
            alert("Falha de conexão.");
            button.innerHTML = buttonOldValue
            button.disabled = false
        }
    });
});
