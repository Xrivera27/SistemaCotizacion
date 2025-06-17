export const clientes = [
  {
    id: 1,
    nombreEncargado: 'Juan Carlos Pérez',
    telefonoPersonal: '+504 9876-5432',
    telefonoEmpresa: '+504 2234-5678',
    nombreEmpresa: 'TechCorp Honduras',
    documentofiscal: '08011998765432',
    correoPersonal: 'juan.perez@gmail.com',
    correoEmpresa: 'juan.perez@techcorp.hn',
    managerCuenta: 'vendor1', // ID del vendedor que creó el cliente
    fechaCreacion: '2024-01-15'
  },
  {
    id: 2,
    nombreEncargado: 'María Elena Rodríguez',
    telefonoPersonal: '+504 8765-4321',
    telefonoEmpresa: '+504 2345-6789',
    nombreEmpresa: 'Innovate Solutions',
    documentofiscal: '08011987654321',
    correoPersonal: 'maria.rodriguez@hotmail.com',
    correoEmpresa: 'mrodriguez@innovate.hn',
    managerCuenta: 'vendor1',
    fechaCreacion: '2024-02-20'
  },
  {
    id: 3,
    nombreEncargado: 'Roberto Antonio López',
    telefonoPersonal: '+504 7654-3210',
    telefonoEmpresa: '+504 2456-7890',
    nombreEmpresa: 'Digital Growth HN',
    documentofiscal: '08011976543210',
    correoPersonal: 'roberto.lopez@yahoo.com',
    correoEmpresa: 'rlopez@digitalgrowth.hn',
    managerCuenta: 'vendor2',
    fechaCreacion: '2024-03-10'
  }
];

// Simulación de vendedores
export const vendedores = [
  { id: 'vendor1', nombre: 'Carlos Mendoza' },
  { id: 'vendor2', nombre: 'Ana Patricia Silva' },
  { id: 'vendor3', nombre: 'Luis Fernando Castro' }
];

// Para simular el vendedor actual
export const vendedorActual = 'vendor1'; // En el backend esto vendría de la sesión