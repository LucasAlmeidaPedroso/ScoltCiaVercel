import { CreditCard, Download, FileText, Package, Receipt, Wallet } from "lucide-react";
import { getTutorData } from "@/lib/tutor-data";

const methodIcon: Record<string, typeof CreditCard> = { PIX: Receipt, Cartao: CreditCard, Boleto: FileText };
const statusCls: Record<string, string> = { Pago: "green", Pendente: "yellow", Atrasado: "red" };

export default async function FinanceiroPage() {
  const { financial } = await getTutorData();
  const pkgPct = Math.round((financial.packagesLeft / financial.packageTotal) * 100);

  return (
    <div className="tutor-page">
      <section className="tutor-fin-cards">
        <article className="tutor-fin-highlight aqua">
          <Wallet size={26} />
          <small>Mensalidade atual</small>
          <strong>R$ {financial.monthlyValue}</strong>
          <span>{financial.plan}</span>
        </article>
        <article className="tutor-fin-highlight purple">
          <Package size={26} />
          <small>Pacotes restantes</small>
          <strong>{financial.packagesLeft} de {financial.packageTotal}</strong>
          <div className="tutor-progress"><span style={{ width: `${pkgPct}%` }} /></div>
        </article>
        <article className="tutor-fin-highlight yellow">
          <Receipt size={26} />
          <small>Proximo vencimento</small>
          <strong>{financial.nextDue}</strong>
          <span>Pague via PIX, cartao ou boleto</span>
        </article>
      </section>

      <section className="tutor-section">
        <h3 className="tutor-section-title"><Receipt size={20} /> Historico de pagamentos</h3>
        <div className="tutor-table-wrap">
          <table className="tutor-table">
            <thead>
              <tr><th>Data</th><th>Descricao</th><th>Forma</th><th>Valor</th><th>Status</th><th>Comprovante</th></tr>
            </thead>
            <tbody>
              {financial.invoices.map((inv, i) => {
                const Icon = methodIcon[inv.method] || CreditCard;
                return (
                  <tr key={i}>
                    <td>{inv.date}</td>
                    <td>{inv.description}</td>
                    <td><span className="tutor-method"><Icon size={14} /> {inv.method}</span></td>
                    <td>R$ {inv.value}</td>
                    <td><span className={`tutor-status-badge ${statusCls[inv.status]}`}><span className="tutor-dot" /> {inv.status}</span></td>
                    <td><button className="tutor-ghost-btn" disabled><Download size={14} /> Baixar</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="tutor-section-sub">As notas fiscais ficam disponiveis para download apos a confirmacao do pagamento.</p>
      </section>
    </div>
  );
}
