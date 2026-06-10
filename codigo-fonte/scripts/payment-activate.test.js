#!/usr/bin/env node
// Teste automatizado: verifica que o primeiro pagamento ativa matrículas pendentes
// Uso:
// PARCELA_ID=<id_parcela> ALUNO_ID=<id_aluno> BASE_URL=http://localhost:3000 node scripts/payment-activate.test.js

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const PARCELA_ID = process.env.PARCELA_ID
const ALUNO_ID = process.env.ALUNO_ID

if (!PARCELA_ID || !ALUNO_ID) {
  console.error('Missing PARCELA_ID or ALUNO_ID environment variables')
  process.exit(2)
}

function exitFail(msg) {
  console.error('FAIL:', msg)
  process.exit(1)
}

async function fetchJson(path, opts) {
  const res = await fetch(`${BASE}${path}`, opts)
  const text = await res.text()
  try {
    return { ok: res.ok, status: res.status, json: JSON.parse(text) }
  } catch (e) {
    return { ok: res.ok, status: res.status, text }
  }
}

;(async () => {
  console.log('Base URL:', BASE)
  console.log('Parcela:', PARCELA_ID)
  console.log('Aluno:', ALUNO_ID)

  // 1) Obter parcela antes
  const beforeParcela = await fetchJson(`/api/pagamentos/${PARCELA_ID}`)
  if (!beforeParcela.ok) exitFail(`GET parcela before failed: ${beforeParcela.status}`)
  const parcela = beforeParcela.json
  const statusBefore = parcela.status
  console.log('Parcela status before:', statusBefore)
  if (statusBefore && statusBefore.toLowerCase() === 'pago') exitFail('Parcela já está paga — precisa de uma parcela pendente para o teste')

  // 2) Obter aluno antes
  const beforeAluno = await fetchJson(`/api/alunos/${ALUNO_ID}`)
  if (!beforeAluno.ok) exitFail(`GET aluno before failed: ${beforeAluno.status}`)
  const aluno = beforeAluno.json
  const matriculasBefore = (aluno.matriculas || [])
  const pendingBefore = matriculasBefore.filter(m => m.status === 'pendente').length
  const activeBefore = matriculasBefore.filter(m => m.status === 'ativa').length
  console.log(`Matriculas before — pendente: ${pendingBefore}, ativa: ${activeBefore}`)
  if (pendingBefore === 0) exitFail('Não há matrículas pendentes para ativar — preparar dados de teste')

  // 3) Chamar PUT /api/pagamentos/:id para baixar a parcela
  const today = new Date().toISOString().slice(0, 10)
  const payload = { metodo: 'PIX', data_pagamento: today, valor_pago: Number(parcela.valor_cobrado || parcela.valor_pago || 0) || 1 }

  console.log('Registrando pagamento...')
  const putRes = await fetchJson(`/api/pagamentos/${PARCELA_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!putRes.ok) exitFail(`PUT pagamento failed: ${putRes.status} ${JSON.stringify(putRes.json || putRes.text)}`)
  console.log('PUT result:', putRes.json)

  // 4) Obter parcela depois
  const afterParcela = await fetchJson(`/api/pagamentos/${PARCELA_ID}`)
  if (!afterParcela.ok) exitFail(`GET parcela after failed: ${afterParcela.status}`)
  const parcelaAfter = afterParcela.json
  const statusAfter = parcelaAfter.status
  console.log('Parcela status after:', statusAfter)
  if (!statusAfter || statusAfter.toLowerCase() !== 'pago') exitFail('Parcela não foi marcada como paga')

  // 5) Obter aluno depois e verificar matrículas ativadas
  const afterAluno = await fetchJson(`/api/alunos/${ALUNO_ID}`)
  if (!afterAluno.ok) exitFail(`GET aluno after failed: ${afterAluno.status}`)
  const alunoAfter = afterAluno.json
  const matriculasAfter = (alunoAfter.matriculas || [])
  const pendingAfter = matriculasAfter.filter(m => m.status === 'pendente').length
  const activeAfter = matriculasAfter.filter(m => m.status === 'ativa').length
  console.log(`Matriculas after — pendente: ${pendingAfter}, ativa: ${activeAfter}`)

  if (pendingAfter !== 0) exitFail('Algumas matrículas pendentes não foram ativadas')
  if (activeAfter <= activeBefore) exitFail('Nenhuma matrícula foi marcada como ativa')

  console.log('OK — fluxo validado: pagamento registrado e matrículas ativadas')
  process.exit(0)
})().catch(e => { console.error('Erro fatal:', e); process.exit(1) })
