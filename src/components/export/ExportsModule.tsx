import React, { useState } from 'react';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Download,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  PhoneCall,
  BarChart3,
  Users,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ContactoDB,
  ProspectoDB,
  SeguimientoDB,
  HistorialExportacionDB,
  UsuarioDB,
  EtapaPipelineDB,
} from '../../types/schema';

interface ExportsModuleProps {
  contactos?: ContactoDB[];
  prospectos: ProspectoDB[];
  seguimientos: SeguimientoDB[];
  etapas: EtapaPipelineDB[];
  usuarios: UsuarioDB[];
  historialExportaciones: HistorialExportacionDB[];
  onAddHistorialExportacion: (historial: HistorialExportacionDB) => void;
  currentUser: UsuarioDB;
}

export const ExportsModule: React.FC<ExportsModuleProps> = ({
  contactos = [],
  prospectos,
  seguimientos,
  etapas,
  usuarios,
  historialExportaciones,
  onAddHistorialExportacion,
  currentUser,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<
    'Contactos' | 'Prospectos' | 'Pipeline' | 'Seguimientos' | 'Reportes'
  >('Contactos');

  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [lastExportedNotice, setLastExportedNotice] = useState<string | null>(null);

  // Helper to get formatted data array
  const getExportData = () => {
    const etapasMap = new Map(etapas.map((e) => [e.id, e.nombre]));
    const usuariosMap = new Map(usuarios.map((u) => [u.id, u.nombre]));
    const prospectosMap = new Map(prospectos.map((p) => [p.id, p.empresa]));

    switch (selectedTarget) {
      case 'Contactos':
        return contactos.map((c) => ({
          ID: c.id,
          Nombre: c.nombre,
          Apellido: c.apellido,
          Empresa: c.empresa,
          Cargo: c.cargo,
          Email: c.email,
          Teléfono_RD: c.telefono,
          WhatsApp_RD: c.whatsapp,
          Ciudad: c.ciudad,
          Provincia: c.provincia,
          Naturaleza_Negocio: c.naturaleza_negocio,
          Solución_ITHOT: c.producto_interes,
          Módulo_Interés: c.modulo_interes,
          Responsable: usuariosMap.get(c.usuario_id) || 'Ing. Yenifer Sena',
          Estado_Comercial: c.estado_comercial,
          Fecha_Registro: c.fecha_registro,
          Última_Interacción: c.ultima_interaccion,
          Próximo_Seguimiento: c.proximo_seguimiento || 'Sin fecha',
          Etiquetas: c.etiquetas,
          Observaciones: c.observaciones,
        }));

      case 'Prospectos':
        return prospectos.map((p) => ({
          ID: p.id,
          Nombre: p.nombre,
          Apellido: p.apellido,
          Empresa: p.empresa,
          Cargo: p.cargo,
          Email: p.email,
          Teléfono: p.telefono,
          WhatsApp: p.whatsapp,
          Fuente: p.fuente,
          Etapa: etapasMap.get(p.etapa_id) || 'N/A',
          Asesor_Asignado: usuariosMap.get(p.usuario_id) || 'N/A',
          Valor_USD: p.valor_estimado,
          Fecha_Registro: p.fecha_registro,
          Próximo_Seguimiento: p.fecha_proximo_seguimiento || 'Sin fecha',
          Notas: p.notas,
          Etiquetas: p.etiquetas,
        }));

      case 'Pipeline':
        return prospectos.map((p) => ({
          ID_Prospecto: p.id,
          Empresa: p.empresa,
          Contacto: `${p.nombre} ${p.apellido}`,
          Etapa_Comercial: etapasMap.get(p.etapa_id) || 'N/A',
          Valor_Oportunidad_USD: p.valor_estimado,
          Responsable: usuariosMap.get(p.usuario_id) || 'N/A',
          Fecha_Seguimiento: p.fecha_proximo_seguimiento || 'Sin fecha',
        }));

      case 'Seguimientos':
        return seguimientos.map((s) => ({
          ID_Seguimiento: s.id,
          ID_Prospecto: s.prospecto_id,
          Empresa: prospectosMap.get(s.prospecto_id) || 'N/A',
          Asesor: usuariosMap.get(s.usuario_id) || 'N/A',
          Canal: s.canal,
          Resultado: s.resultado,
          Fecha_Hora: s.fecha_hora,
          Observaciones: s.observaciones,
          Próxima_Acción: s.proxima_accion || '—',
          Fecha_Próxima_Acción: s.fecha_proxima_accion || '—',
        }));

      case 'Reportes':
        return usuarios.map((u) => {
          const uProspectos = prospectos.filter((p) => p.usuario_id === u.id);
          const uGanados = uProspectos.filter((p) => p.etapa_id === 7).length;
          const uPerdidos = uProspectos.filter((p) => p.etapa_id === 8).length;
          const uMonto = uProspectos.reduce((a, b) => a + b.valor_estimado, 0);

          return {
            Asesor: u.nombre,
            Rol: u.rol,
            Prospectos_Asignados: uProspectos.length,
            Ganados: uGanados,
            Perdidos: uPerdidos,
            Volumen_USD: uMonto,
            Tasa_Conversion_Porc: uProspectos.length > 0 ? ((uGanados / uProspectos.length) * 100).toFixed(1) : '0',
          };
        });
    }
  };

  const handleExecuteExport = () => {
    const data = getExportData();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const filenameBase = `crmcomercial_${selectedTarget.toLowerCase()}_${dateStr}`;

    if (selectedFormat === 'pdf') {
      setShowPdfModal(true);
      // Log to audit
      const auditRecord: HistorialExportacionDB = {
        id: Date.now(),
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().slice(0, 5),
        usuario: currentUser.nombre,
        archivo_generado: `${filenameBase}.pdf`,
        tipo: selectedTarget,
        formato: 'PDF (.pdf)',
        cantidad_registros: data.length,
      };
      onAddHistorialExportacion(auditRecord);
      setLastExportedNotice(`Generando visualización previa de ${filenameBase}.pdf`);
      return;
    }

    if (selectedFormat === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, selectedTarget);
      XLSX.writeFile(wb, `${filenameBase}.xlsx`);

      const auditRecord: HistorialExportacionDB = {
        id: Date.now(),
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().slice(0, 5),
        usuario: currentUser.nombre,
        archivo_generado: `${filenameBase}.xlsx`,
        tipo: selectedTarget,
        formato: 'Excel (.xlsx)',
        cantidad_registros: data.length,
      };
      onAddHistorialExportacion(auditRecord);
      setLastExportedNotice(`Archivo ${filenameBase}.xlsx descargado con éxito (${data.length} registros).`);
    } else if (selectedFormat === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data);
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenameBase}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      const auditRecord: HistorialExportacionDB = {
        id: Date.now(),
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().slice(0, 5),
        usuario: currentUser.nombre,
        archivo_generado: `${filenameBase}.csv`,
        tipo: selectedTarget,
        formato: 'CSV (.csv)',
        cantidad_registros: data.length,
      };
      onAddHistorialExportacion(auditRecord);
      setLastExportedNotice(`Archivo ${filenameBase}.csv descargado con éxito (${data.length} registros).`);
    }
  };

  const previewData = getExportData();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
          <FileDown className="w-4 h-4" />
          <span>Módulo Oficial de Extracción y Respaldo de Información</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Módulo de Exportaciones
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Generación de archivos descargables en formatos Microsoft Excel (.xlsx), texto delimitado (.csv) y reportes ejecutivos en PDF.
        </p>
      </div>

      {/* Target Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { id: 'Contactos', label: 'Contactos', icon: Users, count: contactos.length, desc: 'Directorio de empresas y personas' },
          { id: 'Prospectos', label: 'Prospectos', icon: Users, count: prospectos.length, desc: 'Base completa con datos de contacto' },
          { id: 'Pipeline', label: 'Pipeline', icon: Layers, count: prospectos.length, desc: 'Oportunidades en 8 etapas' },
          { id: 'Seguimientos', label: 'Seguimientos', icon: PhoneCall, count: seguimientos.length, desc: 'Bitácora multicanal inmutable' },
          { id: 'Reportes', label: 'Reportes', icon: BarChart3, count: usuarios.length, desc: 'Métricas y tasas de conversión' },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedTarget === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedTarget(item.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {item.count} reg.
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">{item.label}</h4>
              <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Format Selector & Download Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              1. Selecciona el Formato de Salida para {selectedTarget}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Elige el formato de archivo deseado y presiona el botón para descargar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
              { id: 'csv', label: 'CSV (.csv)', icon: Download },
              { id: 'pdf', label: 'PDF (.pdf)', icon: FileText },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedFormat === fmt.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <fmt.icon className="w-3.5 h-3.5" />
                <span>{fmt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Registros a exportar: <strong className="text-white">{previewData.length}</strong> · Formato:{' '}
            <strong className="text-emerald-400 font-bold uppercase">{selectedFormat}</strong>
          </div>

          <button
            onClick={handleExecuteExport}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Generar y Descargar Archivo</span>
          </button>
        </div>

        {lastExportedNotice && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lastExportedNotice}</span>
          </div>
        )}
      </div>

      {/* HISTORIAL DE EXPORTACIONES (AUDITORÍA) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-2">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              Historial de Auditoría de Exportaciones
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {historialExportaciones.length} descargas registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Archivo Generado</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Formato</th>
                <th className="py-3 px-4 text-right">Cantidad de Registros</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {historialExportaciones.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {h.fecha} <span className="text-slate-500">{h.hora}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{h.usuario}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 truncate max-w-[240px]">
                    {h.archivo_generado}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{h.tipo}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{h.formato}</td>
                  <td className="py-3 px-4 text-right font-mono text-white font-bold">
                    {h.cantidad_registros}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Modal Preview */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-xs uppercase font-mono font-bold text-blue-600 tracking-wider">
                  Informe Oficial de Gestión Comercial · Posgrado
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                  CRMComercial · Reporte de {selectedTarget}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generado por: <strong className="text-slate-800">{currentUser.nombre}</strong> ({currentUser.rol})
                </p>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border">
                <span className="text-[11px] text-slate-500 block">Total Registros</span>
                <span className="text-xl font-bold text-slate-800 font-mono">{previewData.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border">
                <span className="text-[11px] text-slate-500 block">Tipo de Contenido</span>
                <span className="text-xl font-bold text-blue-600 font-mono">{selectedTarget}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border">
                <span className="text-[11px] text-slate-500 block">Fecha de Emisión</span>
                <span className="text-xl font-bold text-emerald-600 font-mono">
                  {new Date().toISOString().split('T')[0]}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Detalle de Registros Incluidos ({previewData.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-[300px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      {previewData.length > 0 &&
                        Object.keys(previewData[0]).slice(0, 6).map((col) => (
                          <th key={col} className="p-2 font-mono text-[11px] uppercase">
                            {col}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewData.slice(0, 15).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).slice(0, 6).map((val: any, cIdx) => (
                          <td key={cIdx} className="p-2 text-slate-800 font-mono text-[11px]">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Auditoría de integridad validada en base de datos MySQL 8.0</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Imprimir / Guardar en PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
