import React, { useState } from "react";
import {
  Download,
  Share,
  Trash2,
  Undo2,
  MoreVertical,
  Star,
  Trash,
  Eye,
  File as FileIcon,
  FileText,
  Sheet,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
} from "lucide-react";
import { UploadedFile } from "../types";


export type ViewMode = "grid" | "list";
export type SortBy = "name" | "date" | "size";
export type BulkAction =
  | "download"
  | "delete"
  | "share"
  | "restore"
  | "delete-permanently";

export interface FileExplorerProps {
  files: UploadedFile[];
  currentView: string;
  viewMode: ViewMode;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onFileAction: (action: string, file: UploadedFile) => void;
}

const fileIconFor = (type: UploadedFile["type"]) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-6 h-6 text-red-500" />;
    case "excel":
      return <Sheet className="w-6 h-6 text-emerald-500" />;
    case "image":
      return <ImageIcon className="w-6 h-6 text-purple-500" />;
    case "video":
      return <Film className="w-6 h-6 text-indigo-500" />;
    case "audio":
      return <Music className="w-6 h-6 text-amber-500" />;
    case "archive":
      return <Archive className="w-6 h-6 text-gray-500" />;
    default:
      return <FileIcon className="w-6 h-6 text-gray-500" />;
  }
};

const FileRow: React.FC<{
  file: UploadedFile;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onAction: (action: string, file: UploadedFile) => void;
  currentView: string;
}> = ({ file, isSelected, onToggleSelect, onAction, currentView }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group ${
        isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
      }`}
      onClick={(e) => {
        const t = e.target as Element;
        if (!t.closest(".action-button") && !t.closest("input")) {
          onToggleSelect(file.id);
        }
      }}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(file.id)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        {fileIconFor(file.type)}
        <p
          className="text-sm font-medium text-gray-900 dark:text-white truncate"
          title={file.name}
        >
          {file.name}
        </p>
      </div>

      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
        <span className="w-20 text-right">{file.size}</span>
        <span className="w-24 text-right">{file.modifiedDate}</span>
        <div className="flex items-center space-x-2">
          {file.favorite && (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          )}
          {file.deleted && <Trash className="w-4 h-4 text-red-500" />}
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded action-button"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <div className="py-1">
                {currentView !== "trash" ? (
                  <>
                    <button
                      onClick={() => onAction("preview", file)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Önizle</span>
                    </button>
                    <button
                      onClick={() => onAction("download", file)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>İndir</span>
                    </button>
                    <button
                      onClick={() => onAction("star", file)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Star className="w-4 h-4" />
                      <span>
                        {file.favorite ? "Yıldızdan Kaldır" : "Yıldızla"}
                      </span>
                    </button>
                    <button
                      onClick={() => onAction("share", file)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Share className="w-4 h-4" />
                      <span>Paylaş</span>
                    </button>
                    <button
                      onClick={() => onAction("delete", file)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Sil</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onAction("restore", file)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span>Kurtar</span>
                    </button>
                    <button
                      onClick={() => onAction("delete-permanently", file)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Kalıcı Sil</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  currentView,
  selectedIds,
  onToggleSelect,
  onFileAction,
}) => {
  return (
    <div>
      {files.map((file) => (
        <FileRow
          key={file.id}
          file={file}
          isSelected={selectedIds.includes(file.id)}
          onToggleSelect={onToggleSelect}
          onAction={onFileAction}
          currentView={currentView}
        />
      ))}
    </div>
  );
};
export default FileExplorer;