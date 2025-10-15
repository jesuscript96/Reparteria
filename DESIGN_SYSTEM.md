# Sistema de Diseño - Rutas Delivery

Sistema de diseño completo implementado para la aplicación de logística y gestión de rutas de entrega, basado en las mejores prácticas 2025 para dashboards empresariales.

## 📁 Estructura de Archivos

```
src/
├── styles/
│   └── design-tokens.css          # Variables CSS globales
├── app/
│   └── globals.css                # Estilos base y utilidades
└── components/
    └── logistics/                 # Componentes específicos de logística
        ├── status-badge.tsx       # Badges de estado
        ├── page-header.tsx        # Headers de página
        ├── stat-card.tsx          # Tarjetas de métricas
        ├── tracking-card.tsx      # Tarjetas de seguimiento
        ├── empty-state.tsx        # Estados vacíos
        ├── data-table.tsx         # Tablas de datos
        └── index.ts               # Exports centralizados
```

## 🎨 Design Tokens

### Colores

**Paleta Principal (Blues para confianza y profesionalismo):**
```css
--color-primary-50: #e8f0fe;
--color-primary-500: #1a73e8;
--color-primary-900: #174ea6;
```

**Colores Semánticos:**
```css
--color-success: #34a853;  /* Entregas exitosas */
--color-warning: #fbbc04;  /* Pendientes */
--color-error: #ea4335;    /* Errores/retrasos */
--color-info: #4285f4;     /* En tránsito */
```

**Colores de Estado (específicos para logística):**
```css
--color-status-pending: var(--color-warning);
--color-status-in-transit: var(--color-info);
--color-status-delivered: var(--color-success);
--color-status-delayed: var(--color-error);
--color-status-canceled: var(--color-neutral-500);
```

### Espaciado (8pt Grid System)

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
--space-4xl: 96px;
```

### Tipografía (Major Second 1.125)

**Font Families:**
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace;
```

**Font Sizes:**
```css
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 32px;
--font-size-4xl: 40px;
```

**Line Heights (WCAG compliant):**
```css
--line-height-tight: 1.25;   /* Para headings */
--line-height-base: 1.5;     /* Para body text */
--line-height-relaxed: 1.75; /* Para contenido largo */
```

### Animaciones

```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-base: 300ms;
--duration-slow: 500ms;

--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

## 🧩 Componentes de Logística

### StatusBadge

Muestra el estado de una entrega con colores semánticos.

```tsx
import { StatusBadge } from '@/components/logistics'

<StatusBadge status="delivered" />
<StatusBadge status="in-transit" />
<StatusBadge status="pending" />
<StatusBadge status="delayed" />
<StatusBadge status="canceled" />
```

### PageHeader

Header consistente para páginas de dashboard.

```tsx
import { PageHeader } from '@/components/logistics'

<PageHeader
  title="Entregas del Día"
  description="Gestiona y monitorea todas las entregas programadas"
  actions={
    <Button>Nueva Entrega</Button>
  }
/>
```

### StatCard

Tarjeta para mostrar métricas y estadísticas clave.

```tsx
import { StatCard } from '@/components/logistics'
import { Package } from 'lucide-react'

<StatCard
  title="Entregas Totales"
  value="1,234"
  description="En el último mes"
  icon={Package}
  trend={{ value: 12.5, label: "vs mes anterior" }}
/>
```

### TrackingCard

Tarjeta completa de seguimiento con timeline.

```tsx
import { TrackingCard } from '@/components/logistics'

<TrackingCard
  deliveryId="DEL-2024-001"
  status="in-transit"
  customerName="Juan Pérez"
  customerAddress="Av. Principal 123, Santiago"
  estimatedDelivery="Hoy, 15:00"
  events={[
    { timestamp: "14:30", description: "En camino", isCompleted: true },
    { timestamp: "10:00", description: "Salió del almacén", location: "Centro de Distribución", isCompleted: true }
  ]}
  onClick={() => console.log('Ver detalles')}
/>
```

### DataTable

Tabla optimizada para grandes volúmenes de datos.

```tsx
import { DataTable } from '@/components/logistics'

<DataTable
  data={deliveries}
  columns={[
    { key: 'id', header: 'ID', render: (item) => <span className="text-mono">{item.id}</span> },
    { key: 'customer', header: 'Cliente' },
    { key: 'status', header: 'Estado', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'date', header: 'Fecha', align: 'right' }
  ]}
  onRowClick={(delivery) => handleViewDelivery(delivery)}
/>
```

### EmptyState

Estado vacío con mensaje y acción opcional.

```tsx
import { EmptyState } from '@/components/logistics'
import { Package } from 'lucide-react'

<EmptyState
  icon={Package}
  title="No hay entregas"
  description="Todavía no has creado ninguna entrega. Comienza agregando tu primera entrega."
  action={{
    label: "Crear Entrega",
    onClick: () => handleCreateDelivery()
  }}
/>
```

## 🎨 Utility Classes

### Typography

```css
.text-display      /* 40px, bold - Títulos principales */
.text-heading-1    /* 32px, semibold - H1 */
.text-heading-2    /* 24px, semibold - H2 */
.text-heading-3    /* 20px, semibold - H3 */
.text-body         /* 16px - Texto principal */
.text-body-sm      /* 14px - Texto secundario */
.text-label        /* 14px, uppercase - Labels */
.text-caption      /* 12px - Texto pequeño */
.text-mono         /* Monospace para IDs/códigos */
```

### Badges

```css
.badge             /* Badge base */
.badge-pending     /* Estado: Pendiente */
.badge-in-transit  /* Estado: En tránsito */
.badge-delivered   /* Estado: Entregado */
.badge-delayed     /* Estado: Retrasado */
.badge-canceled    /* Estado: Cancelado */
```

### Cards

```css
.card              /* Card básico con sombra */
.card-hover        /* Card con efecto hover */
.card-interactive  /* Card clickeable con animación */
```

### Layout

```css
.container-app     /* Contenedor principal responsivo */
.grid-dashboard    /* Grid para widgets de dashboard */
```

### Animaciones

```css
.animate-fade-in         /* Fade in con slide up */
.animate-slide-in-right  /* Slide in desde derecha */
.skeleton                /* Loading skeleton shimmer */
```

### Utilidades

```css
.truncate-2-lines   /* Truncar texto a 2 líneas */
.truncate-3-lines   /* Truncar texto a 3 líneas */
.scrollbar-thin     /* Scrollbar delgado personalizado */
```

## 🌓 Dark Mode

El sistema incluye soporte completo para dark mode:

```css
[data-theme="dark"] {
  --color-primary-500: #8ab4f8;
  --bg-primary: #202124;
  --bg-secondary: #292a2d;
  --color-neutral-900: #f8f9fa;
}
```

Para activar dark mode:
```html
<html data-theme="dark">
```

## ♿ Accesibilidad

- **Line-height mínimo de 1.5** para texto body (WCAG)
- **Font-size mínimo de 16px** en móvil
- **Focus rings visibles** para navegación con teclado
- **Prefers-reduced-motion** respetado automáticamente
- **Colores con contraste WCAG AA** mínimo

## 📱 Responsive Design

El sistema usa **mobile-first** con breakpoints estándar:

```css
--breakpoint-sm: 640px;   /* Teléfonos grandes */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Pantallas grandes */
```

## 🚀 Uso en Nuevos Componentes

### 1. Usar Design Tokens

```tsx
// ❌ NO hacer esto
<div style={{ color: '#1a73e8', padding: '16px' }}>

// ✅ Hacer esto
<div style={{ color: 'var(--color-primary-500)', padding: 'var(--space-md)' }}>
```

### 2. Usar Utility Classes

```tsx
// ❌ NO hacer esto
<h1 className="text-3xl font-bold text-gray-900">

// ✅ Hacer esto
<h1 className="text-heading-1">
```

### 3. Usar Componentes de Logística

```tsx
// ❌ NO crear badges custom
<span className="px-3 py-1 bg-green-100 text-green-800 rounded">Entregado</span>

// ✅ Usar StatusBadge
<StatusBadge status="delivered" />
```

## 📝 Notas de Implementación

1. **Design tokens** están en `/src/styles/design-tokens.css`
2. **Utilities** están en `/src/app/globals.css` bajo `@layer utilities`
3. **Componentes** reutilizables en `/src/components/logistics/`
4. **Imports** centralizados: `import { StatusBadge, PageHeader } from '@/components/logistics'`

## 🔄 Próximos Pasos

- [ ] Implementar dashboard pages usando los componentes
- [ ] Crear componentes de mapa para tracking en tiempo real
- [ ] Implementar sistema de notificaciones
- [ ] Añadir gráficos y charts con design tokens
- [ ] Crear componentes de formularios avanzados

## 📚 Referencias

- [design.md](./design.md) - Especificaciones completas del sistema
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inter Font](https://rsms.me/inter/) - Tipografía principal
- [Lucide Icons](https://lucide.dev/) - Sistema de iconos
