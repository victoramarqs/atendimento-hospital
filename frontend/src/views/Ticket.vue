<template>
  <div id="container">
    <div class="container-titulo">
      <h1 class="titulo">Selecione o seu tipo de atendimento:</h1>
    </div>

    <div class="container-botoes">
      <div>
        <button class="botao-atendimento" @click="register('Normal')">
          Normal
        </button>
      </div>
      <div>
        <button class="botao-atendimento" @click="register('Preferencial')">
          Preferencial
        </button>
      </div>
      <div>
        <button
          class="botao-atendimento"
          @click="register('Preferencial Especial')"
        >
          Prioritário (maior de 80 anos)
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  methods: {
    register(priority) {
      axios
        .post('http://localhost:3000/api/tickets', {
          priority,
        })
        .then((res) => {
          const data = res.data.data.ticket;
          alert(`${data.number} ${data.priority}`);
        })
        .catch((err) => {
          const msgErro = err.response.data.err;
          console.log(msgErro);
        });
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&family=Poppins:wght@300;600;800&display=swap');

html {
  background-color: #e8e8e8;
}

#container {
  margin-top: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.titulo {
  text-align: center;
  font-family: Poppins;
  font-size: 40px;
  text-transform: uppercase;
}

.container-botoes {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-items: center;
}

.botao-atendimento {
  text-decoration: none;
  border: none;
  display: inline-block;
  padding: 15px 32px;
  width: 600px;
  background-color: #005bab;
  border-radius: 5px;
  font-family: Poppins;
  font-weight: 600;
  color: white;
  font-size: 20px;
  text-transform: uppercase;
  margin-top: 20px;
}
</style>
