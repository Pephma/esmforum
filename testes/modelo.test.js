const bd = require('../bd/bd_utils.js');
const modelo = require('../modelo.js');

beforeEach(() => {
  bd.reconfig('./bd/esmforum-teste.db');
  // limpa dados de todas as tabelas
  bd.exec('delete from perguntas', []);
  bd.exec('delete from respostas', []);
});

test('Testando banco de dados vazio', () => {
  expect(modelo.listar_perguntas().length).toBe(0);
});

test('Testando cadastro de três perguntas', () => {
  modelo.cadastrar_pergunta('1 + 1 = ?');
  modelo.cadastrar_pergunta('2 + 2 = ?');
  modelo.cadastrar_pergunta('3 + 3 = ?');
  const perguntas = modelo.listar_perguntas(); 
  expect(perguntas.length).toBe(3);
  expect(perguntas[0].texto).toBe('1 + 1 = ?');
  expect(perguntas[1].texto).toBe('2 + 2 = ?');
  expect(perguntas[2].num_respostas).toBe(0);
  expect(perguntas[1].id_pergunta).toBe(perguntas[2].id_pergunta-1);
});

test('Should get question by registered id', () => {
  const questionText = '1 + 1 = ?';
  modelo.cadastrar_pergunta(questionText);
  
  const perguntas = modelo.listar_perguntas();
  const id_pergunta = perguntas[0].id_pergunta;
  
  const pergunta = modelo.get_pergunta(id_pergunta);
  expect(pergunta).toMatchObject({ texto: questionText });
});

test('Should add and list three answers for a question', () => {
  const id_pergunta = modelo.cadastrar_pergunta('1 + 1 = ?');
  const answerTexts = ['2', 'numero par', 'metade de 4'];
  answerTexts.forEach(text => modelo.cadastrar_resposta(id_pergunta, text));
  
  const respostas = modelo.get_respostas(id_pergunta);
  expect(respostas.length).toBe(3);
  respostas.forEach((resposta, index) => {
    expect(resposta.texto).toBe(answerTexts[index]);
    expect(resposta.id_pergunta).toBe(id_pergunta);
  });
});

test('Should maintain data integrity after multiple operations', () => {
  const id_pergunta1 = modelo.cadastrar_pergunta('1 + 1 = ?');
  const id_pergunta2 = modelo.cadastrar_pergunta('2 + 2 = ?');
  
  modelo.cadastrar_resposta(id_pergunta1, '2');
  modelo.cadastrar_resposta(id_pergunta1, 'numero par');
  
  modelo.cadastrar_resposta(id_pergunta2, '4');
  
  const perguntas = modelo.listar_perguntas();
  expect(perguntas.length).toBe(2);
  
  const respostas1 = modelo.get_respostas(id_pergunta1);
  const respostas2 = modelo.get_respostas(id_pergunta2);
  
  expect(respostas1.length).toBe(2);
  expect(respostas2.length).toBe(1);
  
  expect(respostas1[0].texto).toBe('2');
  expect(respostas1[1].texto).toBe('numero par');
  expect(respostas2[0].texto).toBe('4');
});
