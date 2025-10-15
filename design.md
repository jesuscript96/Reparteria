Haré una investigación exhaustiva sobre las mejores prácticas de diseño CSS para aplicaciones de logística modernas. Esto requerirá múltiples búsquedas para cubrir todos los aspectos importantes.Excelente, he completado una investigación exhaustiva sobre las mejores prácticas de diseño CSS para aplicaciones de logística modernas. A continuación te presento un informe detallado y específico:

---

# 🚚 **MEJORES PRÁCTICAS DE DISEÑO CSS PARA APLICACIONES DE LOGÍSTICA MODERNAS (2025)**

## **PARTE 1: FUNDAMENTOS DE ARQUITECTURA CSS**

### **1.1 Arquitectura y Organización**

Las aplicaciones empresariales modernas requieren arquitecturas CSS escalables que utilicen características avanzadas como container queries, cascade layers y custom properties tipadas para mantener especificidad clara y modularidad.

**Estructura recomendada (ITCSS + BEM):**

```
styles/
├── settings/         # Variables CSS, tokens de diseño
│   ├── _colors.css
│   ├── _typography.css
│   └── _spacing.css
├── base/            # Resets y estilos base
│   ├── _reset.css
│   └── _normalize.css
├── layout/          # Estructura de grid y contenedores
│   ├── _grid.css
│   └── _containers.css
├── components/      # Componentes reutilizables
│   ├── _buttons.css
│   ├── _cards.css
│   ├── _tables.css
│   └── _forms.css
└── utilities/       # Clases de utilidad
    └── _helpers.css
```

Utiliza metodologías como BEM para nombrar clases de manera semántica, y organiza archivos según SMACSS para separar concerns: Base, Layout, Modules, States y Theme.

**Ejemplo práctico:**
```css
/* BEM para componentes de tracking */
.tracking-card { }
.tracking-card__header { }
.tracking-card__status { }
.tracking-card__status--delivered { }
.tracking-card__status--in-transit { }
```

### **1.2 Design Tokens y Variables CSS**

Los design tokens son unidades centrales que almacenan atributos visuales como color, tipografía y espaciado de forma reutilizable, asegurando coherencia visual y escalabilidad.

**Sistema de tokens para logística:**

```css
:root {
  /* Color Tokens - Semantic approach */
  --color-primary: #1a73e8;
  --color-success: #34a853;
  --color-warning: #fbbc04;
  --color-error: #ea4335;
  --color-info: #4285f4;
  
  /* Status colors específicos para logística */
  --color-status-pending: #fbbc04;
  --color-status-in-transit: #4285f4;
  --color-status-delivered: #34a853;
  --color-status-delayed: #ea4335;
  --color-status-canceled: #5f6368;
  
  /* Spacing scale (8pt grid) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Typography scale (Major Second 1.125) */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 32px;
}
```

---

## **PARTE 2: SISTEMA DE COLOR Y PALETAS**

### **2.1 Paletas de Color para Dashboards Empresariales**

Los dashboards profesionales utilizan paletas que evocan confianza y estabilidad, con azul y verde como colores principales, mientras que rojo y naranja señalan urgencia o alertas.

**Paleta Principal para Logística (Light Mode):**
```css
:root {
  /* Primary palette - Blues for trust & professionalism */
  --color-primary-50: #e8f0fe;
  --color-primary-100: #d2e3fc;
  --color-primary-500: #1a73e8;
  --color-primary-700: #1967d2;
  --color-primary-900: #174ea6;
  
  /* Neutrals - High contrast for data density */
  --color-neutral-50: #f8f9fa;
  --color-neutral-100: #f1f3f4;
  --color-neutral-200: #e8eaed;
  --color-neutral-500: #9aa0a6;
  --color-neutral-700: #5f6368;
  --color-neutral-900: #202124;
  
  /* Semantic colors */
  --color-success: #34a853;
  --color-warning: #fbbc04;
  --color-error: #ea4335;
  
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-elevated: #ffffff;
}
```

Para dashboards de negocio, usa paletas con colores profesionales que faciliten la visualización de datos, evitando saturación excesiva y priorizando paletas seguras para daltonismo.

**Dark Mode (crítico para usuarios en campo):**
```css
[data-theme="dark"] {
  --color-primary-500: #8ab4f8;
  --bg-primary: #202124;
  --bg-secondary: #292a2d;
  --bg-elevated: #35363a;
  --color-neutral-900: #e8eaed;
  --color-neutral-700: #9aa0a6;
}
```

### **2.2 Paleta para Visualización de Datos**

Crea paletas visualmente equidistantes usando escalas de color especializadas, esencial para gráficos y mapas donde los usuarios necesitan distinguir fácilmente entre categorías.

```css
:root {
  /* Data visualization - 8 distinct colors */
  --data-color-1: #1a73e8;
  --data-color-2: #34a853;
  --data-color-3: #fbbc04;
  --data-color-4: #ea4335;
  --data-color-5: #9334e6;
  --data-color-6: #ff6d01;
  --data-color-7: #46bdc6;
  --data-color-8: #7baaf7;
}
```

---

## **PARTE 3: TIPOGRAFÍA Y JERARQUÍA**

### **3.1 Sistema Tipográfico Escalable**

Los sistemas tipográficos deben establecerse temprano, ya que el texto puede representar 85-90% de una pantalla. Usa escalas modulares como "Major Second" (1.125) con 14-16px base para aplicaciones densas en datos.

**Configuración tipográfica para logística:**

```css
:root {
  /* Font families */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 
                  'Segoe UI', Helvetica, Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  
  /* Typographic scale - Major Second (1.125) */
  --font-size-xs: 12px;      /* Labels, helper text */
  --font-size-sm: 14px;      /* Body copy, form inputs */
  --font-size-base: 16px;    /* Primary body */
  --font-size-lg: 18px;      /* Subheadings */
  --font-size-xl: 20px;      /* Card titles */
  --font-size-2xl: 24px;     /* Section headings */
  --font-size-3xl: 32px;     /* Page titles */
  
  /* Line heights - WCAG compliant */
  --line-height-tight: 1.25;  /* Headings */
  --line-height-base: 1.5;    /* Body text (150%) */
  --line-height-relaxed: 1.75; /* Long-form content */
  
  /* Font weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Letter spacing */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
}
```

Para body text en móvil, usa mínimo 16px para evitar strain visual. Los headings requieren line-height más ajustado (120-130%) mientras que body text necesita 150% según WCAG.

**Clases de utilidad tipográfica:**

```css
/* Semantic type styles */
.text-display {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.text-heading-1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.text-heading-2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.text-body {
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

.text-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.text-caption {
  font-size: var(--font-size-xs);
  line-height: var(--line-height-base);
  color: var(--color-neutral-700);
}
```

---

## **PARTE 4: COMPONENTES ESPECÍFICOS PARA LOGÍSTICA**

### **4.1 Tablas de Datos (Data Tables)**

Las tablas modernas requieren diseño minimalista, evitando exceso de colores. Usa zebra striping, hover states claros y headers fijos para grandes datasets.

**Tabla optimizada para logística:**

```css
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Fixed header con shadow al scroll */
.data-table__header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-secondary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.data-table__header-cell {
  padding: 12px 16px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-neutral-700);
  text-align: left;
  white-space: nowrap;
}

/* Zebra striping para legibilidad */
.data-table__row:nth-child(even) {
  background: var(--color-neutral-50);
}

/* Hover state prominente */
.data-table__row:hover {
  background: var(--color-primary-50);
  cursor: pointer;
  transition: background 150ms ease;
}

.data-table__cell {
  padding: 16px;
  font-size: var(--font-size-sm);
  border-bottom: 1px solid var(--color-neutral-200);
  vertical-align: middle;
}

/* Columnas numéricas alineadas a derecha */
.data-table__cell--numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}

/* Estado activo/seleccionado */
.data-table__row--selected {
  background: var(--color-primary-100);
  border-left: 4px solid var(--color-primary-500);
}

/* Responsive: colapsar a cards en móvil */
@media (max-width: 768px) {
  .data-table__header {
    display: none;
  }
  
  .data-table__row {
    display: block;
    margin-bottom: var(--space-md);
    border: 1px solid var(--color-neutral-200);
    border-radius: 8px;
  }
  
  .data-table__cell {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
  }
  
  .data-table__cell::before {
    content: attr(data-label);
    font-weight: var(--font-weight-semibold);
    color: var(--color-neutral-700);
  }
}
```

### **4.2 Cards de Tracking y Estado**

Los cards modernos usan diseño minimalista con borders sutiles, shadows elevados y backgrounds redondeados. Para tracking, incluye visualización clara del estado con iconos y timeline.

```css
.tracking-card {
  background: var(--bg-elevated);
  border-radius: 12px;
  padding: var(--space-lg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1), 
              0 1px 2px rgba(0,0,0,0.06);
  transition: box-shadow 200ms ease, transform 200ms ease;
}

.tracking-card:hover {
  box-shadow: 0 10px 15px rgba(0,0,0,0.1), 
              0 4px 6px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.tracking-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-neutral-200);
}

.tracking-card__id {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  color: var(--color-neutral-900);
}

/* Status badge con colores semánticos */
.tracking-card__status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.tracking-card__status--pending {
  background: #fff4e5;
  color: #663c00;
}

.tracking-card__status--in-transit {
  background: #e3f2fd;
  color: #0d47a1;
}

.tracking-card__status--delivered {
  background: #e8f5e9;
  color: #1b5e20;
}

.tracking-card__status--delayed {
  background: #ffebee;
  color: #b71c1c;
}

/* Timeline vertical */
.tracking-timeline {
  position: relative;
  padding-left: var(--space-xl);
  margin: var(--space-lg) 0;
}

.tracking-timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-neutral-200);
}

.tracking-timeline__item {
  position: relative;
  padding-bottom: var(--space-lg);
}

.tracking-timeline__item::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-neutral-200);
  border: 3px solid var(--bg-primary);
  z-index: 1;
}

.tracking-timeline__item--active::before {
  background: var(--color-primary-500);
  box-shadow: 0 0 0 4px var(--color-primary-100);
}

.tracking-timeline__item--completed::before {
  background: var(--color-success);
}
```

### **4.3 Formularios Modernos**

Los formularios CSS modernos deben ser simples, funcionales y recolectar información sin frustrar al usuario. Incluye validación visual clara, labels flotantes y feedback instantáneo.

```css
.form-group {
  position: relative;
  margin-bottom: var(--space-lg);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: var(--font-size-base);
  font-family: var(--font-primary);
  color: var(--color-neutral-900);
  background: var(--bg-primary);
  border: 2px solid var(--color-neutral-300);
  border-radius: 8px;
  transition: all 200ms ease;
  outline: none;
}

.form-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.form-input:disabled {
  background: var(--color-neutral-100);
  color: var(--color-neutral-500);
  cursor: not-allowed;
}

/* Estados de validación */
.form-input--error {
  border-color: var(--color-error);
}

.form-input--error:focus {
  box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.15);
}

.form-input--success {
  border-color: var(--color-success);
}

.form-label {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-900);
}

.form-label--required::after {
  content: '*';
  color: var(--color-error);
  margin-left: 4px;
}

.form-hint {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-neutral-700);
}

.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-error);
}

/* Select mejorado */
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6368' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}
```

---

## **PARTE 5: RESPONSIVE DESIGN Y MOBILE-FIRST**

### **5.1 Estrategia Mobile-First**

El diseño mobile-first prioriza dispositivos móviles primero, reconociendo que más del 60% del tráfico web proviene de móviles. Usa min-width media queries para escalar hacia pantallas más grandes.

**Breakpoints modernos:**

```css
:root {
  /* Breakpoints semánticos */
  --breakpoint-sm: 640px;   /* Teléfonos grandes */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Pantallas grandes */
}

/* Base: Mobile (0-639px) */
.container {
  width: 100%;
  padding: 0 var(--space-md);
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

/* Tablet y superior */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
    margin: 0 auto;
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-lg);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
  
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Wide desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
  
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-xl);
  }
}
```

### **5.2 Container Queries (Técnica Avanzada 2025)**

Container queries permiten que componentes respondan al tamaño de su contenedor padre, no solo al viewport, desbloqueando verdadera flexibilidad de layout.

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: var(--space-md);
}

/* Cuando el contenedor es > 400px */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: var(--space-lg);
    padding: var(--space-lg);
  }
  
  .card__image {
    aspect-ratio: 1;
  }
}

/* Cuando el contenedor es > 600px */
@container card (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}
```

---

## **PARTE 6: ANIMACIONES Y MICRO-INTERACCIONES**

### **6.1 Principios de Animación Moderna**

Las micro-interacciones son animaciones sutiles que responden a acciones del usuario. En 2025, deben ser inteligentes, personalizadas y proporcionar feedback instantáneo sin afectar el performance.

**Configuración de animaciones:**

```css
:root {
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
  
  /* Easing functions */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Micro-interacción en botones */
.button {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast) var(--ease-out);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.button:active {
  transform: translateY(0);
  transition-duration: var(--duration-instant);
}

/* Ripple effect */
.button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  transform: translate(-50%, -50%);
  transition: width var(--duration-base) var(--ease-out),
              height var(--duration-base) var(--ease-out);
}

.button:active::after {
  width: 200px;
  height: 200px;
}

/* Loading states */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-200) 25%,
    var(--color-neutral-100) 50%,
    var(--color-neutral-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Status transitions suaves */
.status-badge {
  transition: all var(--duration-base) var(--ease-spring);
}

.status-badge[data-status="delivered"] {
  animation: successPulse 600ms var(--ease-spring);
}

@keyframes successPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
```

### **6.2 Performance y Accesibilidad**

Las animaciones deben respetar prefers-reduced-motion para usuarios sensibles al movimiento, y usar propiedades GPU-accelerated (transform, opacity) para 60fps consistentes.

```css
/* Respetar preferencias de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Optimizar para GPU */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Eliminar will-change después de animación */
.animated-element.animation-complete {
  will-change: auto;
}
```

---

## **PARTE 7: PATTERNS ESPECÍFICOS PARA LOGÍSTICA**

### **7.1 Dashboard Layout**

Los dashboards de logística requieren layouts que prioricen visualización de datos en tiempo real, seguimiento de envíos y métricas operacionales con jerarquía clara.

```css
.dashboard {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  height: 100vh;
  background: var(--bg-secondary);
}

.dashboard__sidebar {
  grid-area: sidebar;
  background: var(--bg-primary);
  border-right: 1px solid var(--color-neutral-200);
  overflow-y: auto;
}

.dashboard__header {
  grid-area: header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xl);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--color-neutral-200);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.dashboard__main {
  grid-area: main;
  padding: var(--space-xl);
  overflow-y: auto;
}

/* Grid de widgets */
.dashboard__widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

/* Responsive: mobile stacked */
@media (max-width: 1024px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main";
  }
  
  .dashboard__sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    transition: left var(--duration-base) var(--ease-out);
    z-index: 1000;
  }
  
  .dashboard__sidebar--open {
    left: 0;
    box-shadow: 0 0 24px rgba(0,0,0,0.2);
  }
}
```

### **7.2 Map Integration**

```css
.map-container {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-neutral-100);
}

.map-overlay {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  right: var(--space-md);
  background: var(--bg-elevated);
  border-radius: 8px;
  padding: var(--space-md);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  backdrop-filter: blur(8px);
  z-index: 10;
}

/* Markers en mapa */
.map-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary-500);
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out);
}

.map-marker:hover {
  transform: scale(1.2);
  z-index: 100;
}

.map-marker--active {
  background: var(--color-success);
  animation: markerPulse 2s infinite;
}

@keyframes markerPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  }
  50% {
    box-shadow: 0 2px 8px rgba(0,0,0,0.25),
                0 0 0 8px rgba(26, 115, 232, 0.3);
  }
}
```

---

## **RESUMEN DE MEJORES PRÁCTICAS**

### **Arquitectura:**
- Usa ITCSS + BEM para organización escalable
- Implementa design tokens para consistencia
- Aprovecha CSS moderno: container queries, cascade layers, custom properties

### **Color:**
- Paletas semánticas basadas en azul/verde para confianza
- Dark mode obligatorio para usuarios en campo
- Colores accesibles (WCAG AA mínimo, AAA ideal)

### **Tipografía:**
- Sistema de escala modular (Major Second 1.125)
- 16px mínimo en móvil, line-height 1.5 para body
- Usa tabular-nums para datos numéricos

### **Componentes:**
- Tablas con fixed headers, zebra striping, responsive cards en móvil
- Cards elevados con shadows sutiles y hover states
- Formularios con validación visual instantánea

### **Responsive:**
- Mobile-first con min-width media queries
- Container queries para componentes verdaderamente modulares
- Breakpoints: 640, 768, 1024, 1280, 1536px

### **Performance:**
- Animaciones GPU-accelerated (transform, opacity)
- Respeta prefers-reduced-motion
- Lazy load offscreen content
- Micro-interacciones < 300ms

Este sistema proporciona una base sólida, escalable y moderna para cualquier aplicación de logística profesional en 2025. 🚀