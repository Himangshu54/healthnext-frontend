function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

export function downloadMockReport(report) {
  const rows = report.parameters.map((parameter) => `<tr><th>${escapeHtml(parameter.label)}</th><td>${escapeHtml(parameter.value)} ${escapeHtml(parameter.unit)}</td><td>${escapeHtml(parameter.previousValue)} ${escapeHtml(parameter.unit)}</td><td>${escapeHtml(parameter.range)}</td><td>${escapeHtml(parameter.status)}</td></tr>`).join('')
  const observations = report.observations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const recommendations = report.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const graphPoints = report.history.map((item, index) => `${report.history.length === 1 ? 50 : 8 + (index * 84) / (report.history.length - 1)},${92 - ((Number.parseFloat(item.hemoglobin) - 10) / 6) * 72}`).join(' ')
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>HealthNext Mock Report ${escapeHtml(report.reportId)}</title><style>body{font-family:Arial,sans-serif;color:#12243b;max-width:900px;margin:40px auto;line-height:1.5}h1{margin-bottom:4px}small{color:#637286}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{text-align:left;border-bottom:1px solid #dfe7ed;padding:9px}svg{max-width:100%;height:150px}li{margin:6px 0}.notice{font-weight:bold;margin:18px 0}</style></head><body><h1>HealthNext Diagnostic Hub</h1><small>MOCK HEALTH REPORT / DEMO DATA</small><p class="notice">MOCK REPORT / DEMO DATA — NOT FOR MEDICAL DIAGNOSIS</p><p><strong>Patient:</strong> ${escapeHtml(report.patient.name)} (${escapeHtml(report.patient.id)})<br><strong>Age/Gender:</strong> ${escapeHtml(report.patient.age)} / ${escapeHtml(report.patient.gender)}<br><strong>Phone:</strong> ${escapeHtml(report.patient.phone)}<br><strong>Report ID:</strong> ${escapeHtml(report.reportId)}<br><strong>Date/time:</strong> ${escapeHtml(report.generatedAt)}<br><strong>Session:</strong> ${escapeHtml(report.sessionId)}</p><h2>Health readings</h2><table><thead><tr><th>Parameter</th><th>Latest</th><th>Previous</th><th>Reference</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><h2>Hemoglobin trend</h2><svg viewBox="0 0 100 100" role="img" aria-label="Hemoglobin trend"><line x1="8" y1="92" x2="92" y2="92" stroke="#ccd6dc"/><line x1="8" y1="20" x2="8" y2="92" stroke="#ccd6dc"/><polyline points="${graphPoints}" fill="none" stroke="#087f74" stroke-width="1.5"/></svg><p><strong>Overall summary:</strong> ${escapeHtml(report.summary)}</p><h2>Detected observations</h2><ul>${observations}</ul><h2>Recommendations / next steps</h2><ul>${recommendations}</ul></body></html>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.reportId}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
