"use client";

//tela relatorios

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Sidebar } from "../../../../components/dashboard/Sidebar";
import { CalendarRange, UsersRound, Wallet } from 'lucide-react';

// ─── Supabase ───────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ──────────────────────────────────────────────────────────────────
interface KpiData {
  alunosAtivos: number;
  receitaMes: number;
  aulasAgendadas: number;
  taxaOcupacao: number;
}

interface AlunosFilter {
  ritmo: string;
  plano: string;
  status: string;
  professor: string;
  dataInicio: string;
  dataFim: string;
}

interface FinanceiroFilter {
  periodo: string;
  statusPagamento: string;
  tipoReceita: string;
}

interface AgendamentosFilter {
  professor: string;
  turma: string;
  tipoAula: string;
  periodo: string;
  statusPresenca: string;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ title, value, subtitle, trend, color }: {
  title: string; value: string; subtitle: string; trend?: string; color?: string;
}) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: "20px 24px",
      flex: 1,
      minWidth: 0,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      border: "1px solid #ede8e1",
    }}>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || "#1a0a0a", fontFamily: "'Crimson Text', Georgia, serif" }}>
        {value}
      </div>
      {trend && (
        <div style={{ fontSize: 12, color: trend.startsWith("+") ? "#16a34a" : "#dc2626", marginTop: 4 }}>
          {trend} {subtitle}
        </div>
      )}
      {!trend && <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 140 }}>
      <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #e0d9d0",
          background: "#faf8f5",
          fontSize: 13,
          color: "#1a0a0a",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 130 }}>
      <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #e0d9d0",
          background: "#faf8f5",
          fontSize: 13,
          color: "#1a0a0a",
          outline: "none",
        }}
      />
    </div>
  );
}

// ─── Export Buttons ───────────────────────────────────────────────────────────
function ExportButtons({ onPdf, onExcel }: { onPdf: () => void; onExcel: () => void }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
      <button
        onClick={onPdf}
        style={{
          flex: 1, padding: "9px 0",
          border: "1.5px solid #c0392b", borderRadius: 8,
          background: "transparent", color: "#c0392b",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all 0.18s",
        }}
        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#c0392b"; (e.target as HTMLButtonElement).style.color = "#fff"; }}
        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.color = "#c0392b"; }}
      >
        Exportar PDF
      </button>
      <button
        onClick={onExcel}
        style={{
          flex: 1, padding: "9px 0",
          border: "1.5px solid #16a34a", borderRadius: 8,
          background: "transparent", color: "#16a34a",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all 0.18s",
        }}
        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#16a34a"; (e.target as HTMLButtonElement).style.color = "#fff"; }}
        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.color = "#16a34a"; }}
      >
        Exportar Excel
      </button>
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: 4,
      height: 50, padding: "8px 0",
    }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: color,
            borderRadius: "3px 3px 0 0",
            opacity: 0.75 + (i / data.length) * 0.25,
            minHeight: 4,
          }}
        />
      ))}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: "#555" }}>{label}</span>
        <span style={{ color: "#333", fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "#f0ebe4", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: "1px solid #f0ebe4",
    }}>
      <span style={{ fontSize: 13, color: "#666" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: highlight ? "#c0392b" : "#1a0a0a" }}>{value}</span>
    </div>
  );
}

// ─── Report Card Shell ────────────────────────────────────────────────────────
function ReportCard({ title, subtitle, icon, children, accentColor }: {
  title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode; accentColor: string;
}) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #ede8e1",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "18px 22px 14px",
        borderBottom: "1px solid #f0ebe4",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: accentColor + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a0a0a", fontFamily: "'Crimson Text', Georgia, serif" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ padding: "16px 22px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

// ─── CSV Export Helper ────────────────────────────────────────────────────────
function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RelatoriosPage() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  // KPIs
  const [kpi, setKpi] = useState<KpiData>({ alunosAtivos: 0, receitaMes: 0, aulasAgendadas: 0, taxaOcupacao: 0 });
  const [loadingKpi, setLoadingKpi] = useState(true);

  // Alunos state
  const [alunosFilter, setAlunosFilter] = useState<AlunosFilter>({
    ritmo: "", plano: "", status: "", professor: "",
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    dataFim: new Date().toISOString().split("T")[0],
  });
  const [alunosData, setAlunosData] = useState<{
    total: number; novos: number; semMatricula: number; inadimplentes: number;
    porRitmo: { nome: string; total: number }[]; porPlano: { nome: string; total: number }[];
  } | null>(null);
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  // Financeiro state
  const [finFilter, setFinFilter] = useState<FinanceiroFilter>({ periodo: "2026-04", statusPagamento: "", tipoReceita: "" });
  const [finData, setFinData] = useState<{
    receitaTotal: number; ticketMedio: number; inadimplencia: number; pagamentosPendentes: number;
    receitaMensal: number[]; metodoPix: number; metodoOutros: number;
  } | null>(null);
  const [loadingFin, setLoadingFin] = useState(false);

  // Agendamentos state
  const [agFilter, setAgFilter] = useState<AgendamentosFilter>({ professor: "", turma: "", tipoAula: "", periodo: "", statusPresenca: "" });
  const [agData, setAgData] = useState<{
    total: number; concluidas: number; canceladas: number; presencas: number; faltas: number;
    taxaComparecimento: number; porDia: number[];
  } | null>(null);
  const [loadingAg, setLoadingAg] = useState(false);

  // Options
  const [ritmos, setRitmos] = useState<{ value: string; label: string }[]>([]);
  const [planos, setPlanos] = useState<{ value: string; label: string }[]>([]);
  const [professores, setProfessores] = useState<{ value: string; label: string }[]>([]);
  const [turmas, setTurmas] = useState<{ value: string; label: string }[]>([]);

  const validarAdmin = useCallback(async () => {
  try {
    setAuthLoading(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // não autenticado
    if (authError || !user) {
      router.replace('/login')
      return
    }

    // busca usuário no banco
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('tipo_perfil')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    console.log('Auth User:', user.id)
    console.log('Usuário encontrado:', usuario)

    // erro consulta
    if (usuarioError) {
      console.error(usuarioError)
      router.replace('/acesso-negado')
      return
    }

    // sem usuário
    if (!usuario) {
      router.replace('/acesso-negado')
      return
    }

    // valida admin
    if (usuario.tipo_perfil?.trim().toUpperCase() !== 'ADMIN') {
      router.replace('/acesso-negado')
      return
    }

    setAuthorized(true)

  } catch (error) {
    console.error('Erro ao validar admin:', error)
    router.replace('/login')
  } finally {
    setAuthLoading(false)
  }
}, [router])

useEffect(() => {
  validarAdmin()
}, [validarAdmin])

  // ── Load filter options ───────────────────────────────────────────────────
  useEffect(() => {
    async function loadOptions() {
      const [{ data: r }, { data: p }, { data: pr }, { data: t }] = await Promise.all([
        supabase.from("ritmos").select("id_ritmo, nome").eq("ativo", true),
        supabase.from("planos").select("id_plano, nome").eq("ativo", true),
        supabase.from("professores").select("id_professor, usuarios(nome_completo)"),
        supabase.from("turmas").select("id_turma, nome"),
      ]);
      setRitmos([{ value: "", label: "Todos os Ritmos" }, ...(r ?? []).map((x: any) => ({ value: x.id_ritmo, label: x.nome }))]);
      setPlanos([{ value: "", label: "Todos os Planos" }, ...(p ?? []).map((x: any) => ({ value: x.id_plano, label: x.nome }))]);
      setProfessores([{ value: "", label: "Todos os Professores" }, ...(pr ?? []).map((x: any) => ({ value: x.id_professor, label: x.usuarios?.nome_completo ?? "—" }))]);
      setTurmas([{ value: "", label: "Todas as Turmas" }, ...(t ?? []).map((x: any) => ({ value: x.id_turma, label: x.nome }))]);
    }
    loadOptions();
  }, []);

  // ── Load KPIs ─────────────────────────────────────────────────────────────
  const [kpiTrends, setKpiTrends] = useState({
    alunos: "",
    receita: "",
    ocupacao: "",
  });

  useEffect(() => {
    async function loadKpi() {
      setLoadingKpi(true);

      const hoje = new Date();

      const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

      const formatDate = (d: Date) => d.toISOString().split("T")[0];

      const [
        { count: alunosAtivosAtual },
        { count: alunosAtivosAnterior },
        { data: parcelasAtual },
        { data: parcelasAnterior },
        { count: aulas },
        { data: turmasData },
      ] = await Promise.all([
        supabase.from("matriculas_turmas").select("*", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("matriculas_turmas").select("*", { count: "exact", head: true }).eq("status", "ativo")
          .gte("created_at", formatDate(inicioMesAnterior)).lte("created_at", formatDate(fimMesAnterior)),
        supabase.from("parcelas").select("valor_cobrado").eq("status", "pago")
          .gte("data_vencimento", formatDate(inicioMesAtual)).lte("data_vencimento", formatDate(fimMesAtual)),
        supabase.from("parcelas").select("valor_cobrado").eq("status", "pago")
          .gte("data_vencimento", formatDate(inicioMesAnterior)).lte("data_vencimento", formatDate(fimMesAnterior)),
        supabase.from("aulas_agenda").select("*", { count: "exact", head: true })
          .gte("data_hora_inicio", `${formatDate(inicioMesAtual)}T00:00:00`),
        supabase.from("turmas").select("capacidade_maxima"),
      ]);

      const receitaAtual = (parcelasAtual ?? []).reduce((s: number, p: any) => s + (p.valor_cobrado ?? 0), 0);
      const receitaAnterior = (parcelasAnterior ?? []).reduce((s: number, p: any) => s + (p.valor_cobrado ?? 0), 0);

      const capTotal = (turmasData ?? []).reduce((s: number, t: any) => s + (t.capacidade_maxima ?? 0), 0);
      const ocupacaoAtual = capTotal > 0 ? Math.round(((alunosAtivosAtual ?? 0) / capTotal) * 100) : 0;
      const ocupacaoAnterior = capTotal > 0 ? Math.round(((alunosAtivosAnterior ?? 0) / capTotal) * 100) : 0;

      const calcTrend = (atual: number, anterior: number) => {
        if (!anterior && atual > 0) return "+100%";
        if (!anterior) return "0%";
        const pct = ((atual - anterior) / anterior) * 100;
        return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
      };

      setKpi({
        alunosAtivos: alunosAtivosAtual ?? 0,
        receitaMes: receitaAtual,
        aulasAgendadas: aulas ?? 0,
        taxaOcupacao: ocupacaoAtual,
      });

      setKpiTrends({
        alunos: calcTrend(alunosAtivosAtual ?? 0, alunosAtivosAnterior ?? 0),
        receita: calcTrend(receitaAtual, receitaAnterior),
        ocupacao: "",
      });

      setLoadingKpi(false);
    }

    loadKpi();
  }, []);

  // ── Load Alunos ───────────────────────────────────────────────────────────
  async function loadAlunos() {
    setLoadingAlunos(true);

    let qAtivos = supabase.from("matriculas_turmas").select("id_aluno", { count: "exact" }).eq("status", "ativo");
    if (alunosFilter.professor) qAtivos = qAtivos.eq("turmas.id_professor", alunosFilter.professor);
    const { count: total } = await qAtivos;

    const { count: novos } = await supabase
      .from("usuarios").select("id_usuario", { count: "exact", head: true })
      .gte("criado_em", `${alunosFilter.dataInicio}T00:00:00`)
      .lte("criado_em", `${alunosFilter.dataFim}T23:59:59`)
      .eq("tipo_perfil", "ALUNO");

    const { data: matriculados } = await supabase.from("matriculas_turmas").select("id_aluno").eq("status", "ativo");
    const idsMatriculados = (matriculados ?? []).map((m) => m.id_aluno);

    let querySemMatricula = supabase.from("alunos").select("id_aluno", { count: "exact", head: true });
    if (idsMatriculados.length > 0) {
      querySemMatricula = querySemMatricula.not("id_aluno", "in", `(${idsMatriculados.join(",")})`);
    }
    const { count: semMatricula } = await querySemMatricula;

    const { count: inadimplentes } = await supabase.from("parcelas").select("id_parcela", { count: "exact" }).eq("status", "vencida");

    const { data: porRitmoRaw } = await supabase.from("alunos_ritmo").select("ritmos(nome)");
    const ritmoCount: Record<string, number> = {};
    (porRitmoRaw ?? []).forEach((r: any) => {
      const n = r.ritmos?.nome ?? "Outros";
      ritmoCount[n] = (ritmoCount[n] ?? 0) + 1;
    });
    const porRitmo = Object.entries(ritmoCount).map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total).slice(0, 5);

    const { data: porPlanoRaw } = await supabase.from("contratos").select("planos(nome)").eq("status", "ativo" as any);
    const planoCount: Record<string, number> = {};
    (porPlanoRaw ?? []).forEach((r: any) => {
      const n = r.planos?.nome ?? "Outros";
      planoCount[n] = (planoCount[n] ?? 0) + 1;
    });
    const porPlano = Object.entries(planoCount).map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total).slice(0, 4);

    setAlunosData({ total: total ?? 0, novos: novos ?? 0, semMatricula: semMatricula ?? 0, inadimplentes: inadimplentes ?? 0, porRitmo, porPlano });
    setLoadingAlunos(false);
  }

  // ── Load Financeiro ───────────────────────────────────────────────────────
  async function loadFinanceiro() {
    setLoadingFin(true);
    const [ano, mes] = finFilter.periodo.split("-");
    const dataInicio = `${ano}-${mes}-01`;
    const dataFim = `${ano}-${mes}-31`;

    let q = supabase.from("parcelas").select("valor_cobrado, status, contratos(planos(nome))");
    if (finFilter.statusPagamento) q = q.eq("status", finFilter.statusPagamento);
    q = q.gte("data_vencimento", dataInicio).lte("data_vencimento", dataFim);
    const { data: parcelas } = await q;

    const pagas = (parcelas ?? []).filter((p: any) => p.status === "pago");
    const receitaTotal = pagas.reduce((s: number, p: any) => s + (p.valor_cobrado ?? 0), 0);
    const ticketMedio = pagas.length > 0 ? receitaTotal / pagas.length : 0;
    const vencidas = (parcelas ?? []).filter((p: any) => p.status === "vencida").length;
    const inadimplencia = (parcelas ?? []).length > 0 ? Math.round((vencidas / (parcelas ?? []).length) * 100) : 0;
    const pagamentosPendentes = (parcelas ?? []).filter((p: any) => p.status === "pendente").reduce((s: number, p: any) => s + (p.valor_cobrado ?? 0), 0);

    const receitaMensal: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(parseInt(ano), parseInt(mes) - 1 - i, 1);
      const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0");
      const { data: mp } = await supabase.from("parcelas").select("valor_cobrado").eq("status", "pago")
        .gte("data_vencimento", `${y}-${m}-01`).lte("data_vencimento", `${y}-${m}-31`);
      receitaMensal.push((mp ?? []).reduce((s: number, p: any) => s + (p.valor_cobrado ?? 0), 0));
    }

    const { data: pagamentos } = await supabase.from("pagamentos").select("metodo, valor_pago")
      .gte("data_pagamento", dataInicio).lte("data_pagamento", dataFim);
    const pix = (pagamentos ?? []).filter((p: any) => p.metodo?.toLowerCase() === "pix").reduce((s: number, p: any) => s + (p.valor_pago ?? 0), 0);
    const outros = (pagamentos ?? []).filter((p: any) => p.metodo?.toLowerCase() !== "pix").reduce((s: number, p: any) => s + (p.valor_pago ?? 0), 0);

    setFinData({ receitaTotal, ticketMedio, inadimplencia, pagamentosPendentes, receitaMensal, metodoPix: pix, metodoOutros: outros });
    setLoadingFin(false);
  }

  // ── Load Agendamentos ─────────────────────────────────────────────────────
  async function loadAgendamentos() {
    setLoadingAg(true);
    let q = supabase.from("agendamento_aulas").select("status_presenca, data_agendamento, aulas_agenda(tipo_aula, id_professor, id_turma)");
    if (agFilter.statusPresenca) q = q.eq("status_presenca", agFilter.statusPresenca);
    if (agFilter.periodo) q = q.gte("data_agendamento", agFilter.periodo + "-01").lte("data_agendamento", agFilter.periodo + "-31");
    const { data: ags } = await q;

    const total = (ags ?? []).length;
    const concluidas = (ags ?? []).filter((a: any) => a.status_presenca === "presente").length;
    const canceladas = (ags ?? []).filter((a: any) => a.status_presenca === "cancelado").length;
    const presencas = concluidas;
    const faltas = (ags ?? []).filter((a: any) => a.status_presenca === "ausente").length;
    const taxaComparecimento = total > 0 ? Math.round((presencas / total) * 100) : 0;

    const porDia = [0, 0, 0, 0, 0, 0, 0];
    (ags ?? []).forEach((a: any) => {
      if (a.data_agendamento) {
        const d = new Date(a.data_agendamento).getDay();
        porDia[d]++;
      }
    });

    setAgData({ total, concluidas, canceladas, presencas, faltas, taxaComparecimento, porDia });
    setLoadingAg(false);
  }
  
  //Gerar pdf

  async function gerarPDF(titulo: string, filtros: any, dados: any[]) {
  const res = await fetch("/api/relatorios/pdf", {
    method: "POST",
    body: JSON.stringify({ titulo, filtros, dados }),
  });

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${titulo}.pdf`;
  a.click();

  window.URL.revokeObjectURL(url);
}

  // Export helpers
    function getLabel(options: { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label || "Todos";
}

  function exportAlunosPDF() {
  if (!alunosData) return;

  const filtrosFormatados = {
    Ritmo: getLabel(ritmos, alunosFilter.ritmo),
    Plano: getLabel(planos, alunosFilter.plano),
    Status: alunosFilter.status || "Todos",
    Professor: getLabel(professores, alunosFilter.professor),
    "Data Início": alunosFilter.dataInicio,
    "Data Fim": alunosFilter.dataFim,
  };

  gerarPDF(
    "Relatório de Alunos",
    filtrosFormatados,
    [
      {
        "Total Ativos": alunosData.total,
        "Novos": alunosData.novos,
        "Sem Matrícula": alunosData.semMatricula,
        "Inadimplentes": alunosData.inadimplentes,
      },
      ...alunosData.porRitmo.map((r) => ({
        "Ritmo": r.nome,
        "Alunos": r.total,
      })),
    ]
  );
}
  function exportAlunosExcel() {
    if (!alunosData) return;
    downloadCSV("relatorio_alunos.csv", [
      { "Total Ativos": alunosData.total, "Novos": alunosData.novos, "Sem Matrícula": alunosData.semMatricula, "Inadimplentes": alunosData.inadimplentes },
      ...alunosData.porRitmo.map((r) => ({ "Ritmo": r.nome, "Alunos": r.total })),
    ]);
  }
  
  function exportFinPDF() {
  if (!finData) return;

  gerarPDF(
    "Relatório Financeiro",
    finFilter,
    [
      {
        "Receita Total": fmt(finData.receitaTotal),
        "Ticket Médio": fmt(finData.ticketMedio),
        "Inadimplência": finData.inadimplencia + "%",
        "Pagamentos Pendentes": fmt(finData.pagamentosPendentes),
        "PIX": fmt(finData.metodoPix),
        "Outros": fmt(finData.metodoOutros),
      },
    ]
  );
}

  function exportFinExcel() {
    if (!finData) return;
    downloadCSV("relatorio_financeiro.csv", [{
      "Receita Total": finData.receitaTotal.toFixed(2),
      "Ticket Médio": finData.ticketMedio.toFixed(2),
      "Inadimplência %": finData.inadimplencia,
      "Pagamentos Pendentes": finData.pagamentosPendentes.toFixed(2),
      "PIX": finData.metodoPix.toFixed(2),
      "Outros": finData.metodoOutros.toFixed(2),
    }]);
  }
  
  function exportAgPDF() {
  if (!agData) return;

  gerarPDF(
    "Relatório de Agendamentos",
    agFilter,
    [
      {
        "Total": agData.total,
        "Concluídas": agData.concluidas,
        "Canceladas": agData.canceladas,
        "Presenças": agData.presencas,
        "Faltas": agData.faltas,
        "Taxa": agData.taxaComparecimento + "%",
      },
    ]
  );
}

  function exportAgExcel() {
    if (!agData) return;
    downloadCSV("relatorio_agendamentos.csv", [{
      "Total": agData.total, "Concluídas": agData.concluidas, "Canceladas": agData.canceladas,
    }]);
  }

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f1eb",
          fontSize: 18,
          color: "#1a0a0a",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f1eb", fontFamily: "'Crimson Text', Georgia, serif" }}>
      <Sidebar />

      <main style={{ marginLeft: "var(--sidebar-width, 10px)", flex: 1, padding: "2% 7%", minWidth: 0 }}>
        {/* Header */}
        <div className="page-header">
          <p className="page-label">Análises</p>
          <h1 className="page-title">Central de Relatórios</h1>
          <p className="page-subtitle">Visualize métricas e exporte relatórios detalhados do seu estúdio</p>
        </div>

        <div className="page-content">
          {/* KPI Strip */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
            <KpiCard
              title="Alunos Ativos"
              value={loadingKpi ? "..." : kpi.alunosAtivos.toString()}
              subtitle="matriculados"
              trend={kpiTrends.alunos}
            />
            <KpiCard
              title="Receita do Mês"
              value={loadingKpi ? "..." : fmt(kpi.receitaMes)}
              subtitle="vs anterior"
              trend={kpiTrends.receita}
              color="#c0392b"
            />
            <KpiCard
              title="Aulas Agendadas"
              value={loadingKpi ? "..." : kpi.aulasAgendadas.toString()}
              subtitle="este mês"
            />
            <KpiCard
              title="Taxa de Ocupação"
              value={loadingKpi ? "..." : `${kpi.taxaOcupacao}%`}
              subtitle="capacidade total"
              trend={kpiTrends.ocupacao}
            />
          </div>

          {/* Report Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>

            {/* ── Card 1: Alunos ── */}
            <ReportCard title="Relatório de Alunos" subtitle="Cadastros, planos e matrículas" icon={<UsersRound size={28} strokeWidth={0.8} />} accentColor="#c0392b">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <DateInput label="De" value={alunosFilter.dataInicio} onChange={(v) => setAlunosFilter((f) => ({ ...f, dataInicio: v }))} />
                <DateInput label="Até" value={alunosFilter.dataFim} onChange={(v) => setAlunosFilter((f) => ({ ...f, dataFim: v }))} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Select label="Ritmo" value={alunosFilter.ritmo} onChange={(v) => setAlunosFilter((f) => ({ ...f, ritmo: v }))} options={ritmos} />
                <Select label="Plano" value={alunosFilter.plano} onChange={(v) => setAlunosFilter((f) => ({ ...f, plano: v }))} options={planos} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Select
                  label="Status"
                  value={alunosFilter.status}
                  onChange={(v) => setAlunosFilter((f) => ({ ...f, status: v }))}
                  options={[{ value: "", label: "Todos os Status" }, { value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }, { value: "pendente", label: "Pendente" }]}
                />
                <Select label="Professor" value={alunosFilter.professor} onChange={(v) => setAlunosFilter((f) => ({ ...f, professor: v }))} options={professores} />
              </div>

              <button
                onClick={loadAlunos}
                disabled={loadingAlunos}
                style={{
                  padding: "9px 0", borderRadius: 8,
                  background: "#c0392b", color: "#fff", border: "none",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%",
                  opacity: loadingAlunos ? 0.7 : 1,
                }}
              >
                {loadingAlunos ? "Carregando..." : "Gerar Relatório"}
              </button>

              {alunosData && (
                <div>
                  <StatRow label="Total de alunos ativos" value={alunosData.total} />
                  <StatRow label="Novos no período" value={alunosData.novos} />
                  <StatRow label="Sem matrícula" value={alunosData.semMatricula} highlight />
                  <StatRow label="Inadimplentes" value={alunosData.inadimplentes} highlight />
                  {alunosData.porRitmo.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>Alunos por Ritmo</div>
                      {alunosData.porRitmo.map((r) => (
                        <ProgressRow key={r.nome} label={r.nome} value={r.total} max={alunosData.total} color="#c0392b" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <ExportButtons onPdf={exportAlunosPDF} onExcel={exportAlunosExcel} />
            </ReportCard>

            {/* ── Card 2: Financeiro ── */}
            <ReportCard title="Relatório Financeiro" subtitle="Receitas, parcelas e inadimplência" icon={<Wallet size={28} strokeWidth={0.8} />} accentColor="#b7791f">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 130 }}>
                  <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>Período</label>
                  <input
                    type="month"
                    value={finFilter.periodo}
                    onChange={(e) => setFinFilter((f) => ({ ...f, periodo: e.target.value }))}
                    style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e0d9d0", background: "#faf8f5", fontSize: 13, color: "#1a0a0a", outline: "none" }}
                  />
                </div>
                <Select
                  label="Status Pagamento"
                  value={finFilter.statusPagamento}
                  onChange={(v) => setFinFilter((f) => ({ ...f, statusPagamento: v }))}
                  options={[{ value: "", label: "Todos" }, { value: "pago", label: "Pago" }, { value: "pendente", label: "Pendente" }, { value: "vencida", label: "Vencido" }]}
                />
              </div>

              <button
                onClick={loadFinanceiro}
                disabled={loadingFin}
                style={{
                  padding: "9px 0", borderRadius: 8,
                  background: "#b7791f", color: "#fff", border: "none",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%",
                  opacity: loadingFin ? 0.7 : 1,
                }}
              >
                {loadingFin ? "Carregando..." : "Gerar Relatório"}
              </button>

              {finData && (
                <div>
                  <StatRow label="Receita total" value={fmt(finData.receitaTotal)} />
                  <StatRow label="Ticket médio" value={fmt(finData.ticketMedio)} />
                  <StatRow label="Taxa de inadimplência" value={`${finData.inadimplencia}%`} highlight={finData.inadimplencia > 10} />
                  <StatRow label="Pagamentos pendentes" value={fmt(finData.pagamentosPendentes)} highlight />

                  {finData.receitaMensal.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>Receita Últimos 6 Meses</div>
                      <MiniBarChart data={finData.receitaMensal} color="#b7791f" />
                    </div>
                  )}

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>Método de Pagamento</div>
                    <ProgressRow label="PIX" value={finData.metodoPix} max={finData.metodoPix + finData.metodoOutros} color="#16a34a" />
                    <ProgressRow label="Outros" value={finData.metodoOutros} max={finData.metodoPix + finData.metodoOutros} color="#b7791f" />
                  </div>
                </div>
              )}

              <ExportButtons onPdf={exportFinPDF} onExcel={exportFinExcel} />
            </ReportCard>

            {/* ── Card 3: Agendamentos ── */}
            <ReportCard title="Relatório de Agendamentos" subtitle="Agenda, ocupação e presença" icon={<CalendarRange size={28} strokeWidth={0.8} />} accentColor="#1d4ed8">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Select label="Professor" value={agFilter.professor} onChange={(v) => setAgFilter((f) => ({ ...f, professor: v }))} options={professores} />
                <Select label="Turma" value={agFilter.turma} onChange={(v) => setAgFilter((f) => ({ ...f, turma: v }))} options={turmas} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Select
                  label="Tipo de Aula"
                  value={agFilter.tipoAula}
                  onChange={(v) => setAgFilter((f) => ({ ...f, tipoAula: v }))}
                  options={[{ value: "", label: "Todos os Tipos" }, { value: "regular", label: "Regular" }, { value: "avulsa", label: "Avulsa" }, { value: "experimental", label: "Experimental" }]}
                />
                <Select
                  label="Presença"
                  value={agFilter.statusPresenca}
                  onChange={(v) => setAgFilter((f) => ({ ...f, statusPresenca: v }))}
                  options={[{ value: "", label: "Todos" }, { value: "presente", label: "Presente" }, { value: "ausente", label: "Ausente" }, { value: "cancelado", label: "Cancelado" }]}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 130 }}>
                  <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>Período</label>
                  <input
                    type="month"
                    value={agFilter.periodo}
                    onChange={(e) => setAgFilter((f) => ({ ...f, periodo: e.target.value }))}
                    style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e0d9d0", background: "#faf8f5", fontSize: 13, color: "#1a0a0a", outline: "none" }}
                  />
                </div>
              </div>

              <button
                onClick={loadAgendamentos}
                disabled={loadingAg}
                style={{
                  padding: "9px 0", borderRadius: 8,
                  background: "#1d4ed8", color: "#fff", border: "none",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%",
                  opacity: loadingAg ? 0.7 : 1,
                }}
              >
                {loadingAg ? "Carregando..." : "Gerar Relatório"}
              </button>

              {agData && (
                <div>
                  <StatRow label="Total de agendamentos" value={agData.total} />
                  <StatRow label="Aulas concluídas" value={agData.concluidas} />
                  <StatRow label="Aulas canceladas" value={agData.canceladas} highlight={agData.canceladas > agData.total * 0.2} />

                  {agData.porDia.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>Aulas por Dia da Semana</div>
                      <MiniBarChart data={agData.porDia} color="#1d4ed8" />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginTop: 2 }}>
                        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <ExportButtons onPdf={exportAgPDF} onExcel={exportAgExcel} />
            </ReportCard>
          </div>
        </div>
      </main>
    </div>
  );
}