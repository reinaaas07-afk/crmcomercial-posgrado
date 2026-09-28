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

interface ParsedRow {
  index: number;
  nombre: string;
  apellido: string;
  empresa: string;
  cargo: string;
  email: string;
  telefono: string;
  whatsapp: string;
  fuente: string;
  valor_estimado: number;
  notas: string;
  etiquetas: string;
  isValid: boolean;
  errors: string[];
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
    'Prospectos' | 'Oportunidades' | 'Contactos' | 'Seguimientos'
  >('Prospectos');

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File parsing logic supporting .xlsx, .xls, .csv
  const processFileData = (data: ArrayBuffer, name: string) => {
    try {
      setIsProcessing(true);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const mapped: ParsedRow[] = jsonRows.map((row, idx) => {
        // Flexible column mapping
        const nombreCompleto =
          row['Nombre'] ||
          row['nombre'] ||
          row['Nombre Completo'] ||
          row['Name'] ||
          row['contacto'] ||
          '';

        const apellido =
          row['Apellido'] ||
          row['apellido'] ||
          row['Last Name'] ||
          '';

        const empresa =
          row['Empresa'] ||
          row['empresa'] ||
          row['Company'] ||
          row['Organización'] ||
          '';

        const cargo =
          row['Cargo'] ||
          row['cargo'] ||
          row['Puesto'] ||
          row['Position'] ||
          'Decisor Comercial';

        const email =
          row['Correo'] ||
          row['correo'] ||
          row['Email'] ||
          row['email'] ||
          '';

        const telefono =
          row['Teléfono'] ||
          row['telefono'] ||
          row['Phone'] ||
          row['tel'] ||
          '';

        const whatsapp =
          row['WhatsApp'] ||
          row['whatsapp'] ||
          telefono ||
          '';

        const fuente =
          row['Fuente'] ||
          row['fuente'] ||
          row['Source'] ||
          'Importación Excel';

        const valor =
          Number(row['Valor'] || row['valor'] || row['Valor Estimado'] || row['Monto']) || 5000;

        const notas =
          row['Notas'] ||
          row['notas'] ||
          row['Observaciones'] ||
          'Prospecto importado desde archivo externo.';

        const etiquetas =
          row['Etiquetas'] ||
          row['etiquetas'] ||
          row['Tags'] ||
          'Importado';

        const errors: string[] = [];
        if (!nombreCompleto.trim()) errors.push('Nombre requerido');
        if (!empresa.trim()) errors.push('Empresa requerida');

        return {
          index: idx + 1,
          nombre: nombreCompleto.trim(),
          apellido: apellido.trim(),
          empresa: empresa.trim(),
          cargo: cargo.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          whatsapp: whatsapp.trim(),
          fuente: fuente.trim(),
          valor_estimado: valor,
          notas: notas.trim(),
          etiquetas: etiquetas.trim(),
          isValid: errors.length === 0,
          errors,
        };
      });

      setFileName(name);
      setParsedRows(mapped);
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
  };

  // 1-Click Sample File Loader for quick demonstration
  const handleLoadSampleBatch = () => {
    const sampleCsv = `Nombre,Apellido,Empresa,Cargo,Correo,Teléfono,WhatsApp,Fuente,Valor Estimado,Notas,Etiquetas
Alejandro,Cabrera,Repuestos & Talleres Cibao,Gerente de Compras,acabrera@repuestoscibao.com.do,+1 809-582-4411,+1 829-334-1122,Referido,285000,Requiere control de inventario y facturación fiscal DGII en 3 sucursales,Inventario, Facturación Electrónica, ITHOT System
Carmen,Báez,Distribuidora Nacional del Caribe,Directora Financiera,cbaez@disnacardominicana.com,+1 809-541-8890,+1 849-220-4455,Google Ads,195000,Interesada en solución POS Digital y conciliación de cuentas por cobrar,POS Digital, Cuentas por Cobrar
Fausto,Henríquez,Supermercados & Plazas El Conde,Superintendente Comercial,fhenriquez@elcondemarket.do,+1 809-688-3321,+1 829-912-7788,Feria Comercial,420000,Gran superficie con 12 terminales de cobro evaluando reemplazo de sistema,Cliente Activo, POS Digital, Reportes Gerenciales
Laura,Polanco,Farmacias San Rafael Dominicana,Gerente General,lpolanco@farmaciasanrafael.com.do,+1 809-575-9922,+1 829-450-8833,Sitio Web,160000,Necesita sincronización entre inventarios de sucursales y CRM Comercial,CRM Comercial, Inventario
Miguel,Taveras,Constructora & Ferretería Central,Director de Operaciones,mtaveras@ferreteriacentral.do,+1 809-565-1100,+1 829-771-3399,LinkedIn,350000,Automatización de cotizaciones y facturación electrónica para ventas corporativas,Facturación Electrónica, Contabilidad`;

    const buffer = new TextEncoder().encode(sampleCsv).buffer;
    processFileData(buffer, 'lote_contactos_prospectos_dominicanos_ithot.xlsx');
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No hay registros válidos para importar.');
      return;
    }

    const defaultEtapaId = etapas[0]?.id || 1;
    const defaultUserId = usuarios[0]?.id || 1;

    const baseId = Date.now();
    const newProspectos: ProspectoDB[] = validRows.map((r, idx) => ({
      id: baseId + idx,
      nombre: r.nombre,
      apellido: r.apellido,
      empresa: r.empresa,
      cargo: r.cargo,
      email: r.email,
      telefono: r.telefono,
      whatsapp: r.whatsapp,
      fuente: r.fuente as any,
      etapa_id: defaultEtapaId,
      usuario_id: defaultUserId,
      valor_estimado: r.valor_estimado,
      fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fecha_proximo_seguimiento: new Date(Date.now() + 86400000 * 2).toISOString().replace('T', ' ').slice(0, 16),
      notas: r.notas,
      etiquetas: r.etiquetas,
    }));

    // Insert into live database
    onImportProspectos(newProspectos);

    // Register into audit history
    const errorCount = parsedRows.length - validRows.length;
    const now = new Date();
    const auditRecord: HistorialImportacionDB = {
      id: Date.now(),
      fecha: now.toISOString().split('T')[0],
      hora: now.toTimeString().slice(0, 5),
      usuario: currentUser.nombre,
      archivo: fileName || 'contactos_prospectos_rd.xlsx',
      tipo: importType,
      registros_procesados: parsedRows.length,
      registros_correctos: validRows.length,
      registros_con_error: errorCount,
      estado: errorCount === 0 ? 'Exitoso' : validRows.length > 0 ? 'Parcial' : 'Con Errores',
    };

    onAddHistorialImportacion(auditRecord);

    setImportSuccessMessage(
      `¡Se importaron ${validRows.length} registros exitosamente a la base de datos! Ya están visibles en Contactos, Prospectos, Dashboard, Pipeline y Reportes.`
    );
    setParsedRows([]);
    setFileName(null);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Nombre: 'Carlos',
        Apellido: 'Méndez',
        Empresa: 'Auto Repuestos Quisqueya',
        Cargo: 'Gerente General',
        Correo: 'cmendez@repuestosquisqueya.do',
        Teléfono: '+1 809-567-2233',
        WhatsApp: '+1 829-881-4455',
        Fuente: 'Referido',
        'Valor Estimado': 250000,
        Notas: 'Interesado en POS Digital y Facturación Electrónica ITHOT',
        Etiquetas: 'Prospecto, POS Digital, Facturación Electrónica',
      },
      {
        Nombre: 'Yomaira',
        Apellido: 'Peralta',
        Empresa: 'Distribuidora del Sol S.R.L.',
        Cargo: 'Directora Financiera',
        Correo: 'yperalta@distribuidoradelsol.com.do',
        Teléfono: '+1 809-583-9900',
        WhatsApp: '+1 849-332-1100',
        Fuente: 'Sitio Web',
        'Valor Estimado': 180000,
        Notas: 'Solicita cotización de módulo de inventario y cuentas por cobrar',
        Etiquetas: 'Cliente, ITHOT System, Inventario',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Prospectos');
    XLSX.writeFile(wb, 'plantilla_importacion_crmcomercial.xlsx');
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Process Banner */}
      <div className="border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
          <FileUp className="w-4 h-4" />
          <span>Módulo Oficial de Carga de Datos · Integración Excel / CSV</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Módulo de Importaciones (ETL & Ingesta de Datos)
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Proceso guiado de 7 etapas: Selección ➔ Lectura ➔ Previsualización ➔ Validación ➔ Detección de Errores ➔ Confirmación ➔ Inserción en Base de Datos MySQL.
        </p>
      </div>

      {/* Target Type Selector Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl w-fit text-xs">
        {(['Prospectos', 'Oportunidades', 'Contactos', 'Seguimientos'] as const).map((type) => (
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
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-[11px] font-mono">
        {[
          '1. Seleccionar Archivo',
          '2. Leer Hoja (.xlsx / .csv)',
          '3. Vista Previa',
          '4. Validar Columnas',
          '5. Detectar Errores',
          '6. Confirmar',
          '7. Inserción BD',
        ].map((step, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg border ${
              parsedRows.length > 0 && idx < 5
                ? 'bg-blue-950/40 border-blue-500/60 text-blue-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Upload Dropzone & Controls Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Cargar Archivo de {importType} (.xlsx, .xls, .csv)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Arrastra tu archivo o selecciónalo desde tu equipo para procesar los registros de forma automatizada.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Descargar Plantilla Excel</span>
            </button>

            <button
              onClick={handleLoadSampleBatch}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Cargar Lote de Prueba (5 B2B)</span>
            </button>
          </div>
        </div>

        {/* Input file container */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 bg-slate-950/60 hover:bg-slate-950 rounded-xl p-8 text-center cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-blue-400 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">
              Haz clic aquí para seleccionar tu archivo Excel o CSV
            </span>
            <span className="text-xs text-slate-400">
              Formatos soportados: Microsoft Excel (.xlsx, .xls) o texto delimitado (.csv)
            </span>
          </div>
        </div>

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

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 text-xs">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block">{fileName}</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    Total: {parsedRows.length} filas leídas
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} Válidos
                </span>
                {invalidCount > 0 && (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {invalidCount} con Error
                  </span>
                )}
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Confirmar e Insertar en Base de Datos</span>
                </button>
              </div>
            </div>

            {/* Rows Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[360px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400 text-[11px] uppercase font-mono">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Nombre y Apellido</th>
                    <th className="py-2.5 px-3">Empresa</th>
                    <th className="py-2.5 px-3">Cargo</th>
                    <th className="py-2.5 px-3">Correo</th>
                    <th className="py-2.5 px-3">Teléfono</th>
                    <th className="py-2.5 px-3 text-right">Valor Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {parsedRows.map((row) => (
                    <tr
                      key={row.index}
                      className={row.isValid ? 'hover:bg-slate-800/30' : 'bg-rose-950/20'}
                    >
                      <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{row.index}</td>
                      <td className="py-2 px-3">
                        {row.isValid ? (
                          <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                            Válido
                          </span>
                        ) : (
                          <span
                            className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold"
                            title={row.errors.join(', ')}
                          >
                            Error
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-semibold text-white">
                        {row.nombre} {row.apellido}
                      </td>
                      <td className="py-2 px-3 text-slate-300">{row.empresa}</td>
                      <td className="py-2 px-3 text-slate-400">{row.cargo}</td>
                      <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">{row.email}</td>
                      <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{row.telefono}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400 font-semibold">
                        ${row.valor_estimado.toLocaleString()} USD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* HISTORIAL DE IMPORTACIONES (AUDITORÍA DEL SISTEMA) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-2">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              Historial de Auditoría de Importaciones
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {historialImportaciones.length} procesos registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario Responsable</th>
                <th className="py-3 px-4">Archivo</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4 text-center">Procesados</th>
                <th className="py-3 px-4 text-center">Correctos</th>
                <th className="py-3 px-4 text-center">Con Error</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {historialImportaciones.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {h.fecha} <span className="text-slate-500">{h.hora}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{h.usuario}</td>
                  <td className="py-3 px-4 font-mono text-blue-400 truncate max-w-[200px]">
                    {h.archivo}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{h.tipo}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-200">{h.registros_procesados}</td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">
                    {h.registros_correctos}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-rose-400 font-bold">
                    {h.registros_con_error}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        h.estado === 'Exitoso'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : h.estado === 'Parcial'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {h.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
