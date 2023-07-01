var codeElement = document.getElementById('code');
var responseElement = document.getElementById('response');
var resultElement = document.getElementById('result'); // Aqui buscamos o elemento 'result'


var text = [
    '',
    ' Mano,',
    '',
    ' Desde que nossos caminhos se cruzaram, minha vida se tornou infinitamente mais rica. Você se tornou meu melhor amigo, meu parceiro de vida, a ancora que mantém o meu navio firme em meio as tempestades da vida.',
    '',
    ' Passamos por inúmeras aventuras juntas, cada uma delas fortalecendo nossa amizade, nossa parceria, e cada riso incontrolável e desafio enfrentado ao seu lado apenas solidificou a certeza de uma verdade.',
    '',
    ' Não há mais ninguém no mundo com quem eu prefira passar cada dia.',
    '',
    ' A alegria imensa que você traz à minha vida é palpável, e parafraseando a música Entre Laços da banda Zimbra,',
    '',
    ' <span style="color: red;">"Estranho é pensar em mim mesmo sem te incluir"</span>.',
    '',
    ' Estou empolgado com as possibilidades do nosso futuro e todas as aventuras que ainda temos pela frente.',
    '',
    ' Como diz Beth Carvalho: "Por onde for, quero ser seu par."',
    '',
    ' Seja em Nova Iguaçu ou São Paulo, uma vez por mês em cada estado do Brasil, em Portugal, no Canadá, ou em qualquer lugar do mundo - Eu quero estar ao seu lado.',
    '',
    ' Quero ser seu par. Quero continuar essa jornada com você.',
    '',
    'const resposta = Gabriel.aceitaSerMeuNamorado(); // (s/n)'
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
        if (this.value.toLowerCase() === 's') {
            resultElement.textContent = 'Uau! Isso é maravilhoso, Gabriel! Prometo dedicar cada dia para trazer alegria e amor à sua vida. Você é incrivelmente especial para mim. Te amo mais do que palavras ou código poderiam expressar. <3';
        } else if (this.value.toLowerCase() === 'n') {
            resultElement.textContent = 'Entendo... Respeito completamente a sua decisão, Gabriel. Quero que saiba que eu valorizo cada momento que compartilhamos juntos. Você sempre terá um lugar especial em meu coração. Te amo!';
        } else {
            resultElement.textContent = 'Não entendi o que você quis dizer, Gabriel. Por favor, responda com "s" ou "n".';
        }
    }
});

