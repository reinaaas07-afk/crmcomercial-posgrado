import React, { useState } from 'react';
import {
  MessageSquare,
  Paperclip,
  Send,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  Download,
  Trash2,
  Clock,
  User,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { ComentarioDB, AdjuntoDB, UsuarioDB } from '../../types/schema';

interface CommentsAndAttachmentsProps {
  entidadTipo: 'empresa' | 'contacto' | 'prospecto' | 'oportunidad';
  entidadId: number;
  entidadTitulo: string;
  currentUser: UsuarioDB;
  comentarios: ComentarioDB[];
  adjuntos: AdjuntoDB[];
  onAddComentario: (comentario: Omit<ComentarioDB, 'id'>) => void;
  onAddAdjunto: (adjunto: Omit<AdjuntoDB, 'id'>) => void;
  onDeleteComentario?: (id: number) => void;
  onDeleteAdjunto?: (id: number) => void;
}

export const CommentsAndAttachments: React.FC<CommentsAndAttachmentsProps> = ({
  entidadTipo,
  entidadId,
  entidadTitulo,
  currentUser,
  comentarios,
  adjuntos,
  onAddComentario,
  onAddAdjunto,
  onDeleteComentario,
  onDeleteAdjunto,
}) => {
  const [activeTab, setActiveTab] = useState<'comentarios' | 'adjuntos'>('comentarios');
  const [newCommentText, setNewCommentText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileNameInput, setFileNameInput] = useState('');
  const [fileTypeInput, setFileTypeInput] = useState<'PDF' | 'Excel' | 'Word' | 'Imagen' | 'Otro'>('PDF');
  const [fileSizeInput, setFileSizeInput] = useState('1250');

  const filteredComments = comentarios.filter(
    (c) => c.entidad_tipo === entidadTipo && c.entidad_id === entidadId
  );

  const filteredAdjuntos = adjuntos.filter(
    (a) => a.entidad_tipo === entidadTipo && a.entidad_id === entidadId
  );

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    onAddComentario({
      entidad_tipo: entidadTipo,
      entidad_id: entidadId,
      usuario_nombre: currentUser.nombre,
      usuario_id: currentUser.id,
      texto: newCommentText.trim(),
      fecha_hora: formattedDate,
    });

    setNewCommentText('');
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileNameInput.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    onAddAdjunto({
      entidad_tipo: entidadTipo,
      entidad_id: entidadId,
      nombre_archivo: fileNameInput.trim(),
      tipo_archivo: fileTypeInput,
      tamano_kb: parseInt(fileSizeInput) || 850,
      usuario_nombre: currentUser.nombre,
      fecha_subida: formattedDate,
    });

    setFileNameInput('');
    setShowUploadModal(false);
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'Excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'Word':
        return <FileCode className="w-5 h-5 text-blue-400" />;
      case 'Imagen':
        return <ImageIcon className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('comentarios')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'comentarios'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comentarios</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
              {filteredComments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('adjuntos')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'adjuntos'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Archivos Adjuntos</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
              {filteredAdjuntos.length}
            </span>
          </button>
        </div>

        {activeTab === 'adjuntos' && (
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Subir Archivo</span>
          </button>
        )}
      </div>

      {/* Comentarios Tab */}
      {activeTab === 'comentarios' && (
        <div className="flex flex-col gap-3">
          {/* New Comment Input */}
          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              placeholder={`Agregar nota o comentario sobre ${entidadTitulo}...`}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar</span>
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {filteredComments.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No hay comentarios registrados aún para este elemento.
              </div>
            ) : (
              filteredComments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-300 font-bold">
                        {c.usuario_nombre.charAt(0)}
                      </div>
                      <span>{c.usuario_nombre}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                      <Clock className="w-3 h-3" />
                      <span>{c.fecha_hora}</span>
                      {onDeleteComentario && currentUser.rol.includes('Administrador') && (
                        <button
                          type="button"
                          onClick={() => onDeleteComentario(c.id)}
                          className="ml-2 text-slate-600 hover:text-rose-400 transition-colors"
                          title="Eliminar comentario"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed pl-6">{c.texto}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Adjuntos Tab */}
      {activeTab === 'adjuntos' && (
        <div className="flex flex-col gap-2">
          {filteredAdjuntos.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              No hay documentos adjuntos subidos para {entidadTitulo}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredAdjuntos.map((file) => (
                <div
                  key={file.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2 group hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      {getFileIcon(file.tipo_archivo)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                        {file.nombre_archivo}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>{(file.tamano_kb / 1024).toFixed(1)} MB</span>
                        <span>•</span>
                        <span>{file.usuario_nombre.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([`Contenido simulado de ${file.nombre_archivo}`], {
                          type: 'text/plain',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = file.nombre_archivo;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                      title="Descargar archivo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteAdjunto && currentUser.rol.includes('Administrador') && (
                      <button
                        type="button"
                        onClick={() => onDeleteAdjunto(file.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Subir Archivo */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">Adjuntar Documento / Archivo</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadFile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nombre del Archivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cotizacion_ITHOT_DGII.pdf"
                  value={fileNameInput}
                  onChange={(e) => setFileNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Tipo de Formato</label>
                  <select
                    value={fileTypeInput}
                    onChange={(e) => setFileTypeInput(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="Excel">Excel (.xlsx / .xls)</option>
                    <option value="Word">Word (.docx / .doc)</option>
                    <option value="Imagen">Imagen (.png / .jpg)</option>
                    <option value="Otro">Otro Formato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Tamaño Estimado (KB)</label>
                  <input
                    type="number"
                    value={fileSizeInput}
                    onChange={(e) => setFileSizeInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                Este archivo quedará vinculado al registro y accesible para todos los ejecutivos autorizados con trazabilidad de autoría.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm"
                >
                  Guardar Adjunto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
