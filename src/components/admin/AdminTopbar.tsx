'use client';

import Link from 'next/link';
import { ChevronRight, Undo2, Redo2, Eye, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useState } from 'react';

type SaveState = 'idle' | 'saving' | 'saved';

export type Device = 'desktop' | 'tablet' | 'mobile';

interface AdminTopbarProps {
  crumbs: { label: string; href?: string }[];
  saveState?: SaveState;
  device?: Device;
  onDeviceChange?: (d: Device) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  publishing?: boolean;
  rightExtra?: React.ReactNode;
}

const SAVE_LABELS: Record<SaveState, string> = {
  idle: 'Brouillon · synchronisé',
  saving: 'Enregistrement…',
  saved: 'Enregistré · à l\'instant',
};

export default function AdminTopbar({
  crumbs,
  saveState = 'idle',
  device,
  onDeviceChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onPublish,
  publishing,
  rightExtra,
}: AdminTopbarProps) {
  return (
    <header className="h-13 border-b border-gray-200 bg-white flex items-center px-4 gap-3 sticky top-0 z-30" style={{ height: 52 }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-gray-600 min-w-0">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            {c.href ? (
              <Link href={c.href} className="hover:text-gray-900 truncate">{c.label}</Link>
            ) : (
              <span className={i === crumbs.length - 1 ? 'text-gray-900 font-medium truncate' : 'truncate'}>{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Device switch */}
      {device && onDeviceChange && (
        <div className="ml-4 flex bg-gray-100 rounded-md p-0.5">
          {([
            ['desktop', Monitor],
            ['tablet',  Tablet],
            ['mobile',  Smartphone],
          ] as const).map(([d, Icon]) => (
            <button
              key={d}
              type="button"
              onClick={() => onDeviceChange(d)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
                device === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title={d}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        <SavePill state={saveState} />

        {(onUndo || onRedo) && (
          <div className="flex items-center gap-0.5">
            <IconBtn title="Annuler (⌘Z)" disabled={!canUndo} onClick={onUndo}>
              <Undo2 className="w-3.5 h-3.5" />
            </IconBtn>
            <IconBtn title="Rétablir (⌘⇧Z)" disabled={!canRedo} onClick={onRedo}>
              <Redo2 className="w-3.5 h-3.5" />
            </IconBtn>
          </div>
        )}

        {rightExtra}

        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            className="h-7 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-[13px] font-medium flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Aperçu
          </button>
        )}

        {onPublish && (
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing}
            className="h-7 px-3 rounded-md bg-gray-900 text-white hover:bg-black text-[13px] font-medium disabled:opacity-50"
          >
            {publishing ? 'Publication…' : 'Publier'}
          </button>
        )}
      </div>
    </header>
  );
}

function SavePill({ state }: { state: SaveState }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-gray-500">
      <span className={`w-1.5 h-1.5 rounded-full ${
        state === 'saving' ? 'bg-amber-500 animate-pulse' :
        state === 'saved'  ? 'bg-green-500' : 'bg-green-500'
      }`} />
      {SAVE_LABELS[state]}
    </span>
  );
}

function IconBtn({
  children, onClick, disabled, title,
}: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-6 h-6 grid place-items-center rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
