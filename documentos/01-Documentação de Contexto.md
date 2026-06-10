# Introdução

Este documento apresenta o contexto do projeto de extensão universitária para desenvolvimento de um sistema de gestão para o Studio Isabel Wencces Dança de Salão e Fitness. O estúdio é conduzido pela educadora física e professora de dança Isabel Wencces (Bel) e pelo professor e coreógrafo Anderson Costa (Tk), que atuam juntos desde 2013 oferecendo aulas de Forró, Samba, Salsa, Sertanejo e Zouk.

O projeto propõe digitalizar os principais processos administrativos do estúdio — matrícula online, agendamento de aulas, anamnese digital e comunicação automatizada com alunos — por meio de uma solução construída de forma participativa com a parceira, para garantir que faça sentido na prática do dia a dia.


## Problema
O Studio Isabel Wencces Dança de Salão e Fitness opera, em sua gestão administrativa, de forma predominantemente manual e não integrada. Apesar da conhecida qualidade pedagógica e artística dos seus professores, os processos de suporte ao negócio carecem de digitalização, gerando ineficiências que impactam tanto a experiência dos alunos quanto a qualidade de vida profissional de Bel e Tk.

O diagnóstico inicial da realidade operacional do estúdio identificou as seguintes situações-problema:

- Matrículas realizadas de forma presencial ou via troca de mensagens em aplicativos de uso pessoal, sem sistema de cadastro centralizado, o que impede o acompanhamento do histórico do aluno e dificulta a gestão da carteira de clientes;
- Agendamento de aulas controlado por agenda física ou digital não especializada, com risco de sobreposição de horários, ausência de controle de capacidade por turma e dificuldade na visualização consolidada da grade de aulas;
- Anamnese — instrumento fundamental para a prescrição segura e personalizada de atividades físicas e de dança — coletada em fichas de papel, sujeitas a extravio, deterioração e consulta lenta, sem possibilidade de análise histórica ou cruzamento de informações;
- Comunicação com alunos realizada de forma não estruturada, mesclando mensagens profissionais e pessoais no mesmo canal, sem automação de confirmações, lembretes de aulas, avisos de cancelamento ou comunicados gerais;
- Ausência de registro sistematizado de frequência, evolução técnica e histórico financeiro dos alunos, limitando a capacidade de acompanhamento pedagógico e de tomada de decisão gerencial.

O efeito cumulativo dessas lacunas é uma sobrecarga administrativa sobre os professores — especialmente sobre Isabel, que concentra a maior parte das funções de gestão — reduzindo o tempo disponível para atividades finalísticas: ensinar, coreografar, atualizar-se tecnicamente e dedicar atenção individualizada aos alunos.

O problema central que orienta este projeto pode, portanto, ser assim enunciado: como desenvolver um sistema sociotécnico integrado, acessível e alinhado às especificidades do Studio Isabel Wencces Dança de Salão e Fitness, que automatize os principais processos administrativos do estúdio, qualifique a experiência do aluno e devolva aos professores tempo e energia para se dedicarem à sua vocação: a dança?


## Objetivos
### Objetivo Geral
Desenvolver um sistema sociotécnico integrado para o Studio Isabel Wencces Dança de Salão e Fitness, contemplando os módulos de matrícula online, agendamento de aulas, anamnese digital e comunicação automatizada com alunos, com foco em usabilidade, acessibilidade mobile e adequação à realidade operacional e financeira de um microempreendimento do setor de dança e fitness.

### Objetivos Específicos

- Realizar levantamento participativo de requisitos funcionais e não funcionais junto à Isabel Wencces e Anderson Costa, documentando os processos atuais e as necessidades prioritárias do estúdio;
- Projetar a arquitetura do sistema, definindo tecnologias, modelagem de dados e fluxos de uso adequados ao perfil dos usuários finais (professores e alunos do estúdio);
- Implementar o módulo de matrícula online, permitindo o cadastro digital de alunos, a gestão de dados cadastrais e o histórico de vínculos com o estúdio;
- Desenvolver o módulo de agendamento de aulas, com controle de capacidade por turma, visualização da grade semanal, gestão de horários e envio automático de confirmações e lembretes;
- Construir o módulo de anamnese digital, com formulários adaptados às modalidades de dança de salão e fitness, garantindo a segurança, a confidencialidade e a rastreabilidade dos dados de saúde coletados;
- Implementar o sistema de comunicação automatizada com alunos, abrangendo notificações de matrícula, lembretes de aulas, avisos de cancelamento/reagendamento e comunicados gerais;
- Conduzir ciclos de validação e teste do sistema com a participação ativa de Bel, Tk e de um grupo representativo de alunos, realizando ajustes iterativos com base no feedback coletado;
- Documentar o processo de desenvolvimento — requisitos, decisões de projeto, código-fonte, manuais de uso e relatório de avaliação — produzindo artefatos que possam subsidiar a manutenção futura do sistema e servir de referência para iniciativas similares.


## Justificativa

A relevância deste projeto se sustenta em dimensões complementares: social, técnica e acadêmica, que se articulam de forma coerente com os princípios da extensão universitária e com as necessidades concretas do parceiro.

### Dimensão Social
A dança de salão e a educação física representam práticas culturais e de saúde com impacto direto na qualidade de vida da população. O Studio Isabel Wencces, ativo desde 2009, constitui um espaço de formação artística, promoção da saúde e convivência social para dezenas de alunos . Ao apoiar a digitalização da gestão do estúdio, o projeto contribui para a sustentabilidade e o crescimento de um empreendimento que gera valor cultural e social para a comunidade local.

A automatização dos processos administrativos terá impacto direto na experiência dos alunos — que passarão a contar com canais organizados de matrícula, agendamento e comunicação — e na qualidade de vida de Isabel e Anderson, aliviando a sobrecarga administrativa e permitindo que se dediquem com mais plenitude ao ensino e à arte. Indiretamente, a solução desenvolvida e documentada poderá ser replicada em outros pequenos estúdios e empreendimentos culturais da região, ampliando o alcance social do projeto.

### Dimensão Técnica

O desenvolvimento de um sistema voltado especificamente ao domínio da dança de salão e fitness apresenta desafios técnicos não triviais e pedagogicamente ricos: modelagem de dados que contemple turmas com ritmos e níveis distintos, regras de negócio para agendamento flexível com controle de lotação, integração de formulários de anamnese com validações específicas para atividade física, e arquitetura de notificações automatizadas que equilibrem frequência e relevância das mensagens.

Esses desafios constituem oportunidade de aprendizado aplicado de alto valor para os estudantes envolvidos no projeto, que terão contato com o ciclo completo de desenvolvimento de software: levantamento de requisitos, projeto de arquitetura, implementação, testes e implantação — tudo em um contexto real, com usuário real, e com impacto mensurável.


## Relação com a Extensão Universitária

O Studio Isabel Wencces é o parceiro externo desta disciplina. A relação estabelecida é de colaboração: a parceira participa ativamente do processo, apresentando suas necessidades, validando as soluções propostas e avaliando os resultados. Não se trata de uma consultoria unilateral, mas de uma construção conjunta entre estudantes, professores e a profissional atendida.

A escolha desse parceiro é coerente com os princípios extensionistas. O estúdio representa um microempreendimento do setor cultural e de saúde, com baixo acesso a soluções tecnológicas especializadas — exatamente o tipo de situação em que a universidade pode gerar impacto real e imediato. Além disso, o contexto da dança de salão e da educação física traz especificidades (anamnese, prescrição de atividades, dinâmica de turmas) que enriquecem a formação dos estudantes envolvidos.

Os produtos gerados — o sistema em si, a documentação técnica e os relatórios de avaliação — serão entregues à parceira ao final da disciplina, com orientações para uso e manutenção. Dessa forma, o projeto cumpre sua função extensionista: produz conhecimento aplicado, forma profissionais com responsabilidade social e deixa uma contribuição concreta para a comunidade.



## Descrição do Parceiro

O Studio Isabel Wencces Dança de Salão e Fitness é um microempreendimento do setor de cultura corporal e bem-estar, com espaço físico próprio. O estúdio é conduzido por dois professores: Isabel Wencces (Bel), educadora física e professora de dança, e Anderson Costa (Tk), professor e coreógrafo. Juntos desde 2013, eles planejam e ministram todas as aulas oferecidas, nas modalidades de Forró, Samba, Salsa, Sertanejo e Zouk.

O negócio atende um público de até 30 alunos, organizados em turmas presenciais com diferentes níveis e ritmos. O modelo de funcionamento é enxuto e personalizado: a relação entre professores e alunos é próxima, o atendimento é direto e não há equipe administrativa de apoio — toda a gestão do estúdio recai sobre os próprios professores

A gestão administrativa do estúdio ocorre hoje de forma fragmentada e sem um padrão definido. Não existe um sistema centralizado: as informações dos alunos, os horários das turmas, os registros de pagamento e os dados de saúde coletados na anamnese estão distribuídos entre papel, planilhas e conversas no WhatsApp. Na prática, o controle depende da memória e da organização pessoal dos professores.

O fluxo típico de um novo aluno ilustra bem essa realidade: o contato inicial acontece pelo WhatsApp, a matrícula é registrada à mão ou em planilha, a anamnese é preenchida em forms e o agendamento das aulas é combinado informalmente, sem confirmação automática ou controle de vagas. Qualquer comunicação posterior — lembretes, avisos de cancelamento, cobranças — é feita manualmente, uma mensagem de cada vez.
Esse modelo funciona enquanto o volume de alunos é pequeno, mas cria gargalos à medida que o estúdio cresce: risco de sobreposição de horários, perda de informações importantes de saúde, dificuldade em acompanhar frequência e pagamentos, e — principalmente — um consumo significativo de tempo dos professores com tarefas administrativas que poderiam ser automatizadas.

### Relevância para o Sistema Sociotécnico

Esse cenário define com clareza o ponto de partida do sistema a ser desenvolvido. A solução não precisa ser complexa — precisa ser adequada. Um estúdio pequeno, gerido por dois professores sem suporte administrativo, com alunos que interagem principalmente pelo celular, exige uma ferramenta leve, intuitiva e que caiba na rotina já existente sem impor uma curva de aprendizado pesada.

A abordagem sociotécnica é essencial aqui: qualquer sistema que ignore como Bel e Tk trabalham de fato — os hábitos, os canais de comunicação já estabelecidos com os alunos, a informalidade que faz parte da identidade do estúdio — corre o risco de ser adotado por pouco tempo e abandonado. Por isso, o desenvolvimento será conduzido de forma participativa, com a parceira no centro das decisões de design e funcionalidade.

