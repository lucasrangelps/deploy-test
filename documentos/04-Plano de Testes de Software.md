# Planos de Testes de Software

Apresenta os casos de testes utilizados na realização da verificação e validação da aplicação. 

### Tipo de Teste
- **Sucesso**: Tem o objetivo de verificar se as funcionalidades funcionam corretamente.

#### Registro de Caso de Teste de Sucesso


<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - S<br>Agendar Aula Experimental</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário pode agendar aula experimental e fazer a anamnese.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Agendar aula experimental e realizar anamnese com o cliente.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Página inicial do site.<br> 
      2. Preencher anamnese.<br> 
      3. Clicar no botão Agendar Aula Experimental.<br> 
      4. Selecionar o tipo de Aula.<br> 
      5. Preencher a data e Salvar.<br>        
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se a data escolhida é no mesmo dia ou outra data.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve redirecionar registrar o agendamento da aula após o preenchimento dos dados.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-002 - S<br>Dashboard</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se o dashboard mostra a agenda dos professores.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-002: Exibir agendamentos no dashboard (agenda do dia ou semana dos professores).</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login no site.<br> 
      2. Clicar na opção Dashboard.<br> 
      3. Clicar no botão Agendar Aula Experimental.<br> 
      4. Mostra agenda de aulas da semana.<br>       
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se o dashboard mostra a agenda do professor.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve mostrar a agenda semanal de aulas do professor com horário e o tipo de aula.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-003 - S<br>Pesquisar alunos</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se a pesquisa retorna o aluno.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-003: Permitir busca de alunos.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Selecionar a opção Alunos.<br>
      3. Clicar no campo de pesquisa Buscar Alunos.<br>       
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se a pesquisa retorna o aluno da busca.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve retornar o aluno da pesquisa. </td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-004 - S<br>Cadastro de alunos</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica o sistema conclui o cadastro de aluno. </td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-004: Permitir cadastro de alunos.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br>
      2. Selecionar a opção Alunos.<br>
      3. Clicar em Novo Registro.<br> 
      4. Preencher os dados com as informações pessoais.<br> 
      5. Preencher anamnese.<br> 
      6. Clicar em salvar.<br>        
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se o aluno consegue efetivar o cadastro no sistema.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve cadastrar os dados do aluno.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-005 - S<br>Incluir alunos nas aulas particulares ou turmas</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a inclusão de alunos nas aulas particulares ou turmas.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-005: Matricular alunos em aulas particulares ou turmas.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br>
      2. Selecionar a opção Aulas.<br> 
      3. Selecionar a turma ou selecionar o horário para aula particular.<br>        
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar a efetivação da inclusão de um aluno na turma ou aula particular.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema incluir o aluno na turma ou no horário da aula particular.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-006 - S<br>Vincular aluno ao ritmo escolhido</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a inclusão de alunos a um tipo de dança escolhido pelo aluno.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-006: Vincular aluno ao ritmo escolhido</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Selecionar a opção Aulas.<br> 
      3. Selecionar a turma.<br> 
      4. Incluir aluno e Salvar.<br>             
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar a efetivação da inclusão de um aluno no tipo de dança escolhido.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve incluir o aluno no ritmo escolhido.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-007 - S<br>Permitir acesso do aluno à área pessoal</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica o acesso do aluno a sua área pessoal. </td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-007: Permitir acesso do aluno à área pessoal</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Selecionar a opção Aulas.<br> 
      3. Consulta os dados pessoais do aluno.<br>            
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Consulta o perfil do aluno cadastrado no sistema.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve mostrar o perfil do aluno.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-008 - S<br>Gerenciar turmas</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica o gerenciamento das turmas pelo administrador.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-008: Administrador gerenciar turmas de dança</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Selecionar a opção Aulas.<br> 
      3. Selecionar a turma.<br> 
      4. Incluir aluno e Salvar.<br>             
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar a gestão de um aluno nas turmas.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve fazer a gestão do aluno nas turmas. </td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-009 - S<br>Gerenciar aula particular</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a inclusão de alunos a um tipo de dança.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-009: Administrador gerenciar aulas particulares</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Selecionar a opção Aulas.<br> 
      3. Selecionar o horário da aula.<br> 
      4. Incluir aluno e Salvar.<br>             
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar a efetivação da inclusão de um aluno nem um horário disponível para aula particular.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve incluir o aluno em uma aula particular.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-010 - S<br>Controle de pagamentos dos alunos</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a efetivação do pagamento do aluno.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-010: Controle de pagamentos dos alunos</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Selecionar Relatórios.<br> 
      3. Selecionar Gestão de Alunos.<br> 
      4. Verifica status do pagamento.<br>             
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar a efetivação do pagamento das mensalidades<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve mostrar o status do pagamento dos alunos.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-011 - S<br>Registro de pagamentos via PIX</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a efetivação do pix.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-011: Registrar pagamentos via PIX (MP)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login. <br> 
      2. Escolher o plano de dança.<br> 
      3. Selecionar o método de pagamento via pix. <br>
      4. Conferir se o pagamento foi efetivado.<br>            
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar a efetivação do pagamento das mensalidades<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve mostrar o status do pagamento através do pix.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-012 - S<br>Registro Plano de Pagamentos Mensal</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a efetivação do pagamento mensal.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-012: Implementar planos de pagamento mensal</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Opção Auluno.<br> 
      3. Selecionar o tipo de pagamento mensal.<br>            
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se o tipo de mensalidade foi selecionado<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema selecionar o tipo de mensalidade escolhida pelo aluno.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-013 - S<br>Registro Plano de Pagamentos Trimestral</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a efetivação do pagamento trimestral.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-013: Implementar plano trimestral com 5% de desconto</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Selecionar a opção Auluno.<br> 
      3. Selecionar o tipo de plano trimestral.<br>          
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se o tipo de mensalidade foi selecionado.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema selecionar o tipo de mensalidade escolhida pelo aluno. </td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-014 - S<br>Registro Plano de Pagamentos Recorrente</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a efetivação do pagamento.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-014: Implementar modelo de pagamento recorrente</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Opção aluno.<br> 
      3. Selecionar o tipo de plano.<br> 
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se o tipo de mensalidade foi selecionado.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema selecionar o tipo de mensalidade escolhida pelo aluno.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-015 - S<br>Registro de Pagamentos das Parcelas</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a confirmação do pagamento.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-015: Registrar parcelas pagas</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br>
      2. Opção aluno.<br>
      3. Selecionar o aluno.<br> 
      4. Selecionar financeiro para confirmar o pagamento.<br>        
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se a parcela foi efetivada.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve alterar o status da parcela em aberto para pago.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-016 - S<br>Alteração de Pagamento</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a alteração do tipo de pagamento da mensalidade.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-016: Aluno alterar forma de pagamento.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Opção aluno. <br>
      3. Selecionar o aluno. <br> 
      4. Selecionar financeiro. <br>
      5. Alterar a forma de pagamento e Salvar. <br>       
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se a parcela foi alterada.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve alterar o tipo de pagamento do aluno.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-017 - S<br>Registro de Pagamentos das Parcelas</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a confirmação do pagamento. </td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-017: Aluno visualizar plano e parcelas pagas</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br> 
      2. Opção aluno.<br> 
      3. Selecionar o aluno.<br> 
      4. Selecionar financeiro.<br> 
      5. Visualizar as mensalidades pagas, em aberto ou em atraso.<br>        
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar o status das mensalidades.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve alterar o status da parcela em aberto para pago. </td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-018 - S<br>Notificação Renovação Plano</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a efetivação de notificações.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-018: Enviar aviso de renovação do plano trimestral</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Sistema dispara a notificação.<br>
      2. Confere se o aluno recebeu o e-mail.<br>       
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se as notificações foram enviadas.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve notificação e o aluno receber o e-mail para renovar o plano. </td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-019 - S<br>Notificação Parcela em Atraso</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a efetivação de notificações.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-019: Enviar mensagens automáticas após pagamento ou atraso.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Sistema dispara a notificação.<br>
      2. Confere se o aluno recebeu o e-mail.<br>       
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se as notificações foram enviadas.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve notificação e o aluno receber o e-mail das mensalidades em atraso.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-020 - S<br>Notificação Agendamento Aula</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a efetivação de notificações.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-020: Confirmar presença na aula via mensagem</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Sistema dispara a notificação.<br>
      2. Confere se o aluno recebeu a mensagem.<br>       
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se as notificações foram enviadas.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve enviar notificação do agendamento da aula.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-021 - S<br>Notificação Agendamento Aula</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica a efetivação de notificações.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-021: Integração com WhatsApp para envio de notificações</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Sistema dispara a notificação pelo whatsapp.<br>
      2. Confere se o aluno recebeu a mensagem via whatsapp.<br>       
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se as notificações foram enviadas.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve enviar notificação para o whatsapp do aluno.</td>
  </tr>
</table>



<table>
  <tr>
    <th colspan="2" width="1000">CT-022 - S<br>Emissão Nota Fiscal</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário pode agendar aula experimental e fazer a anamnese.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"></td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-022: Emitir nota fiscal de serviço pela prefeitura de Pinhais</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Fazer login.<br>
      2. Opção aluno.<br>
      3. Selecionar o aluno.<br> 
      4. Selecionar financeiro.<br>
      5. Visualizar as mensalidades para emitir a nota fiscal.<br>       
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Verificar se a nota fiscal foi emitida.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve emitir a nota fiscal e disponibilizar no portal para o aluno visualizar ou baixar.</td>
  </tr>
</table>

