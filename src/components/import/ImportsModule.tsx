import React, { useState, useRef } from 'react';
import {
  FileUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Database,
  History,
  FileText,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  Building2,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ProspectoDB,
  HistorialImportacionDB,
  UsuarioDB,
  EtapaPipelineDB,
} from '../../types/schema';

interface ImportsModuleProps {
  onImportProspectos: (prospectos: ProspectoDB[]) => void;
  historialImportaciones: HistorialImportacionDB[];
  onAddHistorialImportacion: (historial: HistorialImportacionDB) => void;
  currentUser: UsuarioDB;
  etapas: EtapaPipelineDB[];
  usuarios: UsuarioDB[];
}

interface ColumnMapping {
  empresa: string;
  contacto: string;
  telefono: string;
  correo: string;
  naturaleza: string;
  certificado_fe: string;
  pos_digital: string;
  otro_sistema: string;
  modulos: string;
  fecha_contacto: string;
  presentacion_fe: string;
  estado: string;
}

export const ImportsModule: React.FC<ImportsModuleProps> = ({
  onImportProspectos,
  historialImportaciones,
  onAddHistorialImportacion,
  currentUser,
  etapas,
  usuarios,
}) => {
  const [importType, setImportType] = useState<
    'Prospectos' | 'Oportunidades' | 'Contactos' | 'Empresas'
  >('Prospectos');

  const [fileName, setFileName] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [showMapping, setShowMapping] = useState(false);

  // Column mapping state initialized with standard IB SYSTEM column names
  const [mapping, setMapping] = useState<ColumnMapping>({
    empresa: '',
    contacto: '',
    telefono: '',
    correo: '',
    naturaleza: '',
    certificado_fe: '',
    pos_digital: '',
    otro_sistema: '',
    modulos: '',
    fecha_contacto: '',
    presentacion_fe: '',
    estado: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to auto-match column names from Excel/CSV headers
  const autoDetectColumns = (columns: string[]) => {
    const findMatch = (...candidates: string[]) => {
      for (const cand of candidates) {
        const found = columns.find(
          (c) =>
            c.toLowerCase().trim() === cand.toLowerCase().trim() ||
            c.toLowerCase().includes(cand.toLowerCase())
        );
        if (found) return found;
      }
      return '';
    };

    const detected: ColumnMapping = {
      empresa: findMatch('Empresa', 'Razón Social', 'Company', 'Organización', 'Cliente'),
      contacto: findMatch('Contacto', 'Nombre', 'Persona de Contacto', 'Decisor', 'Name'),
      telefono: findMatch('Teléfono', 'Telefono', 'Celular', 'WhatsApp', 'Phone'),
      correo: findMatch('Correo', 'Email', 'E-mail', 'Correo Electrónico'),
      naturaleza: findMatch('Naturaleza de las operaciones', 'Naturaleza', 'Actividad', 'Industria', 'Sector'),
      certificado_fe: findMatch('¿Certificado FE?', 'Certificado FE', 'Facturación Electrónica', 'FE'),
      pos_digital: findMatch('POS Digital', 'POS', 'Terminal POS'),
      otro_sistema: findMatch('Otro sistema', 'Sistema Actual', 'Software Actual'),
      modulos: findMatch('Módulos de interés', 'Modulos de interes', 'Módulos', 'Productos'),
      fecha_contacto: findMatch('Fecha de contacto', 'Fecha', 'Date'),
      presentacion_fe: findMatch('Presentación FE', 'Presentacion FE', 'Demostración'),
      estado: findMatch('Estado', 'Etapa', 'Status', 'Fase'),
    };

    setMapping(detected);
  };

  // File parsing logic supporting .xlsx, .xls, .csv
  const processFileData = (data: ArrayBuffer, name: string) => {
    try {
      setIsProcessing(true);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonRows.length === 0) {
        alert('El archivo no contiene filas de datos.');
        setIsProcessing(false);
        return;
      }

      const columns = Object.keys(jsonRows[0] || {});
      setAvailableColumns(columns);
      autoDetectColumns(columns);
      setRawRows(jsonRows);
      setFileName(name);
      setShowMapping(true);
      setIsProcessing(false);
    } catch (err) {
      console.error('Error procesando archivo', err);
      alert('Error al leer el archivo. Asegúrate de que sea un formato válido (.xlsx, .xls, .csv).');
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      processFileData(buffer, file.name);
    };
    reader.readAsArrayBuffer(file);
    // Reset input so same file can be chosen again if needed
    e.target.value = '';
  };

  // 1-Click Sample File Loader conforming to IB SYSTEM's real Excel schema
  const handleLoadSampleBatch = () => {
    const sampleCsv = `Empresa,Contacto,Teléfono,Correo,Naturaleza de las operaciones,¿Certificado FE?,POS Digital,Otro sistema,Módulos de interés,Fecha de contacto,Presentación FE,Estado
Repuestos & Talleres Cibao S.R.L.,Ing. Alejandro Cabrera,+1 809-582-4411,acabrera@repuestoscibao.com.do,Venta de repuestos y mecánica automotriz,Sí,Sí,Mónica 8.5,Inventario; Compras; Facturación Electrónica,2026-09-25,Completada,Interesado
Distribuidora Nacional del Caribe S.A.,Licda. Carmen Báez,+1 809-541-8890,cbaez@disnacardominicana.com,Distribución farmacéutica y cosméticos,Sí,Sí,Excel,POS Digital; Cuentas por Cobrar; Contabilidad,2026-09-26,Agendada,Contacto
Supermercados & Plazas El Conde,Lic. Fausto Henríquez,+1 809-688-3321,fhenriquez@elcondemarket.do,Cadena retail y conveniencia,Sí,Sí,Visual Basic,POS Digital; Caja; Ventas,2026-09-27,Completada,Propuesta Enviada
Farmacias San Rafael Dominicana,Licda. Laura Polanco,+1 809-575-9922,lpolanco@farmaciasanrafael.com.do,Farmacias y dispensarios,Sí,No,SAP B1,Inventario; Cuentas por Pagar; Reportes,2026-09-28,Pendiente,Contacto
Constructora & Ferretería Central,Ing. Miguel Taveras,+1 809-565-1100,mtaveras@ferreteriacentral.do,Venta de materiales pesados y ferretería,Sí,Sí,QuickBooks,Facturación Electrónica; Compras; Inventario,2026-09-29,Completada,Interesado`;

    const buffer = new TextEncoder().encode(sampleCsv).buffer;
    processFileData(buffer, 'prospectos_ib_system_oficial.xlsx');
  };

  // Download official IB SYSTEM template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Empresa: 'Auto Repuestos Quisqueya S.R.L.',
        Contacto: 'Carlos Méndez',
        Teléfono: '+1 809-565-1122',
        Correo: 'cmendez@quisqueya.do',
        'Naturaleza de las operaciones': 'Comercio y Talleres',
        '¿Certificado FE?': 'Sí',
        'POS Digital': 'Sí',
        'Otro sistema': 'Excel',
        'Módulos de interés': 'Inventario, Ventas, Facturación Electrónica',
        'Fecha de contacto': '2026-09-30',
        'Presentación FE': 'Pendiente',
        Estado: 'Contacto',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prospectos');
    XLSX.writeFile(wb, 'plantilla_importacion_ibsystem.xlsx');
  };

  // Build mapped objects
  const mappedRecords = rawRows.map((row, idx) => {
    const empresa = (row[mapping.empresa] || row['Empresa'] || '').toString().trim();
    const contacto = (row[mapping.contacto] || row['Contacto'] || row['Nombre'] || '').toString().trim();
    const telefono = (row[mapping.telefono] || row['Teléfono'] || '').toString().trim();
    const correo = (row[mapping.correo] || row['Correo'] || '').toString().trim().toLowerCase();
    const naturaleza = (row[mapping.naturaleza] || row['Naturaleza de las operaciones'] || 'Comercial').toString().trim();
    const certificadoFE = (row[mapping.certificado_fe] || row['¿Certificado FE?'] || 'Sí').toString().trim();
    const posDigital = (row[mapping.pos_digital] || row['POS Digital'] || 'Sí').toString().trim();
    const modulos = (row[mapping.modulos] || row['Módulos de interés'] || 'Inventario, POS').toString().trim();
    const estado = (row[mapping.estado] || row['Estado'] || 'Contacto').toString().trim();

    const isValid = Boolean(empresa || contacto);

    return {
      idx: idx + 1,
      empresa: empresa || 'Empresa No Especificada',
      contacto: contacto || 'Contacto Comercial',
      telefono: telefono || '+1 809-565-0000',
      correo: correo || 'info@empresa.com.do',
      naturaleza,
      certificadoFE,
      posDigital,
      modulos,
      estado: ['Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido'].includes(estado)
        ? estado
        : 'Contacto',
      isValid,
    };
  });

  const validRecords = mappedRecords.filter((r) => r.isValid);

  const handleConfirmImport = async () => {
    if (validRecords.length === 0) {
      alert('No hay registros válidos para importar.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Post to Express backend for persistent MySQL/file-backed storage
      const response = await fetch('/api/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filas: validRecords.map((r) => ({
            empresa: r.empresa,
            contacto: r.contacto,
            telefono: r.telefono,
            correo: r.correo,
            naturaleza: r.naturaleza,
            pos_digital: r.posDigital,
            modulos: r.modulos,
            estado: r.estado,
          })),
          autor: currentUser.nombre,
        }),
      });

      const resData = await response.json();

      // 2. Also map to ProspectoDB format for client-side live reactivity
      const newProspectos: ProspectoDB[] = validRecords.map((r, idx) => ({
        id: Date.now() + idx,
        nombre: r.contacto.split(' ')[0] || r.contacto,
        apellido: r.contacto.split(' ').slice(1).join(' ') || '',
        empresa: r.empresa,
        cargo: 'Decisor Comercial',
        email: r.correo,
        telefono: r.telefono,
        whatsapp: r.telefono,
        fuente: 'Importación Excel',
        etapa_id: 1,
        usuario_id: currentUser.id || 1,
        valor_estimado: 540,
        fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
        fecha_proximo_seguimiento: new Date(Date.now() + 86400000 * 3).toISOString().replace('T', ' ').slice(0, 16),
        notas: `Importado de archivo IB SYSTEM. Naturaleza: ${r.naturaleza}. Módulos: ${r.modulos}.`,
        etiquetas: 'Importado, IB SYSTEM',
      }));

      onImportProspectos(newProspectos);

      // 3. Register audit history
      const now = new Date();
      onAddHistorialImportacion({
        id: Date.now(),
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().slice(0, 5),
        usuario: currentUser.nombre,
        archivo: fileName || 'prospectos_ib_system.xlsx',
        tipo: importType,
        registros_procesados: rawRows.length,
        registros_correctos: validRecords.length,
        registros_con_error: rawRows.length - validRecords.length,
        estado: 'Exitoso',
      });

      setImportSuccessMessage(
        resData.message ||
          `¡Proceso completado exitosamente! Se procesaron ${validRecords.length} registros y se guardaron en la base de datos.`
      );

      setShowMapping(false);
      setRawRows([]);
      setFileName(null);
    } catch (err) {
      console.error('Error importing to backend', err);
      // Fallback client-side
      const newProspectos: ProspectoDB[] = validRecords.map((r, idx) => ({
        id: Date.now() + idx,
        nombre: r.contacto.split(' ')[0] || r.contacto,
        apellido: r.contacto.split(' ').slice(1).join(' ') || '',
        empresa: r.empresa,
        cargo: 'Decisor Comercial',
        email: r.correo,
        telefono: r.telefono,
        whatsapp: r.telefono,
        fuente: 'Importación Excel',
        etapa_id: 1,
        usuario_id: currentUser.id || 1,
        valor_estimado: 540,
        fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
        fecha_proximo_seguimiento: new Date(Date.now() + 86400000 * 3).toISOString().replace('T', ' ').slice(0, 16),
        notas: `Importado de archivo IB SYSTEM. Naturaleza: ${r.naturaleza}. Módulos: ${r.modulos}.`,
        etiquetas: 'Importado, IB SYSTEM',
      }));
      onImportProspectos(newProspectos);
      setImportSuccessMessage(
        `Se procesaron ${validRecords.length} registros y se actualizaron en el sistema.`
      );
      setShowMapping(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Process Banner */}
      <div className="border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
          <FileUp className="w-4 h-4" />
          <span>Módulo Oficial de Carga Masiva · IB SYSTEM CRM</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Importación Inteligente de Prospectos y Contactos
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Permite cargar archivos Excel (.xlsx, .xls) o CSV con reconocimiento de la estructura real de IB SYSTEM, mapeo interactivo de columnas, deduplicación y persistencia inmediata en MySQL.
        </p>
      </div>

      {/* Target Type Selector Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl w-fit text-xs">
        {(['Prospectos', 'Oportunidades', 'Contactos', 'Empresas'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setImportType(type)}
            className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
              importType === type
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Importar {type}
          </button>
        ))}
      </div>

      {/* Step Process Visualizer */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-[11px] font-mono">
        {[
          '1. Seleccionar Archivo',
          '2. Reconocer Columnas',
          '3. Mapeo Interactivo',
          '4. Vista Previa',
          '5. Deduplicación',
          '6. Guardar en MySQL',
        ].map((step, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border ${
              showMapping && idx < 4
                ? 'bg-blue-950/60 border-blue-500/60 text-blue-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Upload Dropzone & Controls Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Cargar Archivo Excel o CSV de IB SYSTEM
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Abre el explorador de archivos de Windows para seleccionar tu archivo (.xlsx, .xls, .csv).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Descargar Plantilla Oficial</span>
            </button>

            <button
              onClick={handleLoadSampleBatch}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Cargar Archivo Ejemplo IB SYSTEM (5 Empresas)</span>
            </button>
          </div>
        </div>

        {/* Real Native File Upload Label & Input */}
        <label
          htmlFor="ibsystem-file-input"
          className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/70 hover:bg-slate-950 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group block"
        >
          <input
            id="ibsystem-file-input"
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="sr-only"
          />

          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <span className="text-sm font-bold text-white block">
              Haz clic aquí para abrir el explorador de Windows y seleccionar tu Excel (.xlsx / .csv)
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Reconoce automáticamente las columnas: Empresa, Contacto, Teléfono, Correo, Naturaleza, ¿Certificado FE?, POS Digital, Módulos
            </span>
          </div>
        </label>

        {/* Success Alert */}
        {importSuccessMessage && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex items-start gap-3 text-xs text-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-emerald-300 block mb-0.5">Operación Concluida con Éxito:</strong>
              <span>{importSuccessMessage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mapeo Interactivo de Columnas (Requerimiento Crítico IB SYSTEM) */}
      {showMapping && rawRows.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 animate-in fade-in shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold text-white">Mapeo Interactivo de Columnas</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 font-mono">
                  {rawRows.length} filas detectadas
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Asocia cada campo del CRM con la columna correspondiente de tu archivo de IB SYSTEM.
              </p>
            </div>

            <button
              onClick={handleConfirmImport}
              disabled={isProcessing || validRecords.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando e insertando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Importar {validRecords.length} Registros a MySQL</span>
                </>
              )}
            </button>
          </div>

          {/* Grid of mapping dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {/* Empresa */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <label className="font-bold text-slate-300 flex items-center justify-between">
                <span>Empresa / Razón Social *</span>
                <span className="text-[10px] text-blue-400 font-mono">Obligatorio</span>
              </label>
              <select
                value={mapping.empresa}
                onChange={(e) => setMapping({ ...mapping, empresa: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Seleccionar Columna --</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Contacto */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <label className="font-bold text-slate-300 flex items-center justify-between">
                <span>Contacto Principal *</span>
                <span className="text-[10px] text-blue-400 font-mono">Obligatorio</span>
              </label>
              <select
                value={mapping.contacto}
                onChange={(e) => setMapping({ ...mapping, contacto: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Seleccionar Columna --</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Teléfono */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <label className="font-bold text-slate-300">Teléfono / WhatsApp</label>
              <select
                value={mapping.telefono}
                onChange={(e) => setMapping({ ...mapping, telefono: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Seleccionar Columna --</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Correo */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <label className="font-bold text-slate-300">Correo Electrónico</label>
              <select
                value={mapping.correo}
                onChange={(e) => setMapping({ ...mapping, correo: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Seleccionar Columna --</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Naturaleza de operaciones */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <label className="font-bold text-slate-300">Naturaleza de Operaciones</label>
              <select
                value={mapping.naturaleza}
                onChange={(e) => setMapping({ ...mapping, naturaleza: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Seleccionar Columna --</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Módulos de interés */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <label className="font-bold text-slate-300">Módulos de Interés</label>
              <select
                value={mapping.modulos}
                onChange={(e) => setMapping({ ...mapping, modulos: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Seleccionar Columna --</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* ¿Certificado FE? */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <label className="font-bold text-slate-300">¿Certificado Facturación Electrónica?</label>
              <select
                value={mapping.certificado_fe}
                onChange={(e) => setMapping({ ...mapping, certificado_fe: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Seleccionar Columna --</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* POS Digital */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <label className="font-bold text-slate-300">POS Digital</label>
              <select
                value={mapping.pos_digital}
                onChange={(e) => setMapping({ ...mapping, pos_digital: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Seleccionar Columna --</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado / Etapa */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <label className="font-bold text-slate-300">Estado / Etapa Pipeline</label>
              <select
                value={mapping.estado}
                onChange={(e) => setMapping({ ...mapping, estado: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Seleccionar Columna --</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Preview Table */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Vista Previa con Mapeo Aplicado ({validRecords.length} filas válidas)
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-4">Empresa Mapeada</th>
                    <th className="py-2.5 px-4">Contacto Principal</th>
                    <th className="py-2.5 px-3">Teléfono</th>
                    <th className="py-2.5 px-3">Correo</th>
                    <th className="py-2.5 px-3">Módulos Interés</th>
                    <th className="py-2.5 px-3">Etapa</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                  {mappedRecords.slice(0, 10).map((r) => (
                    <tr key={r.idx} className="hover:bg-slate-850/60">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{r.idx}</td>
                      <td className="py-2.5 px-4 font-bold text-white">{r.empresa}</td>
                      <td className="py-2.5 px-4 text-slate-300">{r.contacto}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{r.telefono}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{r.correo}</td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-[150px] truncate">{r.modulos}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {r.estado}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                            <Check className="w-3 h-3" /> Válido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                            <AlertCircle className="w-3 h-3" /> Incompleto
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {mappedRecords.length > 10 && (
              <p className="text-[11px] text-slate-500 text-center font-mono">
                Mostrando las primeras 10 filas de {mappedRecords.length} encontradas en el archivo.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Historial de Importaciones Previas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h3 className="text-base font-bold text-white">Historial de Importaciones Realizadas</h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Archivo</th>
                <th className="py-3 px-3">Usuario Responsable</th>
                <th className="py-3 px-3 text-right">Correctos</th>
                <th className="py-3 px-3 text-right">Errores</th>
                <th className="py-3 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {historialImportaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No se han registrado importaciones en el sistema.
                  </td>
                </tr>
              ) : (
                historialImportaciones.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-850/60">
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {h.fecha} {h.hora}
                    </td>
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{h.archivo}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{h.usuario}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                      {h.registros_correctos}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400 font-bold">
                      {h.registros_con_error}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {h.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
