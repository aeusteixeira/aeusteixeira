var codeElement = document.getElementById('code');
var responseElement = document.getElementById('response');
var resultElement = document.getElementById('result'); // Aqui buscamos o elemento 'result'


var text = [
    '',
    'Mano,',
    '',
    'Desde que nossos caminhos se cruzaram, minha existência ganhou um novo significado. Você se tornou meu melhor amigo, meu companheiro de aventuras, o âncora que mantém meu barco estável em meio às tempestades do oceano.',
    '',
    'Passamos por incontáveis quests juntos, cada uma fortalecendo nossa amizade, nossa parceria, e cada riso incontrolável e desafio vencido ao seu lado apenas solidificou a certeza de uma verdade.',
    '',
    'Não há mais ninguém no mundo com quem eu prefira passar cada dia.',
    '',
    'A alegria imensa que você traz ao meu cotidiano é palpável, e parafraseando a música Entre Laços da banda Zimbra,',
    '',
    '"Estranho é pensar em mim mesmo, sem te incluir."',
    '',
    'Estou empolgado com as novas fases que nosso futuro reserva e todas as missões que ainda temos pela frente.',
    '',
    'Tem também uma música da Beth Carvalho que diz: "Por onde for, quero ser seu par."',
    '',
    'Seja aqui em Nova Iguaçu, São Paulo, uma vez por mês em cada estado do Brasil, em Portugal, no Canadá, ou em qualquer lugar do mundo',
    '',
    'Quero ser seu par.',
    'Eu quero estar ao seu lado.',
    'Quero continuar essa jornada com você.',
    '',
    'Eu quero ser seu player 2.',
    '',
    'Mas para que a lógica do nosso código funcione, preciso saber se você aceita ser meu player 1.',
    '',
    'Preciso saber qual é o valor que você atribui à variável "resposta".',
    'const resposta = Gabriel.aceitaSerMeuPlayer1(); // (sim/não)',
];


var line = 0;
var character = 0;
var tagBuffer = '';
var inTag = false;

function typeCharacter() {
    if (line < text.length) {
        if (character < text[line].length) {
            if (text[line][character] === '<') {
                inTag = true;
            }

            if (inTag) {
                tagBuffer += text[line][character];
                if (text[line][character] === '>') {
                    inTag = false;
                    codeElement.innerHTML += tagBuffer;
                    tagBuffer = '';
                }
            } else {
                codeElement.textContent += text[line][character];
            }

            character++;
            setTimeout(typeCharacter, 25); // Speed of a single character
        } else {
            codeElement.textContent += '\n'; // New line
            line++;
            character = 0;
            setTimeout(typeCharacter, 1000); // Speed of a new line
        }
    } else {
        responseElement.classList.remove('hidden');
        responseElement.focus();
    }
}

typeCharacter();

responseElement.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        if (this.value.toLowerCase() === 'sim') {
            resultElement.textContent = 'Uau! Isso é maravilhoso, Gabriel! Prometo dedicar cada dia para trazer alegria e amor à sua vida. Você é incrivelmente especial para mim. Te amo mais do que palavras ou código poderiam expressar. <3';
        } else if (this.value.toLowerCase() === 'não') {
            resultElement.textContent = 'Entendo... Respeito completamente a sua decisão, Gabriel. Quero que saiba que eu valorizo cada momento que compartilhamos juntos. Você sempre terá um lugar especial em meu coração. Te amo!';
        } else {
            resultElement.textContent = 'Não entendi o que você quis dizer, Gabriel. Por favor, responda com "s" ou "n".';
        }
    }
});

