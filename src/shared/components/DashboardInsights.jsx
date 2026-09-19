import { Download, FileText, Printer } from "lucide-react";

const safeNumber = (value) => Math.max(0, Number(value) || 0);

export function DonutInsight({
  title,
  subtitle,
  segments,
  centerLabel,
  centerValue,
}) {
  const clean = segments.map((item) => ({
    ...item,
    value: safeNumber(item.value),
  }));
  const total = clean.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = clean.map((item) => {
    const start = total ? (cursor / total) * 100 : 0;
    cursor += item.value;
    const end = total ? (cursor / total) * 100 : 0;
    return `${item.color} ${start}% ${end}%`;
  });
  const background = total
    ? `conic-gradient(${stops.join(",")})`
    : "conic-gradient(#E8EFF0 0 100%)";

  return (
    <article className="rounded-2xl border border-[#DCE8EA] bg-white p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)]">
      <h3 className="font-black text-[#29464D]">{title}</h3>
      {subtitle && <p className="mt-1 text-xs text-[#829499]">{subtitle}</p>}
      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        <div
          className="relative size-40 shrink-0 rounded-full"
          style={{ background }}
        >
          <div className="absolute inset-5 grid place-items-center rounded-full bg-white text-center shadow-inner">
            <div>
              <strong className="block text-2xl font-black text-[#17363E]">
                {centerValue ?? total}
              </strong>
              <span className="text-[11px] text-[#829499]">{centerLabel}</span>
            </div>
          </div>
        </div>
        <div className="w-full space-y-3">
          {clean.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="flex items-center gap-2 text-[#60777D]">
                <i
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <strong className="text-[#29464D]">
                {item.value.toLocaleString("en-US")}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function BarsInsight({ title, subtitle, items }) {
  const clean = items.map((item) => ({
    ...item,
    value: safeNumber(item.value),
  }));
  const max = Math.max(1, ...clean.map((item) => item.value));
  return (
    <article className="rounded-2xl border border-[#DCE8EA] bg-white p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)]">
      <h3 className="font-black text-[#29464D]">{title}</h3>
      {subtitle && <p className="mt-1 text-xs text-[#829499]">{subtitle}</p>}
      <div className="mt-6 space-y-4">
        {clean.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-[#60777D]">{item.label}</span>
              <strong className="text-[#29464D]">
                {item.value.toLocaleString("en-US")}
              </strong>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#EDF3F4]">
              <div
                className="h-full min-w-[3px] rounded-full transition-[width] duration-500"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function htmlCell(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function ReportActions({
  title,
  description,
  filename,
  rows,
  periodLabel,
  executiveSummary,
  narrativeSections = [],
  recommendations = [],
}) {
  const download = () => {
    const csv = [
      "\uFEFFالقسم,البند,القيمة أو البيان",
      `${csvCell("بيانات التقرير")},${csvCell("عنوان التقرير")},${csvCell(title)}`,
      `${csvCell("بيانات التقرير")},${csvCell("الفترة")},${csvCell(periodLabel || "غير محددة")}`,
      `${csvCell("الملخص التنفيذي")},${csvCell("القراءة العامة")},${csvCell(executiveSummary || description)}`,
      ...rows.map(
        ([label, value]) =>
          `${csvCell("المؤشرات")},${csvCell(label)},${csvCell(value)}`,
      ),
      ...narrativeSections.map(({ title: sectionTitle, text }) =>
        `${csvCell("التحليل")},${csvCell(sectionTitle)},${csvCell(text)}`,
      ),
      ...recommendations.map((recommendation, index) =>
        `${csvCell("التوصيات")},${csvCell(`التوصية ${index + 1}`)},${csvCell(recommendation)}`,
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const reportWindow = window.open("", "_blank", "width=920,height=760");
    if (!reportWindow) return;

    const generatedAt = new Intl.DateTimeFormat("ar-SY-u-nu-latn", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());
    const tableRows = rows
      .map(
        ([label, value], index) => `
          <tr>
            <td>${index + 1}</td>
            <th scope="row">${htmlCell(label)}</th>
            <td class="value">${htmlCell(value)}</td>
          </tr>`,
      )
      .join("");
    const analysisHtml = narrativeSections
      .map(
        ({ title: sectionTitle, text }) => `
          <article class="analysis-card">
            <h3>${htmlCell(sectionTitle)}</h3>
            <p>${htmlCell(text)}</p>
          </article>`,
      )
      .join("");
    const recommendationsHtml = recommendations
      .map(
        (recommendation, index) =>
          `<li><b>${index + 1}.</b> ${htmlCell(recommendation)}</li>`,
      )
      .join("");

    reportWindow.document.open();
    reportWindow.document.write(`<!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>${htmlCell(title)}</title>
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body { margin: 0; color: #29464d; background: #fff; font-family: Tahoma, Arial, sans-serif; }
            .report { max-width: 900px; margin: 0 auto; }
            header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 20px; border-bottom: 3px solid #216474; }
            .brand { color: #216474; font-size: 22px; font-weight: 900; white-space: nowrap; }
            h1 { margin: 0; color: #17363e; font-size: 25px; }
            .description { margin: 9px 0 0; color: #60777d; font-size: 12px; line-height: 1.8; }
            .meta { margin: 18px 0; padding: 12px 14px; border: 1px solid #dce8ea; border-radius: 10px; background: #f6fafa; color: #60777d; font-size: 11px; }
            .summary { margin: 0 0 18px; padding: 16px; border-right: 4px solid #216474; border-radius: 10px; background: #eef7f7; }
            .summary h2, .section-title { margin: 0 0 8px; color: #17363e; font-size: 16px; }
            .summary p, .analysis-card p { margin: 0; color: #526b71; font-size: 12px; line-height: 1.9; }
            .section-title { margin-top: 22px; padding-bottom: 7px; border-bottom: 1px solid #dce8ea; }
            table { width: 100%; border-collapse: collapse; overflow: hidden; border: 1px solid #dce8ea; border-radius: 10px; }
            thead { background: #174b57; color: #fff; }
            th, td { padding: 11px 13px; border-bottom: 1px solid #e6eef0; text-align: right; font-size: 12px; }
            thead th { font-weight: 800; }
            tbody th { color: #29464d; font-weight: 700; }
            tbody tr:nth-child(even) { background: #f8fbfb; }
            tbody tr:last-child th, tbody tr:last-child td { border-bottom: 0; }
            td:first-child { width: 44px; color: #829499; text-align: center; }
            .value { width: 180px; color: #17363e; font-weight: 900; direction: ltr; text-align: left; }
            .analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .analysis-card { padding: 13px; border: 1px solid #dce8ea; border-radius: 10px; background: #fbfdfd; break-inside: avoid; }
            .analysis-card h3 { margin: 0 0 6px; color: #216474; font-size: 13px; }
            .recommendations { margin: 0; padding: 14px 32px 14px 14px; border: 1px solid #f2d68a; border-radius: 10px; background: #fffaf0; color: #5f512d; font-size: 12px; line-height: 2; }
            footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #dce8ea; color: #829499; font-size: 10px; line-height: 1.7; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .report { max-width: none; }
              tr { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <main class="report">
            <header>
              <div>
                <h1>${htmlCell(title)}</h1>
                <p class="description">${htmlCell(description)}</p>
              </div>
              <div class="brand">دوائي | Dawaai</div>
            </header>
            <div class="meta">الفترة المشمولة: ${htmlCell(periodLabel || "غير محددة")} &nbsp; | &nbsp; تاريخ إنشاء التقرير: ${htmlCell(generatedAt)}</div>
            <section class="summary">
              <h2>الملخص التنفيذي</h2>
              <p>${htmlCell(executiveSummary || description)}</p>
            </section>
            <h2 class="section-title">جدول المؤشرات الأساسية</h2>
            <table aria-label="${htmlCell(title)}">
              <thead><tr><th>#</th><th>المؤشر</th><th>القيمة</th></tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
            ${analysisHtml ? `<h2 class="section-title">القراءة التحليلية</h2><section class="analysis-grid">${analysisHtml}</section>` : ""}
            ${recommendationsHtml ? `<h2 class="section-title">التوصيات والإجراءات المقترحة</h2><ol class="recommendations">${recommendationsHtml}</ol>` : ""}
            <footer>تم إنشاء هذا التقرير من منصة دوائي. يعرض التقرير المؤشرات المسموح بها للحساب الحالي فقط.</footer>
          </main>
          <script>
            window.addEventListener("load", () => {
              window.setTimeout(() => window.print(), 150);
            });
          </script>
        </body>
      </html>`);
    reportWindow.document.close();
  };

  return (
    <section className="rounded-2xl border border-[#CFE3E5] bg-[#F6FAFA] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
          <FileText size={20} />
        </span>
        <div>
          <h3 className="font-black text-[#29464D]">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[#71858A]">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={download}
          className="btn-primary justify-center"
        >
          <Download size={16} /> تصدير CSV
        </button>
        <button
          type="button"
          onClick={printReport}
          className="btn-secondary justify-center"
        >
          <Printer size={16} /> طباعة التقرير
        </button>
      </div>
      </div>
      {(executiveSummary || narrativeSections.length || recommendations.length) ? (
        <div className="mt-4 grid gap-3 border-t border-[#dce8ea] pt-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h4 className="text-xs font-black text-[#29464d]">الملخص التنفيذي</h4>
            <p className="mt-1 text-xs leading-6 text-[#71858a]">{executiveSummary || description}</p>
          </div>
          <div className="flex flex-wrap content-start gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#52727a]">{rows.length} مؤشرًا رقابيًا</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#52727a]">{narrativeSections.length} محاور تحليلية</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#52727a]">{recommendations.length} توصيات</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
