<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Matheus Teixeira - Desenvolvedor</title>
    <link rel="stylesheet" href="style.css">
    <script>
        function submitForm(event) {
            event.preventDefault();
            alert('Formulário enviado!');
        }
    </script>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Sobre mim</a></li>
                <li><a href="#">Habilidades</a></li>
                <li><a href="#">Contato</a></li>
                <li><a href="pages/memories/mtg.html">MTG</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="intro">
            <h1>Olá! Eu sou Matheus Teixeira</h1>
            <p>Sou um desenvolvedor apaixonado por criar soluções eficazes para problemas complexos.</p>
        </section>

        <section class="skills">
            <h2>Habilidades</h2>
            <p>HTML, CSS, JavaScript, Python, Django...</p>
        </section>

        <section class="contact">
            <h2>Contato</h2>
            <form id="contact-form" onsubmit="submitForm(event)">
                <input type="text" name="name" placeholder="Seu nome" required />
                <input type="email" name="email" placeholder="Seu email" required />
                <textarea name="message" placeholder="Sua mensagem" required></textarea>
                <button type="submit">Enviar</button>
            </form>
        </section>
    </main>
</body>
</html>

