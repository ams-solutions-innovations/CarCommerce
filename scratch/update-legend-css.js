import fs from 'fs';

const legendCss = `
/* ── AutoHub Modern Legend Modal ─────────────────────────────────── */
.legend-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 12, 22, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  opacity: 0;
  transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.legend-overlay.active {
  display: flex !important;
  opacity: 1 !important;
}

.legend-card.ah-legend-card,
.platform-avto .legend-card {
  position: relative;
  width: 100%;
  max-width: 540px;
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  padding: 24px 26px 22px;
  background: var(--ah-surface, #ffffff);
  border: 1px solid var(--ah-line, rgba(12, 27, 48, 0.08));
  box-shadow: 0 24px 60px -12px rgba(12, 27, 48, 0.35);
  color: var(--ah-ink, #0c1b30);
  overflow: hidden;
  box-sizing: border-box;
  animation: ah-modal-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

body.dark-mode .legend-card.ah-legend-card,
body.platform-avto.dark-mode .legend-card,
.dark-mode .legend-card.ah-legend-card {
  background: var(--ah-surface, #13233a) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.75) !important;
  color: var(--ah-ink, #edf4ff) !important;
}

@keyframes ah-modal-pop {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.ah-legend-card .legend-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--ah-line, rgba(0, 0, 0, 0.06));
  flex-shrink: 0;
}

body.dark-mode .ah-legend-card .legend-card-header,
.dark-mode .ah-legend-card .legend-card-header {
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
}

.ah-legend-card .legend-card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  font-family: Manrope, Inter, sans-serif;
  letter-spacing: -0.02em;
  color: var(--ah-ink, #0c1b30);
}

body.dark-mode .ah-legend-card .legend-card-header h3,
.dark-mode .ah-legend-card .legend-card-header h3 {
  color: var(--ah-ink, #edf4ff) !important;
}

.ah-legend-card .legend-card-sub {
  margin: 4px 0 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ah-muted, #5a6b83);
  line-height: 1.35;
}

body.dark-mode .ah-legend-card .legend-card-sub,
.dark-mode .ah-legend-card .legend-card-sub {
  color: var(--ah-muted, #a7b9d1) !important;
}

.ah-legend-card .legend-close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--ah-line, rgba(12, 27, 48, 0.1));
  background: var(--ah-soft, #f1f5f9);
  color: var(--ah-muted, #5a6b83);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.ah-legend-card .legend-close-btn:hover {
  background: rgba(239, 68, 68, 0.12) !important;
  border-color: rgba(239, 68, 68, 0.35) !important;
  color: #ef4444 !important;
  transform: scale(1.06);
}

body.dark-mode .ah-legend-card .legend-close-btn,
.dark-mode .ah-legend-card .legend-close-btn {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: #a7b9d1 !important;
}

body.dark-mode .ah-legend-card .legend-close-btn:hover,
.dark-mode .ah-legend-card .legend-close-btn:hover {
  background: rgba(239, 68, 68, 0.22) !important;
  border-color: rgba(239, 68, 68, 0.5) !important;
  color: #f87171 !important;
}

.ah-legend-card .legend-card-body {
  overflow-y: auto;
  padding-right: 6px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(128, 128, 128, 0.3) transparent;
}

.ah-legend-card .legend-card-body::-webkit-scrollbar {
  width: 5px;
}
.ah-legend-card .legend-card-body::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 9999px;
}

.ah-legend-card .legend-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ah-legend-card .legend-section-title {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ah-muted, #5a6b83);
  margin: 0;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--ah-line, rgba(0, 0, 0, 0.05));
}

body.dark-mode .ah-legend-card .legend-section-title,
.dark-mode .ah-legend-card .legend-section-title {
  color: var(--ah-muted, #a7b9d1) !important;
  border-bottom-color: rgba(255, 255, 255, 0.06) !important;
}

.ah-legend-card .legend-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}

@media (max-width: 480px) {
  .ah-legend-card .legend-grid {
    grid-template-columns: 1fr;
  }
}

.ah-legend-card .legend-item {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.ah-legend-card .legend-item-full {
  grid-column: 1 / -1;
}

.ah-legend-card .legend-item .ah-spec {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 9999px;
  padding: 5px 10px;
  background: var(--ah-soft, #eaf0f8);
  color: var(--ah-ink, #0c1b30);
  border: 1px solid var(--ah-line, rgba(12, 27, 48, 0.08));
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

body.dark-mode .ah-legend-card .legend-item .ah-spec,
.dark-mode .ah-legend-card .legend-item .ah-spec {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #edf4ff !important;
}

.ah-legend-card .legend-item .ah-spec#powerToggleLabelPill:hover {
  background: rgba(37, 99, 235, 0.12) !important;
  border-color: rgba(37, 99, 235, 0.35) !important;
  transform: translateY(-1px);
}

.ah-legend-card .legend-item .ah-spec .ah-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: currentColor;
}

.ah-legend-card .legend-item-desc {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--ah-muted, #5a6b83);
  line-height: 1.25;
}

body.dark-mode .ah-legend-card .legend-item-desc,
.dark-mode .ah-legend-card .legend-item-desc {
  color: var(--ah-muted, #a7b9d1) !important;
}

.ah-legend-card .legend-badge-demo {
  position: static !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 9999px;
  flex-shrink: 0;
  background: #0b1f3f;
  color: #ffffff;
}

.ah-legend-card .legend-badge-demo.ah-badge-blue {
  background: #2563eb;
}

.ah-legend-card .legend-rating-demo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px;
  background: var(--ah-soft, #eaf0f8);
  border: 1px solid var(--ah-line, rgba(12, 27, 48, 0.08));
  border-radius: 9999px;
  flex-shrink: 0;
}

body.dark-mode .ah-legend-card .legend-rating-demo,
.dark-mode .ah-legend-card .legend-rating-demo {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.ah-legend-card .legend-rating-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #0f766e;
}

body.dark-mode .ah-legend-card .legend-rating-label,
.dark-mode .ah-legend-card .legend-rating-label {
  color: #2dd4bf !important;
}

.ah-legend-card .legend-rating-demo .ah-rating-track {
  width: 90px;
  height: 5px;
  border-radius: 9999px;
  background: linear-gradient(90deg, #0f766e 0%, #cbd5e1 50%, #c2410c 100%);
  position: relative;
}

.ah-legend-card .legend-rating-demo .ah-rating-track i {
  position: absolute;
  top: -4px;
  width: 13px;
  height: 13px;
  margin-left: -6px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #0c1b30;
}

body.dark-mode .ah-legend-card .legend-rating-demo .ah-rating-track i,
.dark-mode .ah-legend-card .legend-rating-demo .ah-rating-track i {
  border-color: #13233a !important;
}

.ah-legend-card .legend-action-demo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--ah-line, rgba(12, 27, 48, 0.1));
  background: var(--ah-surface, #ffffff);
  color: var(--ah-ink, #0c1b30);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

body.dark-mode .ah-legend-card .legend-action-demo,
.dark-mode .ah-legend-card .legend-action-demo {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #edf4ff !important;
}

.ah-legend-card .legend-action-demo .ah-icon {
  width: 14px;
  height: 14px;
}

.ah-legend-card .legend-settings-box {
  background: var(--ah-soft, #eaf0f8);
  border: 1px solid var(--ah-line, rgba(12, 27, 48, 0.08));
  border-radius: 18px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

body.dark-mode .ah-legend-card .legend-settings-box,
.dark-mode .ah-legend-card .legend-settings-box {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.ah-legend-card .legend-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ah-legend-card .legend-setting-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ah-legend-card .legend-setting-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ah-ink, #0c1b30);
}

body.dark-mode .ah-legend-card .legend-setting-name,
.dark-mode .ah-legend-card .legend-setting-name {
  color: var(--ah-ink, #edf4ff) !important;
}

.ah-legend-card .legend-setting-hint {
  font-size: 0.72rem;
  color: var(--ah-muted, #5a6b83);
}

body.dark-mode .ah-legend-card .legend-setting-hint,
.dark-mode .ah-legend-card .legend-setting-hint {
  color: var(--ah-muted, #a7b9d1) !important;
}

.ah-legend-card .legend-unit-toggle {
  display: inline-flex;
  align-items: center;
  background: rgba(12, 27, 48, 0.06);
  border: 1px solid var(--ah-line, rgba(12, 27, 48, 0.1));
  border-radius: 9999px;
  padding: 3px;
  gap: 2px;
}

body.dark-mode .ah-legend-card .legend-unit-toggle,
.dark-mode .ah-legend-card .legend-unit-toggle {
  background: rgba(0, 0, 0, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.ah-legend-card .power-unit-btn,
.ah-legend-card .displacement-unit-btn {
  padding: 4px 12px;
  font-size: 0.76rem;
  font-weight: 700;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: var(--ah-muted, #5a6b83);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

body.dark-mode .ah-legend-card .power-unit-btn,
body.dark-mode .ah-legend-card .displacement-unit-btn,
.dark-mode .ah-legend-card .power-unit-btn,
.dark-mode .ah-legend-card .displacement-unit-btn {
  color: var(--ah-muted, #a7b9d1) !important;
}

.ah-legend-card .power-unit-btn:hover,
.ah-legend-card .displacement-unit-btn:hover {
  color: var(--ah-ink, #0c1b30);
}

body.dark-mode .ah-legend-card .power-unit-btn:hover,
body.dark-mode .ah-legend-card .displacement-unit-btn:hover,
.dark-mode .ah-legend-card .power-unit-btn:hover,
.dark-mode .ah-legend-card .displacement-unit-btn:hover {
  color: #ffffff !important;
}

.ah-legend-card .power-unit-btn.active,
.ah-legend-card .displacement-unit-btn.active {
  background: var(--ah-blue, #2563eb) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35) !important;
}
`;

// Append to css/autohub.css if not already present
let autohubCss = fs.readFileSync('css/autohub.css', 'utf8');
if (!autohubCss.includes('AutoHub Modern Legend Modal')) {
    autohubCss += '\n' + legendCss;
    fs.writeFileSync('css/autohub.css', autohubCss, 'utf8');
    console.log('Appended legend CSS to css/autohub.css');
} else {
    console.log('Legend CSS already in css/autohub.css');
}

// Append to css/styles.css as fallback
let stylesCss = fs.readFileSync('css/styles.css', 'utf8');
if (!stylesCss.includes('AutoHub Modern Legend Modal')) {
    stylesCss += '\n' + legendCss;
    fs.writeFileSync('css/styles.css', stylesCss, 'utf8');
    console.log('Appended legend CSS to css/styles.css');
} else {
    console.log('Legend CSS already in css/styles.css');
}
