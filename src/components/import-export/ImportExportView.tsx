import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Lead, User } from '../../types/crm';

interface ImportExportViewProps {
  leads: Lead[];
  onImportLeads: (newLeads: Lead[]) => void;
  users: User[];
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  leads,
  onImportLeads,
  users,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Lead[] | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Sample import batch for 1-click test
  const sampleBatch: Lead[] = [
    {
      id: `lead-imp-${Date.now()}-1`,
      name: 'Mauricio Garza',
      company: 'Logística Monterrey Express',
      email: 'mgarza@monterreyexp.com',
      phone: '+52 81 2233 4455',
      source: 'Google Ads',
      assignedTo: users[2]?.id || 'usr-3',
      assignedToName: users[2]?.name || 'Mateo Silva',
      stage: 'Nuevo Lead',
      createdAt: '2026-09-28',
      nextFollowUpDate: '2026-09-29 11:00',
      estimatedValue: 7500,
      tags: ['Importado', 'Logística'],
      notes: 'Prospecto importado desde base externa de prospectos calificados.',
    },
    {
      id: `lead-imp-${Date.now()}-2`,
      name: 'Sofía Valenzuela',
      company: 'Corporativo Alimentos del Sur',
      email: 'svalenzuela@alimsur.com',
      phone: '+52 55 9988 1122',
      source: 'Sitio Web',
      assignedTo: users[3]?.id || 'usr-4',
      assignedToName: users[3]?.name || 'Camila Herrera',
      stage: 'Nuevo Lead',
      createdAt: '2026-09-28',
      nextFollowUpDate: '2026-09-29 12:30',
      estimatedValue: 16000,
      tags: ['Importado', 'Alimentos'],
      notes: 'Registró interés en el portal web corporativo.',
    },
    {
      id: `lead-imp-${Date.now()}-3`,
      name: 'Gonzalo Navarro',
      company: 'Inmobiliaria Premier',
      email: 'gnavarro@inmopremier.mx',
      phone: '+52 33 5544 3322',
      source: 'LinkedIn',
      assignedTo: users[2]?.id || 'usr-3',
      assignedToName: users[2]?.name || 'Mateo Silva',
      stage: 'Contactado',
      createdAt: '2026-09-28',
      nextFollowUpDate: '2026-09-30 10:00',
      estimatedValue: 11200,
      tags: ['Importado', 'Inmobiliaria'],
      notes: 'Respuesta afirmativa por mensaje directo en LinkedIn.',
    },
  ];

  const handleSimulateFileSelect = () => {
    setPreviewData(sampleBatch);
    setImportStatus('preview');
  };

  const handleConfirmImport = () => {
    if (previewData) {
      onImportLeads(previewData);
      setImportStatus('success');
      setPreviewData(null);
    }
  };

  const handleDownloadCSVTemplate = () => {
    const csvContent =
      'Nombre,Empresa,Email,Telefono,Fuente,ValorEstimadoUSD,Notas\n' +
      '"Ejemplo Juan Pérez","Comercializadora Alfa","juan@empresa.com","+52 55 1234 5678","Sitio Web","8500","Interesado en demo"\n' +
      '"Ejemplo Maria López","Textil del Norte","maria@textil.com","+52 81 8765 4321","Meta Ads","12000","Requiere cotización formal"';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_importacion_prospectos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFullCSV = () => {
    const headers = 'ID,Nombre,Empresa,Email,Telefono,Fuente,Responsable,Etapa,FechaRegistro,ProximoSeguimiento,ValorUSD\n';
    const rows = leads
      .map(
        (l) =>
          `"${l.id}","${l.name}","${l.company}","${l.email}","${l.phone}","${l.source}","${l.assignedToName}","${l.stage}","${l.createdAt}","${l.nextFollowUpDate || ''}","${l.estimatedValue}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `respaldo_completo_crmcomercial_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Importación y Exportación de Prospectos
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Migración masiva de bases de datos externas, respaldo en frío y generación de reportes ejecutivos.
        </p>
      </div>

      {/* Benefits Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg shrink-0">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Migración Rápida</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Carga tus listas de prospectos desde Excel o archivos CSV mapeando columnas en minutos.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Respaldo Integral</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Descarga la base de contactos y su historial comercial completo para archivo o análisis.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compartir Reportes</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Genera reportes ejecutivos en formato imprimible PDF para la dirección general o posgrado.
            </p>
          </div>
        </div>
      </div>

      {/* Two columns: Import section & Export section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IMPORT SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Importar Prospectos (Excel / CSV)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Formatos: .csv, .xlsx</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Puedes cargar una hoja de cálculo con nuevos prospectos para incorporarlos de forma automática al pipeline comercial de CRMComercial.
          </p>

          {/* Drag & Drop Simulation Dropzone */}
          <div
            onClick={handleSimulateFileSelect}
            className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 bg-slate-950/40 hover:bg-slate-950/80 rounded-xl p-6 text-center cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-blue-400 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                Haz clic para simular la carga de un archivo Excel / CSV
              </span>
              <span className="text-[11px] text-slate-400">
                Se cargará un lote de muestra con 3 prospectos B2B para validación inmediata
              </span>
            </div>
          </div>

          {/* Download Template button */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400">¿Necesitas la estructura estándar?</span>
            <button
              onClick={handleDownloadCSVTemplate}
              className="text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>

          {/* Success Alert */}
          {importStatus === 'success' && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡Lote de prospectos importado con éxito en el sistema!</span>
            </div>
          )}

          {/* Preview Table if file selected */}
          {previewData && (
            <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Vista Previa ({previewData.length} registros listos)</span>
                <span className="text-[11px] text-blue-400 font-mono">Mapeo automático OK</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {previewData.map((l) => (
                  <div key={l.id} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <div>
                      <span className="font-semibold text-white">{l.name}</span>
                      <span className="text-slate-400 text-[11px] ml-1">({l.company})</span>
                    </div>
                    <span className="font-mono text-emerald-400 text-[11px]">${l.estimatedValue} USD</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setPreviewData(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded"
                >
                  Descartar
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                >
                  Confirmar e Importar al CRM
                </button>
              </div>
            </div>
          )}
        </div>

        {/* EXPORT SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Exportar Registros y Reportes
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {leads.length} prospectos activos
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              Descarga la información de prospectos y seguimientos para compartir con el equipo o generar respaldos externos.
            </p>

            <div className="space-y-3 mt-4">
              {/* Option 1: CSV Export */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Exportar a Excel / CSV</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Descarga archivo delimitado por comas con todos los campos y datos de contacto.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportFullCSV}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-sm"
                >
                  Descargar CSV
                </button>
              </div>

              {/* Option 2: PDF Executive Report Preview */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Reporte Ejecutivo PDF</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Resumen formal de estado comercial estructurado para revisión académica o gerencial.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPdfPreview(true)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-sm"
                >
                  Ver PDF
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-[11px] text-slate-400 flex items-center justify-between">
            <span>Último respaldo generado: Hoy</span>
            <span className="font-mono text-emerald-400 font-semibold">Integridad 100%</span>
          </div>
        </div>
      </div>

      {/* PDF Modal Preview */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-xs uppercase font-mono font-bold text-blue-600 tracking-wider">
                  Informe de Gestión Comercial
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                  CRMComercial · Reporte de Prospectos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proyecto de Posgrado: Diseño de un Sistema CRM para la Gestión y Seguimiento de Prospectos
                </p>
              </div>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border">
                <span className="text-[11px] text-slate-500 block">Total Prospectos</span>
                <span className="text-xl font-bold text-slate-800 font-mono">{leads.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border">
                <span className="text-[11px] text-slate-500 block">Ganados</span>
                <span className="text-xl font-bold text-emerald-600 font-mono">
                  {leads.filter((l) => l.stage === 'Ganado').length}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border">
                <span className="text-[11px] text-slate-500 block">En Proceso</span>
                <span className="text-xl font-bold text-blue-600 font-mono">
                  {leads.filter((l) => l.stage !== 'Ganado' && l.stage !== 'Perdido').length}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border">
                <span className="text-[11px] text-slate-500 block">Volumen Estimado</span>
                <span className="text-xl font-bold text-slate-800 font-mono">
                  ${leads.reduce((a, b) => a + b.estimatedValue, 0).toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Resumen de Prospectos Clave en Cartera
              </h4>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="p-2">Prospecto</th>
                    <th className="p-2">Empresa</th>
                    <th className="p-2">Etapa</th>
                    <th className="p-2">Responsable</th>
                    <th className="p-2 text-right">Oportunidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leads.slice(0, 8).map((l) => (
                    <tr key={l.id}>
                      <td className="p-2 font-semibold text-slate-900">{l.name}</td>
                      <td className="p-2 text-slate-600">{l.company}</td>
                      <td className="p-2 font-medium text-blue-600">{l.stage}</td>
                      <td className="p-2 text-slate-600">{l.assignedToName}</td>
                      <td className="p-2 text-right font-mono">${l.estimatedValue.toLocaleString()} USD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Generado automáticamente el {new Date().toLocaleDateString('es-ES')}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Imprimir / Guardar como PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
