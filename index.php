<!DOCTYPE html>
<html>
<head>
    <title>Matheus Teixeira - Desenvolvedor</title>
    <style>
        body {
            background-color: #000b76;
            font-family: 'Courier New', Courier, monospace;
            color: #FFFFFF;
        }

        h1, h2 {
            text-align: center;
            color: #FFD700;
        }

        marquee {
            color: #FF0000;
            font-size: 1.2em;
        }

        #skills {
            font-size: 1em;
            text-align: center;
            color: #FFFFFF;
        }

        #contact-form input, textarea {
            display: block;
            margin: 10px auto;
            padding: 10px;
            border: 1px solid #FFFFFF;
            background-color: #000b76;
            color: #FFFFFF;
        }

        #contact-form button {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #FFD700;
            border: none;
            color: #000;
            cursor: pointer;
        }

        #contact-form button:hover {
            background-color: #FFA500;
        }

        #menu {
            background-color: #FFFFFF;
            text-align: center;
            margin-bottom: 20px;
            padding: 10px;
            border: 2px solid #000;
        }

        #menu ul {
            list-style-type: none;
            padding: 0;
        }

        #menu li {
            display: inline;
            margin-right: 10px;
        }

        #menu a {
            color: #000b76;
            text-decoration: none;
        }

        #menu a:hover {
            color: #FFD700;
            text-decoration: underline;
        }

    </style>
    <script>
        function submitForm(event) {
            event.preventDefault();
            alert("Formulário enviado!");
        }
    </script>
</head>

<body>
    <div id="menu">
        <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Sobre mim</a></li>
            <li><a href="#">Habilidades</a></li>
            <li><a href="#">Contato</a></li>
            <li><a href="pages/memories/mtg.html">MTG</a></li>
        </ul>
    </div>

    <h1>Olá! Eu sou Matheus Teixeira</h1>
    <marquee>Bem-vindo ao meu website pessoal!</marquee>
    <h2>Eu</h2>
    <p class="about-me">
        Sou um desenvolvedor apaixonado por criar soluções eficazes para problemas complexos...
    </p>

    <h2>Habilidades</h2>
    <p id="skills">
        HTML, CSS, JavaScript, Python, Django...
    </p>

    <h2>Contato</h2>
    <form id="contact-form" onsubmit="submitForm(event)">
        <input type="text" name="name" placeholder="Seu nome" required />
        <input type="email" name="email" placeholder="Seu email" required />
        <textarea name="message" placeholder="Sua mensagem" required></textarea>
        <button type="submit">Enviar</button>
    </form>
</body>
</html>
