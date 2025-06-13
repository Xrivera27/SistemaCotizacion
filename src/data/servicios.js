//data/servicios

export const servicios = [
  {
    id: 1,
    nombre: 'Hosting Cloud Básico',
    descripcion: 'Servidor virtual con recursos básicos',
    precioBase: 540, // 45 * 12
    equipos: 'Servidor virtual 2GB RAM, 50GB SSD',
    precioMinimo: 420, // 35 * 12
    precioModerado: 480, // 40 * 12
    precioVenta: 0,
    categoria: 'hosting',
    icon: '☁️'
  },
  {
    id: 2,
    nombre: 'Hosting Cloud Premium',
    descripcion: 'Servidor virtual con alta disponibilidad',
    precioBase: 1020, // 85 * 12
    equipos: 'Servidor virtual 8GB RAM, 200GB SSD, Load Balancer',
    precioMinimo: 840, // 70 * 12
    precioModerado: 960, // 80 * 12
    precioVenta: 0,
    categoria: 'hosting',
    icon: '⚡'
  },
  {
    id: 3,
    nombre: 'Base de Datos Gestionada',
    descripcion: 'MySQL/PostgreSQL con backup automático',
    precioBase: 780, // 65 * 12
    equipos: 'MySQL/PostgreSQL, Backup diario, Replica',
    precioMinimo: 600, // 50 * 12
    precioModerado: 720, // 60 * 12
    precioVenta: 0,
    categoria: 'database',
    icon: '🗄️'
  },
  {
    id: 4,
    nombre: 'CDN Global',
    descripcion: 'Red de distribución de contenido mundial',
    precioBase: 300, // 25 * 12
    equipos: 'CDN con 50+ ubicaciones, Cache inteligente',
    precioMinimo: 240, // 20 * 12
    precioModerado: 276, // 23 * 12
    precioVenta: 0,
    categoria: 'cdn',
    icon: '🌐'
  },
  {
    id: 5,
    nombre: 'Backup Automático',
    descripcion: 'Respaldo diario con retención de 30 días',
    precioBase: 420, // 35 * 12
    equipos: 'Backup automático, Retención 30 días, Restauración rápida',
    precioMinimo: 300, // 25 * 12
    precioModerado: 360, // 30 * 12
    precioVenta: 0,
    categoria: 'backup',
    icon: '💾'
  },
  {
    id: 6,
    nombre: 'Monitoreo 24/7',
    descripcion: 'Supervisión continua con alertas',
    precioBase: 660, // 55 * 12
    equipos: 'Monitoreo 24/7, Alertas SMS/Email, Dashboard',
    precioMinimo: 480, // 40 * 12
    precioModerado: 600, // 50 * 12
    precioVenta: 0,
    categoria: 'monitoring',
    icon: '📊'
  },
  {
    id: 7,
    nombre: 'Balanceador de Carga',
    descripcion: 'Distribución automática de tráfico',
    precioBase: 900, // 75 * 12
    equipos: 'Load Balancer, Auto-scaling, Health checks',
    precioMinimo: 720, // 60 * 12
    precioModerado: 840, // 70 * 12
    precioVenta: 0,
    categoria: 'load-balancer',
    icon: '⚖️'
  },
  {
    id: 8,
    nombre: 'Firewall Avanzado',
    descripcion: 'Protección de seguridad perimetral',
    precioBase: 480, // 40 * 12
    equipos: 'Firewall WAF, DDoS Protection, SSL',
    precioMinimo: 360, // 30 * 12
    precioModerado: 420, // 35 * 12
    precioVenta: 0,
    categoria: 'security',
    icon: '🛡️'
  }
];