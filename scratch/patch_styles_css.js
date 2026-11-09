import fs from 'fs';

let css = fs.readFileSync('css/styles.css', 'utf8');

const oldCssPattern = /\/\* ── Engine type \/ cylinders field polish ──[\s\S]*?\.adv-a2-cell \.adv-a2-pill-wrap \{\s*display: flex;\s*justify-content: center;\s*padding-top: 2px;\s*\}/;

const newCss = `/* ── Motorcycle & Car Engine Controls Grid ──────────────────────── */
.adv-engine-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

#acc-engine.is-moto-engine .adv-engine-row,
.adv-engine-row:has(.adv-a2-cell:not([style*="display: none"])) {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
}

@media (max-width: 768px) {
  .adv-engine-row,
  #acc-engine.is-moto-engine .adv-engine-row,
  .adv-engine-row:has(.adv-a2-cell:not([style*="display: none"])) {
    grid-template-columns: 1fr !important;
    gap: 0.75rem;
  }
}

/* ── A2 izpit toggle – advanced search (compact inline cell) ─────── */
.adv-a2-cell {
  display: flex;
  flex-direction: column;
}

.adv-a2-cell .adv-a2-pill-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 40px;
}

.adv-a2-cell .unit-toggle-pill {
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 3px;
  border-radius: 999px;
  background: var(--ah-soft, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--ah-line, rgba(255, 255, 255, 0.1));
}

.adv-a2-cell .unit-toggle-pill .unit-btn {
  padding: 6px 18px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--ah-muted, rgba(255, 255, 255, 0.6));
  transition: all 0.15s ease;
}

.adv-a2-cell .unit-toggle-pill .unit-btn.active {
  background: var(--ah-blue, #2563eb) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
}

/* ── Motorcycle Engine Cylinders & Layout Polish ─────────────────── */
.engine-cyl-field {
  text-align: left !important;
  width: 100%;
}

.engine-cyl-field .adv-label {
  text-align: left !important;
  margin-bottom: 0.5rem;
}

.cyl-controls-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.engine-cyl-field .cyl-count {
  width: 150px;
  flex: 0 0 150px;
}

.engine-cyl-field .cyl-count .custom-select-trigger {
  height: 40px;
  padding: 0 16px;
  font-size: 13px !important;
  font-weight: 500 !important;
  letter-spacing: normal !important;
}

.engine-cyl-field .cyl-layout {
  min-width: 190px;
  max-width: 260px;
  flex: 0 1 auto;
}

.engine-cyl-field .cyl-layout .custom-select-trigger {
  height: 40px;
  padding: 0 16px;
  font-size: 13px !important;
  font-weight: 500 !important;
}

.cyl-btn-group {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.cyl-action-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.35rem !important;
  height: 38px !important;
  padding: 0 1.15rem !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  border-radius: 999px !important;
  cursor: pointer;
  transition: all 0.15s ease !important;
  white-space: nowrap;
}

.cyl-action-btn.primary {
  background: var(--ah-blue, #2563eb) !important;
  color: #ffffff !important;
  border: none !important;
}

.cyl-action-btn.primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.cyl-remove-btn {
  background: rgba(239, 68, 68, 0.12) !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
  color: #ef4444 !important;
}

body.dark-mode .cyl-remove-btn {
  background: rgba(239, 68, 68, 0.18) !important;
  border-color: rgba(239, 68, 68, 0.35) !important;
  color: #f87171 !important;
}

.cyl-remove-btn:hover {
  background: rgba(239, 68, 68, 0.25) !important;
  transform: translateY(-1px);
}

/* Cylinder active chips container */
.cyl-chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.75rem;
}

.cyl-chips-container:empty {
  margin-top: 0;
  display: none;
}

.cyl-filter-chip {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.45rem !important;
  padding: 6px 12px !important;
  border-radius: 9999px !important;
  background: rgba(37, 99, 235, 0.1) !important;
  border: 1px solid rgba(37, 99, 235, 0.3) !important;
  color: #2563eb !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  line-height: 1.2;
}

body.dark-mode .cyl-filter-chip {
  background: rgba(59, 130, 246, 0.15) !important;
  border-color: rgba(59, 130, 246, 0.35) !important;
  color: #93c5fd !important;
}

.cyl-filter-chip button {
  background: rgba(37, 99, 235, 0.15) !important;
  border: none !important;
  color: #2563eb !important;
  border-radius: 50% !important;
  width: 18px !important;
  height: 18px !important;
  font-size: 13px !important;
  line-height: 1 !important;
  cursor: pointer;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  margin-left: 2px;
  transition: all 0.15s ease;
}

body.dark-mode .cyl-filter-chip button {
  background: rgba(147, 197, 253, 0.2) !important;
  color: #93c5fd !important;
}

.cyl-filter-chip button:hover {
  background: #ef4444 !important;
  color: #ffffff !important;
}

.cyl-filter-chip-exclude {
  background: rgba(239, 68, 68, 0.12) !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
  color: #ef4444 !important;
}

body.dark-mode .cyl-filter-chip-exclude {
  background: rgba(239, 68, 68, 0.18) !important;
  border-color: rgba(239, 68, 68, 0.35) !important;
  color: #f87171 !important;
}

.cyl-filter-chip-exclude button {
  background: rgba(239, 68, 68, 0.2) !important;
  color: #ef4444 !important;
}

body.dark-mode .cyl-filter-chip-exclude button {
  background: rgba(248, 113, 113, 0.25) !important;
  color: #f87171 !important;
}

.cyl-filter-chip-exclude button:hover {
  background: #ef4444 !important;
  color: #ffffff !important;
}`;

if (oldCssPattern.test(css)) {
  css = css.replace(oldCssPattern, newCss);
  fs.writeFileSync('css/styles.css', css, 'utf8');
  console.log('Successfully updated css/styles.css');
} else {
  console.error('Pattern not found in css/styles.css!');
}
