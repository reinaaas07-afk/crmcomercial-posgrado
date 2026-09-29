import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Phone,
  Shield,
  KeyRound,
  UserCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { UsuarioDB, RolUsuario } from '../../types/schema';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (user: UsuarioDB) => void;
  userToEdit?: UsuarioDB | null;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSaveUser,
  userToEdit,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [telefono, setTelefono] = useState('+1 809-');
  const [password, setPassword] = useState('ITHOT2026*');
  const [rol, setRol] = useState<RolUsuario>('Ejecutivo Comercial');
  const [subcuenta, setSubcuenta] = useState('ITHOT Sede Principal');
  const [activo, setActivo] = useState(true);
  const [empresa, setEmpresa] = useState('ITHOT');

  useEffect(() => {
    if (userToEdit) {
      setNombre(userToEdit.nombre || '');
      setApellido(userToEdit.apellido || '');
      setEmail(userToEdit.email || '');
      setUsuario(userToEdit.usuario || '');
      setTelefono(userToEdit.telefono || '+1 809-');
      setPassword(userToEdit.password_plain || '••••••••');
      setRol(userToEdit.rol || 'Ejecutivo Comercial');
      setSubcuenta(userToEdit.subcuenta || 'ITHOT Sede Principal');
      setActivo(userToEdit.activo ?? true);
      setEmpresa(userToEdit.empresa || 'ITHOT');
    } else {
      setNombre('');
      setApellido('');
      setEmail('');
      setUsuario('');
      setTelefono('+1 809-');
      setPassword('ITHOT2026*');
      setRol('Ejecutivo Comercial');
      setSubcuenta('ITHOT Sede Principal');
      setActivo(true);
      setEmpresa('ITHOT');
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      alert('Por favor completa el Nombre y el Correo electrónico.');
      return;
    }

    const newUser: UsuarioDB = {
      id: userToEdit?.id || Date.now(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      usuario: usuario.trim() || email.split('@')[0],
      password_hash: '$2b$12$ITHOT_BCRYPT_SECURE_HASH...',
      password_plain: password || 'ITHOT2026*',
      rol,
      telefono: telefono.trim(),
      activo,
      fecha_creacion: userToEdit?.fecha_creacion || new Date().toISOString().replace('T', ' ').slice(0, 19),
      ultimo_acceso: userToEdit?.ultimo_acceso || new Date().toISOString().replace('T', ' ').slice(0, 19),
      empresa,
      subcuenta,
    };

    onSaveUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {userToEdit ? 'Editar Usuario Comercial' : 'Crear Nuevo Usuario (ITHOT)'}
              </h3>
              <p className="text-xs text-slate-400">
                Gestión de usuarios y asignación de roles para el equipo de ventas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Mateo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Apellido
              </label>
              <input
                type="text"
                placeholder="Ej. Silva"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Correo Electrónico <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="usuario@ithot.com.do"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Teléfono Directo (RD)
              </label>
              <input
                type="text"
                placeholder="+1 809-567-8900"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre de Usuario (Login)
              </label>
              <input
                type="text"
                placeholder="Ej. msilva"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="ITHOT2026*"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Rol en el Sistema
              </label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as RolUsuario)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Administrador General">Administrador General</option>
                <option value="Administrador">Administrador</option>
                <option value="Supervisor Comercial">Supervisor Comercial</option>
                <option value="Ejecutivo Comercial">Ejecutivo Comercial</option>
                <option value="Analista Comercial">Analista Comercial</option>
                <option value="Consulta">Consulta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Estado del Usuario
              </label>
              <select
                value={activo ? 'true' : 'false'}
                onChange={(e) => setActivo(e.target.value === 'true')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subcuenta Asignada (ITHOT)
              </label>
              <select
                value={subcuenta}
                onChange={(e) => setSubcuenta(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ITHOT Sede Principal">ITHOT Sede Principal (Santo Domingo)</option>
                <option value="ITHOT Sucursal Cibao">ITHOT Sucursal Cibao (Santiago)</option>
                <option value="ITHOT Sucursal Este (Turística)">ITHOT Sucursal Este (Punta Cana)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Empresa Matriz
              </label>
              <input
                type="text"
                value={empresa}
                readOnly
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-400 font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>{userToEdit ? 'Guardar Cambios' : 'Registrar Usuario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
