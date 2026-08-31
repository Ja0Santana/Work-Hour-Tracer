export interface MonthlySummaryData {
  monthName: string;
  year: number;
  totalWorkedFormatted: string;
  hourlyRateFormatted: string;
  totalEarningsFormatted: string;
  totalEntriesCount: number;
  workedDaysCount: number;
  weeklyGoalFormatted: string;
}

export function generateMonthlySummaryCanvas(data: MonthlySummaryData): HTMLCanvasElement {
  const canvasWidth = 1000;
  const canvasHeight = 640;
  const scale = 2;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível inicializar o contexto 2D do Canvas.');
  }

  context.scale(scale, scale);

  const backgroundGradient = context.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  backgroundGradient.addColorStop(0, '#0a0d14');
  backgroundGradient.addColorStop(0.5, '#0f1422');
  backgroundGradient.addColorStop(1, '#13192b');
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  const glowGradient = context.createRadialGradient(850, 100, 20, 850, 100, 300);
  glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
  glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
  context.fillStyle = glowGradient;
  context.beginPath();
  context.arc(850, 100, 300, 0, Math.PI * 2);
  context.fill();

  const glowBottom = context.createRadialGradient(150, 550, 20, 150, 550, 250);
  glowBottom.addColorStop(0, 'rgba(52, 211, 153, 0.12)');
  glowBottom.addColorStop(1, 'rgba(52, 211, 153, 0)');
  context.fillStyle = glowBottom;
  context.beginPath();
  context.arc(150, 550, 250, 0, Math.PI * 2);
  context.fill();

  const cardMargin = 40;
  const cardWidth = canvasWidth - cardMargin * 2;
  const cardHeight = canvasHeight - cardMargin * 2;

  context.save();
  context.fillStyle = 'rgba(23, 29, 45, 0.82)';
  context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  context.lineWidth = 1.5;
  context.beginPath();
  context.roundRect(cardMargin, cardMargin, cardWidth, cardHeight, 20);
  context.fill();
  context.stroke();
  context.restore();

  context.fillStyle = '#818cf8';
  context.font = '600 13px Inter, -apple-system, sans-serif';
  context.fillText('RELATÓRIO DE FECHAMENTO', cardMargin + 32, cardMargin + 46);

  context.fillStyle = '#f8fafc';
  context.font = '700 28px Inter, -apple-system, sans-serif';
  const titleText = `${data.monthName.charAt(0).toUpperCase() + data.monthName.slice(1)} de ${data.year}`;
  context.fillText(titleText, cardMargin + 32, cardMargin + 82);

  context.fillStyle = '#64748b';
  context.font = '500 13px Inter, -apple-system, sans-serif';
  context.fillText('Work Hours Tracker', canvasWidth - cardMargin - 165, cardMargin + 46);

  context.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(cardMargin + 32, cardMargin + 104);
  context.lineTo(canvasWidth - cardMargin - 32, cardMargin + 104);
  context.stroke();

  const statBoxY = cardMargin + 130;
  const statBoxHeight = 160;
  const statBoxGap = 20;
  const statBoxWidth = (cardWidth - 64 - statBoxGap * 2) / 3;

  drawStatBox(
    context,
    cardMargin + 32,
    statBoxY,
    statBoxWidth,
    statBoxHeight,
    'HORAS TRABALHADAS',
    data.totalWorkedFormatted,
    '#f1f5f9',
    'rgba(255, 255, 255, 0.03)',
    'rgba(255, 255, 255, 0.06)',
  );

  drawStatBox(
    context,
    cardMargin + 32 + statBoxWidth + statBoxGap,
    statBoxY,
    statBoxWidth,
    statBoxHeight,
    'VALOR POR HORA',
    data.hourlyRateFormatted,
    '#f1f5f9',
    'rgba(255, 255, 255, 0.03)',
    'rgba(255, 255, 255, 0.06)',
  );

  drawStatBox(
    context,
    cardMargin + 32 + (statBoxWidth + statBoxGap) * 2,
    statBoxY,
    statBoxWidth,
    statBoxHeight,
    'TOTAL A RECEBER',
    data.totalEarningsFormatted,
    '#34d399',
    'rgba(52, 211, 153, 0.08)',
    'rgba(52, 211, 153, 0.25)',
  );

  const detailBoxY = statBoxY + statBoxHeight + 24;
  const detailBoxHeight = 130;
  const detailBoxWidth = cardWidth - 64;

  context.save();
  context.fillStyle = 'rgba(15, 19, 32, 0.6)';
  context.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  context.beginPath();
  context.roundRect(cardMargin + 32, detailBoxY, detailBoxWidth, detailBoxHeight, 12);
  context.fill();
  context.stroke();
  context.restore();

  const colWidth = detailBoxWidth / 3;

  drawDetailItem(
    context,
    cardMargin + 32 + 24,
    detailBoxY + 36,
    'Dias Trabalhados',
    `${data.workedDaysCount} dias`,
  );

  drawDetailItem(
    context,
    cardMargin + 32 + colWidth + 24,
    detailBoxY + 36,
    'Atividades Registradas',
    `${data.totalEntriesCount} registros`,
  );

  drawDetailItem(
    context,
    cardMargin + 32 + colWidth * 2 + 24,
    detailBoxY + 36,
    'Meta Semanal Atual',
    data.weeklyGoalFormatted,
  );

  const footerY = canvasHeight - cardMargin - 28;
  context.fillStyle = '#475569';
  context.font = '500 12px Inter, -apple-system, sans-serif';
  const issueDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  context.fillText(`Gerado em ${issueDate}`, cardMargin + 32, footerY);

  context.textAlign = 'right';
  context.fillText('Valores calculados com base nos lançamentos locais', canvasWidth - cardMargin - 32, footerY);
  context.textAlign = 'left';

  return canvas;
}

function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  valueColor: string,
  bgColor: string,
  borderColor: string,
): void {
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 11px Inter, -apple-system, sans-serif';
  ctx.fillText(label, x + 20, y + 36);

  ctx.fillStyle = valueColor;
  ctx.font = '700 26px Inter, -apple-system, sans-serif';
  ctx.fillText(value, x + 20, y + 84);
  ctx.restore();
}

function drawDetailItem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: string,
): void {
  ctx.fillStyle = '#64748b';
  ctx.font = '500 12px Inter, -apple-system, sans-serif';
  ctx.fillText(label, x, y);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 16px Inter, -apple-system, sans-serif';
  ctx.fillText(value, x, y + 26);
}

export function downloadMonthlySummaryImage(data: MonthlySummaryData): void {
  const canvas = generateMonthlySummaryCanvas(data);
  const normalizedMonth = data.monthName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const filename = `fechamento-${normalizedMonth}-${data.year}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
