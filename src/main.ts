import { openai } from "./openai";

const form = document.querySelector('#generate-form') as HTMLFormElement;
const iframe = document.querySelector('#generated-code') as HTMLIFrameElement;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const prompt = formData.get('prompt');

  /* Without Stream */
  /* const chatCompletion = await openai.chat.completions.create({
    messages: [{role: "system", content: 
    `Tu crées des sites web avec Tailwindcss. Ta tâche est de généré du code html avec tailwind en fonction du prompt de l'utilisateur. 
    Pour cela, utilise un design système comme material design pour créer de beaux sites cohérent.
    Tu renvoi uniquement du HTML sans aucun texte avant ou après.
    Tu renvoi du HTML valide.
    Tu n'ajoutes jamais de syntaxe Markdown.`
  },{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  }); 
    const code = chatCompletion.choices[0].message.content;

    if(!code){
      alert("Aucun code généré !");
      return;
    }

    iframe.srcdoc = `
  <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Next-AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${code}
      </body>
    </html>
`;
  */

  /* With Stream */
  const response = await openai.chat.completions.create({
    messages: [{role: "system", content: 
    `Tu crées des sites web avec Tailwindcss. Ta tâche est de généré du code html avec tailwind en fonction du prompt de l'utilisateur. 
    Pour cela, utilise un design système comme material design pour créer de beaux sites cohérent.
    Tu renvoi uniquement du HTML sans aucun texte avant ou après.
    Tu renvoi du HTML valide.
    Tu n'ajoutes jamais de syntaxe Markdown.`
  },{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
    stream: true
  });

  let code = "";
  const onNewChunk = createTimedUpdateIFrame();

  for await (const message of response) {
    const isDone = message.choices[0].finish_reason === 'stop';
    const token = message.choices[0].delta.content;
    if (token !== "code" && token !== "undefined" && !isDone) {
      code += token;
    }
    onNewChunk(code);
  }
});

const createTimedUpdateIFrame = () => {
  let date = new Date(); 
  let timeout: any = null;

  return (code: string) => {
    if(new Date().getTime() - date.getTime() > 1000) {
      updateIframe(code);
      date = new Date();
    }

    if(timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      updateIframe(code)
    }, 1000);
  };
};

const updateIframe = (code: string) => {
  iframe.srcdoc = 
  `
  <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Next-AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${code}
      </body>
    </html>
  `;
}


