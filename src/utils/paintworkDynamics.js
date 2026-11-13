// Dynamic paintwork pill styling for Advanced Search — Carcommerce
// Adapts "Vrsta barve" (Metallic, Navadna, Biserna, Mat) pills to the currently selected exterior color.
// If 0 or >1 colors are selected, pills fall back to the default descriptive automotive finish palette.

export const PAINTWORK_PALETTES = {
    default: {
        Metallic: {
            bg: 'linear-gradient(135deg, #94a3b8 0%, #f1f5f9 45%, #64748b 70%, #cbd5e1 100%)',
            border: '1px solid #94a3b8',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)',
            shadow: '0 2px 6px rgba(100, 116, 139, 0.25)',
        },
        Navadna: {
            bg: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            textShadow: 'none',
            shadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #fdf2f8 0%, #ede9fe 25%, #e0f2fe 50%, #fef3c7 75%, #fce7f3 100%)',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)',
            shadow: '0 2px 6px rgba(224, 231, 255, 0.3)',
        },
        Mat: {
            bg: '#27272a',
            border: '1px solid #3f3f46',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
    },
    crna: {
        Metallic: {
            bg: 'linear-gradient(135deg, #09090b 0%, #27272a 35%, #52525b 50%, #18181b 65%, #09090b 100%)',
            border: '1px solid #52525b',
            color: '#ffffff',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
            shadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
        },
        Navadna: {
            bg: '#09090b',
            border: '1px solid #27272a',
            color: '#ffffff',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
            shadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 35%, #312e81 55%, #1e1b4b 75%, #09090b 100%)',
            border: '1px solid #4338ca',
            color: '#ffffff',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
            shadow: '0 2px 6px rgba(30, 27, 75, 0.4)',
        },
        Mat: {
            bg: '#1c1917',
            border: '1px solid #292524',
            color: '#f3f4f6',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
            shadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)',
        },
    },
    bela: {
        Metallic: {
            bg: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 40%, #cbd5e1 70%, #f8fafc 100%)',
            border: '1px solid #94a3b8',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)',
            shadow: '0 2px 6px rgba(148, 163, 184, 0.2)',
        },
        Navadna: {
            bg: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            textShadow: 'none',
            shadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #ffffff 0%, #fce7f3 25%, #ede9fe 50%, #fef3c7 75%, #ffffff 100%)',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)',
            shadow: '0 2px 6px rgba(253, 242, 248, 0.4)',
        },
        Mat: {
            bg: '#f1f5f9',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            textShadow: 'none',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.08)',
        },
    },
    siva: {
        Metallic: {
            bg: 'linear-gradient(135deg, #334155 0%, #64748b 35%, #cbd5e1 50%, #475569 65%, #1e293b 100%)',
            border: '1px solid #64748b',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(30, 41, 59, 0.3)',
        },
        Navadna: {
            bg: '#64748b',
            border: '1px solid #475569',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(51, 65, 85, 0.25)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #334155 0%, #4f46e5 35%, #818cf8 55%, #334155 75%, #1e293b 100%)',
            border: '1px solid #6366f1',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
        },
        Mat: {
            bg: '#374151',
            border: '1px solid #4b5563',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
    },
    srebrna: {
        Metallic: {
            bg: 'linear-gradient(135deg, #94a3b8 0%, #ffffff 35%, #64748b 65%, #e2e8f0 100%)',
            border: '1px solid #94a3b8',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)',
            shadow: '0 2px 6px rgba(100, 116, 139, 0.25)',
        },
        Navadna: {
            bg: '#cbd5e1',
            border: '1px solid #94a3b8',
            color: '#0f172a',
            textShadow: 'none',
            shadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #cbd5e1 0%, #ede9fe 35%, #e0f2fe 65%, #f1f5f9 100%)',
            border: '1px solid #a5b4fc',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)',
            shadow: '0 2px 6px rgba(165, 180, 252, 0.25)',
        },
        Mat: {
            bg: '#94a3b8',
            border: '1px solid #64748b',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.15)',
        },
    },
    rdeca: {
        Metallic: {
            bg: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 35%, #fca5a5 50%, #991b1b 65%, #450a0a 100%)',
            border: '1px solid #dc2626',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(185, 28, 28, 0.35)',
        },
        Navadna: {
            bg: '#dc2626',
            border: '1px solid #991b1b',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #881337 0%, #e11d48 35%, #f59e0b 55%, #be123c 75%, #4c0519 100%)',
            border: '1px solid #f43f5e',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(225, 29, 72, 0.35)',
        },
        Mat: {
            bg: '#991b1b',
            border: '1px solid #7f1d1d',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
    },
    modra: {
        Metallic: {
            bg: 'linear-gradient(135deg, #172554 0%, #1d4ed8 35%, #93c5fd 50%, #1e40af 65%, #0f172a 100%)',
            border: '1px solid #2563eb',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(29, 78, 216, 0.35)',
        },
        Navadna: {
            bg: '#1d4ed8',
            border: '1px solid #1e3a8a',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(29, 78, 216, 0.3)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 35%, #06b6d4 55%, #1e3a8a 75%, #0f172a 100%)',
            border: '1px solid #6366f1',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(55, 48, 163, 0.35)',
        },
        Mat: {
            bg: '#1e3a8a',
            border: '1px solid #172554',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
    },
    zelena: {
        Metallic: {
            bg: 'linear-gradient(135deg, #022c22 0%, #059669 35%, #a7f3d0 50%, #047857 65%, #064e3b 100%)',
            border: '1px solid #10b981',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(5, 150, 105, 0.35)',
        },
        Navadna: {
            bg: '#15803d',
            border: '1px solid #166534',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(21, 128, 61, 0.3)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #064e3b 0%, #059669 35%, #eab308 55%, #047857 75%, #022c22 100%)',
            border: '1px solid #34d399',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(5, 150, 105, 0.35)',
        },
        Mat: {
            bg: '#14532d',
            border: '1px solid #052e16',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
    },
    rjava: {
        Metallic: {
            bg: 'linear-gradient(135deg, #291003 0%, #78350f 35%, #fed7aa 50%, #92400e 65%, #1c0a00 100%)',
            border: '1px solid #b45309',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(120, 53, 15, 0.35)',
        },
        Navadna: {
            bg: '#542507',
            border: '1px solid #381a07',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(84, 37, 7, 0.3)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #3c1402 0%, #9a3412 35%, #f59e0b 55%, #78350f 75%, #1c0a00 100%)',
            border: '1px solid #d97706',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(154, 52, 18, 0.35)',
        },
        Mat: {
            bg: '#381a07',
            border: '1px solid #271203',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
    },
    rumena: {
        Metallic: {
            bg: 'linear-gradient(135deg, #a16207 0%, #facc15 35%, #fef9c3 50%, #eab308 65%, #713f12 100%)',
            border: '1px solid #ca8a04',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.7)',
            shadow: '0 2px 6px rgba(202, 138, 4, 0.25)',
        },
        Navadna: {
            bg: '#eab308',
            border: '1px solid #ca8a04',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)',
            shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #ca8a04 0%, #fde047 35%, #ffffff 55%, #facc15 75%, #854d0e 100%)',
            border: '1px solid #eab308',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.7)',
            shadow: '0 2px 6px rgba(234, 179, 8, 0.25)',
        },
        Mat: {
            bg: '#ca8a04',
            border: '1px solid #a16207',
            color: '#0f172a',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.15)',
        },
    },
    oranzna: {
        Metallic: {
            bg: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 35%, #ffedd5 50%, #c2410c 65%, #431407 100%)',
            border: '1px solid #f97316',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(234, 88, 12, 0.35)',
        },
        Navadna: {
            bg: '#ea580c',
            border: '1px solid #c2410c',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(234, 88, 12, 0.3)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #7c2d12 0%, #f97316 35%, #fef08a 55%, #ea580c 75%, #431407 100%)',
            border: '1px solid #fb923c',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(249, 115, 22, 0.35)',
        },
        Mat: {
            bg: '#9a3412',
            border: '1px solid #7c2d12',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
    },
    vijolicna: {
        Metallic: {
            bg: 'linear-gradient(135deg, #3b0764 0%, #7e22ce 35%, #f3e8ff 50%, #6b21a8 65%, #2e1065 100%)',
            border: '1px solid #9333ea',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(126, 34, 206, 0.35)',
        },
        Navadna: {
            bg: '#6b21a8',
            border: '1px solid #581c87',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(107, 33, 168, 0.3)',
        },
        Pearl: {
            bg: 'linear-gradient(135deg, #2e1065 0%, #9333ea 35%, #f472b6 55%, #7c3aed 75%, #1e1b4b 100%)',
            border: '1px solid #a855f7',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: '0 2px 6px rgba(147, 51, 234, 0.35)',
        },
        Mat: {
            bg: '#4c1d95',
            border: '1px solid #3b0764',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
    },
};

export function normalizeColorKey(colorName) {
    if (!colorName) return 'default';
    const normalized = String(colorName)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // strip diacritics: č->c, ž->z, etc.

    if (normalized === 'crna' || normalized === 'black') return 'crna';
    if (normalized === 'bela' || normalized === 'white') return 'bela';
    if (normalized === 'siva' || normalized === 'grey' || normalized === 'gray') return 'siva';
    if (normalized === 'srebrna' || normalized === 'silver') return 'srebrna';
    if (normalized === 'rdeca' || normalized === 'red') return 'rdeca';
    if (normalized === 'modra' || normalized === 'blue') return 'modra';
    if (normalized === 'zelena' || normalized === 'green') return 'zelena';
    if (normalized === 'rjava' || normalized === 'brown') return 'rjava';
    if (normalized === 'rumena' || normalized === 'yellow') return 'rumena';
    if (normalized === 'oranzna' || normalized === 'orange') return 'oranzna';
    if (normalized === 'vijolicna' || normalized === 'purple' || normalized === 'violet') return 'vijolicna';
    return 'default';
}

export function getPaintworkPaletteForColor(colorName) {
    const key = normalizeColorKey(colorName);
    return PAINTWORK_PALETTES[key] || PAINTWORK_PALETTES.default;
}

export function applyPaintworkPalette(chips, colorName) {
    const palette = getPaintworkPaletteForColor(colorName);
    if (!chips) return;

    chips.forEach(chip => {
        const paint = chip.getAttribute('data-paint') || chip.querySelector('input')?.value;
        const style = palette[paint] || PAINTWORK_PALETTES.default[paint];
        if (!style) return;

        chip.style.setProperty('--pw-bg', style.bg);
        chip.style.setProperty('--pw-border', style.border);
        chip.style.setProperty('--pw-color', style.color);
        chip.style.setProperty('--pw-shadow', style.shadow || 'none');
        chip.style.setProperty('--pw-text-shadow', style.textShadow || 'none');
    });
}

export function bindPaintworkColorDynamics(root = document) {
    const paintworkChips = root.querySelectorAll('.adv-chip-paintwork');
    if (!paintworkChips.length) return;

    const form = root.querySelector('#advancedSearchForm') || (root.closest && root.closest('#advancedSearchForm')) || document.getElementById('advancedSearchForm');

    function update() {
        const checkedInputs = Array.from(root.querySelectorAll('input[name="color"]:checked'));
        // If exactly ONE color is selected -> use that color's palette.
        // If 0 or >1 colors are selected -> return to default palette.
        const singleColor = checkedInputs.length === 1 ? checkedInputs[0].value : null;
        applyPaintworkPalette(paintworkChips, singleColor);
    }

    root.querySelectorAll('input[name="color"]').forEach(input => {
        if (!input.dataset.paintDynamicsBound) {
            input.dataset.paintDynamicsBound = 'true';
            input.addEventListener('change', update);
        }
    });

    if (form && !form.dataset.paintDynamicsResetBound) {
        form.dataset.paintDynamicsResetBound = 'true';
        form.addEventListener('reset', () => {
            setTimeout(update, 0);
        });
    }

    // Run once on initialization
    update();
}
