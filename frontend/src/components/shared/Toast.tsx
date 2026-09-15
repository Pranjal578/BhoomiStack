import React from 'react';
import { useUiStore } from '../../store';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useUiStore();

  if (!toasts.length) return null;

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    warning: <AlertTriangle size={18} color="#f59e0b" />,
    error: <AlertCircle size={18} color="#ef4444" />,
    info: <Info size={18} color="#3b82f6" />
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 400
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: '#0f172a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {icons[toast.type] || icons.info}
          <div style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 2
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
