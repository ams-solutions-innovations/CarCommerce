# -*- coding: utf-8 -*-
import re

with open('scratch/build_auctions_css.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect where CSS_ADDITIONS is defined and add the navigation support & utility classes
NAV_ADDITION = """
/* ── 11. Navigation & Dropdown Menu Support (Prototype compatibility) ──────── */
.nv {
    position: relative;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 68px;
    padding: 10px 14px 10px 26px;
    border-radius: 9999px;
    flex-wrap: nowrap;
}
.nv-logo { display: flex; align-items: center; flex: none; }
.nv-links { display: flex; align-items: center; gap: 4px; flex: 1; justify-content: center; min-width: 0; }
.nv-item { position: relative; }
.nv-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 42px;
    padding: 0 18px;
    border-radius: 9999px;
    border: 1px solid transparent;
    background: transparent;
    font-weight: 600;
    font-size: 14.5px;
    color: #5a6b83;
    white-space: nowrap;
    text-decoration: none;
    transition: background 0.25s, color 0.25s, box-shadow 0.25s;
}
.nv-link .i { width: 17px; height: 17px; opacity: 0.75; }
.nv-link:hover { background: rgba(255, 255, 255, 0.75); color: #0c1b30; }
.nv-link.on {
    background: #fff;
    color: #1d4ed8;
    border-color: rgba(12, 27, 48, 0.05);
    box-shadow: 0 4px 15px -3px rgba(37, 99, 235, 0.18);
}
.nv-link.on .i { opacity: 1; }
.nv-link .car { width: 14px; height: 14px; opacity: 0.6; }
.nv-actions { display: flex; align-items: center; gap: 10px; flex: none; }
.nv-add {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    height: 40px;
    min-width: 40px;
    max-width: 40px;
    padding: 0;
    border-radius: 9999px;
    border: 0;
    background: #2563eb;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    flex: none;
    box-shadow: 0 10px 20px -6px rgba(37, 99, 235, 0.45);
    text-decoration: none;
    transition: max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s cubic-bezier(0.4, 0, 0.2, 1), gap 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, transform 0.3s ease;
}
.nv-add .i { width: 18px; height: 18px; stroke-width: 2.2; }
.nv-add span {
    display: inline-block;
    opacity: 0;
    max-width: 0;
    overflow: hidden;
    margin: 0;
    transition: opacity 0.2s ease 0.05s, max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.nv-add:hover, .nv-add:focus-visible {
    max-width: 190px;
    padding: 0 18px 0 12px;
    gap: 8px;
    transform: translateY(-1px);
    box-shadow: 0 12px 25px -6px rgba(37, 99, 235, 0.55);
}
.nv-add:hover span, .nv-add:focus-visible span { opacity: 1; max-width: 150px; }
.nv-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 14px;
    border-radius: 9999px;
    border: 1px solid #dbe5f1;
    background: #fff;
    font-weight: 600;
    font-size: 13.5px;
    color: #0c1b30;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
}
.nv-btn:hover { border-color: #b9cdea; background: #f6f9fd; }
.nv-btn.c { width: 40px; padding: 0; justify-content: center; }
.nv-btn .i { width: 17px; height: 17px; }
.nv-burger { display: none; }

.um { position: relative; }
.um-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 12px 0 5px;
    border-radius: 9999px;
    border: 1px solid #dbe5f1;
    background: #fff;
    font-weight: 600;
    font-size: 13.5px;
    color: #0c1b30;
    white-space: nowrap;
    cursor: pointer;
}
.um-btn:hover, .um:focus-within .um-btn { border-color: #b9cdea; background: #f6f9fd; }
.um-btn .i { width: 15px; height: 15px; color: #5a6b83; }
.um-av {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: #fff;
    font-family: 'Manrope', 'Inter', sans-serif;
    font-weight: 800;
    font-size: 13px;
    flex: none;
}
.um-av.big { width: 42px; height: 42px; font-size: 16px; }
.um-dot {
    position: absolute;
    top: -1px;
    right: -1px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #f97316;
    border: 2px solid #fff;
}
.dd, .mm { display: none; position: absolute; top: 100%; padding-top: 10px; z-index: 100; }
.dd { right: 0; width: 308px; }
.mm { left: 50%; margin-left: -120px; width: 240px; }
.um:hover .dd, .um:focus-within .dd, .dd.open, .nv-item:hover .mm, .nv-item:focus-within .mm { display: block; }
.dd .in, .mm .in {
    background: #fff;
    border: 1px solid rgba(12, 27, 48, 0.08);
    border-radius: 26px;
    padding: 8px;
    box-shadow: 0 28px 52px -16px rgba(12, 27, 48, 0.4), 0 2px 8px rgba(12, 27, 48, 0.06);
}
.dd-head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 10px 12px;
    margin-bottom: 4px;
    border-radius: 18px;
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.14) 0%, rgba(37, 99, 235, 0.02) 100%);
}
.dd-head b { display: block; font-family: 'Manrope', 'Inter', sans-serif; font-weight: 800; font-size: 15px; }
.dd-head span.e { display: block; font-size: 12px; color: #5a6b83; margin-top: 1px; }
.dd-cap {
    padding: 12px 12px 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #6b7b93;
}
.dd-r {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 42px;
    padding: 0 10px 0 8px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    color: #26364d;
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s ease;
}
.dd-r:hover { background: #f1f6fd; }
.dd-r.cur { background: #e6eefc; color: #1d4ed8; }
.dd-r .ic {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: #eef4fd;
    color: #2563eb;
    flex: none;
}
.dd-r.cur .ic { background: #2563eb; color: #fff; }
.dd-r .ic .i { width: 16px; height: 16px; }
.dd-r .ct {
    margin-left: auto;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    border-radius: 9999px;
    background: #eaf0f8;
    color: #33445c;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-variant-numeric: tabular-nums;
}
.dd-r.cur .ct { background: #fff; color: #1d4ed8; }
.dd-r .ct.hot { background: #f97316; color: #fff; }
.dd-sep { height: 1px; background: #e8eef6; margin: 8px 6px; }
.dd-r.out { color: #b91c1c; }
.dd-r.out .ic { background: #fdecec; color: #b91c1c; }
.mm .dd-r .ic { background: #f1f6fd; }

@media (max-width: 1023px) {
    .nv-links { display: none; }
    .nv-burger { display: inline-flex; }
    .nv-name { display: none; }
    .um-btn { padding: 0 10px 0 5px; }
    .nv-sl { display: none; }
}

/* Dark mode for navigation elements */
body.dark-mode .nv-link:hover { background: rgba(51, 65, 85, 0.7); color: #f1f5f9; }
body.dark-mode .nv-link.on {
    background: #1e293b;
    color: #93c5fd;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 15px -3px rgba(37, 99, 235, 0.3);
}
body.dark-mode .nv-btn,
body.dark-mode .um-btn {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.12);
    color: #f1f5f9;
}
body.dark-mode .nv-btn:hover,
body.dark-mode .um-btn:hover {
    background: #334155;
    border-color: rgba(255, 255, 255, 0.2);
}
body.dark-mode .dd .in,
body.dark-mode .mm .in {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 28px 52px -16px rgba(0, 0, 0, 0.7), 0 2px 8px rgba(0, 0, 0, 0.3);
    color: #f1f5f9;
}
body.dark-mode .dd-head {
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0.05) 100%);
}
body.dark-mode .dd-head span.e { color: #94a3b8; }
body.dark-mode .dd-cap { color: #94a3b8; }
body.dark-mode .dd-r { color: #cbd5e1; }
body.dark-mode .dd-r:hover { background: #334155; }
body.dark-mode .dd-r.cur { background: rgba(37, 99, 235, 0.25); color: #93c5fd; }
body.dark-mode .dd-r .ic { background: rgba(37, 99, 235, 0.2); color: #60a5fa; }
body.dark-mode .dd-r.cur .ic { background: #2563eb; color: #fff; }
body.dark-mode .dd-r .ct { background: #0f172a; color: #cbd5e1; }
body.dark-mode .dd-sep { background: rgba(255, 255, 255, 0.08); }

/* Additional Tab and Typography Utilities */
.tab {
    display: inline-flex;
    align-items: center;
    height: 42px;
    padding: 0 18px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 600;
    color: #4a5b73;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
}
.tab:hover { background: #eef3fa; color: #0c1b30; }
.tab.on { background: #0b1f3f; color: #fff; }
body.dark-mode .tab { color: #94a3b8; }
body.dark-mode .tab:hover { background: #334155; color: #f1f5f9; }
body.dark-mode .tab.on { background: #3b82f6; color: #fff; }

.h3 {
    font-family: 'Manrope', 'Inter', sans-serif;
    font-weight: 800;
    font-size: 20px;
    letter-spacing: -0.015em;
    color: #0c1b30;
}
body.dark-mode .h3 { color: #f1f5f9; }
"""

# Append NAV_ADDITION to CSS_ADDITIONS in build script
idx = text.find('CSS_ADDITIONS = """')
end_idx = text.find('"""', idx + 20)
new_text = text[:end_idx] + "\n" + NAV_ADDITION.strip() + "\n" + text[end_idx:]

with open('scratch/build_auctions_css.py', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Updated scratch/build_auctions_css.py with NAV_ADDITION")
