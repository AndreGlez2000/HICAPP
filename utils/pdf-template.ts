import type { AdherenceData, GoalsByMonthRow, PhotosSummary } from './report-range';
import { CATEGORY_LABEL, CATEGORY_FG } from '../constants/design';

export function buildHTMLReport(
  adherence: AdherenceData[],
  streak: number,
  rangeLabel: string,
  goalsByMonth: GoalsByMonthRow[],
  photosSummary: PhotosSummary
): string {
  const brandInk = '#522c45';
  const brandPrimary = '#e87a3f';
  const brandBg = '#fcf8f2';
  const brandSurface = '#ffffff';

  const adherenceRows = adherence.map(item => {
    const label = CATEGORY_LABEL[item.categoria] || item.categoria;
    const color = CATEGORY_FG[item.categoria] || brandPrimary;
    return `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong style="color: ${brandInk}; font-size: 16px;">${label}</strong>
          <span style="color: ${color}; font-size: 14px; font-weight: bold;">
            ${item.completed} de ${item.total} días (${item.pct}%)
          </span>
        </div>
        <div style="background-color: #E2E8F0; border-radius: 999px; height: 12px; overflow: hidden;">
          <div style="background-color: ${color}; width: ${item.pct}%; height: 100%; border-radius: 999px;"></div>
        </div>
      </div>
    `;
  }).join('');

  const goalsSection = goalsByMonth.length
    ? `
      <div class="card">
        <h3 class="section-title">Metas por mes</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="text-align: left; color: #64748B;">
              <th style="padding-bottom: 8px;">Mes</th>
              <th style="padding-bottom: 8px;">Categoría</th>
              <th style="padding-bottom: 8px;">Meta</th>
              <th style="padding-bottom: 8px;">Logrado</th>
            </tr>
          </thead>
          <tbody>
            ${goalsByMonth
              .map((row) => `
                <tr>
                  <td style="padding: 6px 0;">${row.month}</td>
                  <td style="padding: 6px 0;">${CATEGORY_LABEL[row.categoria] || row.categoria}</td>
                  <td style="padding: 6px 0;">${row.targetDays} días</td>
                  <td style="padding: 6px 0;">${row.achievedDays} días</td>
                </tr>
              `)
              .join('')}
          </tbody>
        </table>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: ${brandBg};
          color: ${brandInk};
          padding: 40px;
          margin: 0;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .title {
          font-size: 32px;
          color: ${brandInk};
          margin: 0 0 8px 0;
        }
        .subtitle {
          font-size: 20px;
          color: ${brandPrimary};
          margin: 0;
        }
        .card {
          background-color: ${brandSurface};
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .section-title {
          font-size: 24px;
          color: ${brandInk};
          margin: 0 0 24px 0;
        }
        .streak-container {
          text-align: center;
        }
        .streak-number {
          font-size: 80px;
          color: ${brandPrimary};
          font-weight: bold;
          line-height: 1;
          margin: 0;
        }
        .streak-label {
          font-size: 18px;
          color: #64748B;
          margin: 8px 0 0 0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #64748B;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">Reporte de Progreso</h1>
        <h2 class="subtitle">${rangeLabel}</h2>
      </div>

      <div class="card">
        <h3 class="section-title">Adherencia</h3>
        ${adherenceRows}
      </div>

      <div class="card streak-container">
        <h3 class="section-title" style="margin-bottom: 16px;">Racha del período</h3>
        <p class="streak-number">${streak}</p>
        <p class="streak-label">${streak === 1 ? 'día seguido' : 'días seguidos'}</p>
      </div>

      <div class="card">
        <h3 class="section-title">Resumen de fotos</h3>
        <div class="summary-row">
          <span>Total de fotos en el período</span>
          <strong>${photosSummary.total}</strong>
        </div>
      </div>

      ${goalsSection}
    </body>
    </html>
  `;
}
