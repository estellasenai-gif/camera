
# CaptureID — Câmera Inteligente

## Integrantes

- Integrante: [Estella de Almeida]

## Descrição do projeto

O CaptureID é uma aplicação web desenvolvida para realizar capturas
fotográficas utilizando a câmera do dispositivo do usuário.

A aplicação permite visualizar o vídeo em tempo real, capturar
fotografias, aplicar efeitos visuais e incorporar uma identificação
textual, a data e a hora diretamente na imagem final.

Todo o processamento da fotografia ocorre no navegador, utilizando
recursos nativos da plataforma web.

## Funcionalidades

- Acesso à câmera mediante autorização do usuário.
- Visualização da câmera em tempo real.
- Captura de fotografias.
- Aplicação de efeitos visuais.
- Identificação personalizada sobre a imagem.
- Registro automático de data e hora.
- Visualização da fotografia processada.
- Download da imagem em formato PNG.
- Controle para ligar e desligar a câmera.
- Tratamento de erros de permissão e indisponibilidade do dispositivo.

## Tecnologias utilizadas

- HTML5: estrutura da aplicação.
- CSS3: estilização e responsividade da interface.
- JavaScript: lógica e interação com os elementos da página.
- MediaDevices API: acesso à câmera por meio de getUserMedia().
- Canvas API: processamento da fotografia e composição das informações.
- DOM: manipulação dos elementos da interface.
- Eventos JavaScript: controle dos botões e das ações do usuário.

## Como executar

1. Baixe ou clone o repositório.
2. Abra a pasta do projeto no Visual Studio Code.
3. Execute a página usando a extensão Live Server ou outro servidor
   local compatível.
4. Abra o endereço local disponibilizado pelo servidor.
5. Clique em "Ligar câmera".
6. Autorize o acesso à câmera no navegador.
7. Informe a identificação, escolha o efeito e capture a fotografia.
8. Visualize e baixe a imagem processada.

Observação: o acesso à câmera exige um contexto seguro, como localhost
ou HTTPS, e a autorização do usuário.

## Processamento da imagem

A fotografia é desenhada no Canvas a partir do vídeo da câmera.
Um filtro visual é aplicado, e a identificação, a data e a hora
são desenhadas sobre a própria imagem.

O resultado é convertido para PNG, permitindo sua visualização e
seu download.

## Controle da câmera

Ao desligar a câmera, a aplicação interrompe todas as faixas do stream
com o método stop() e desvincula o vídeo do recurso.

## Repositório

[https://github.com/estellasenai-gif/camera.git]