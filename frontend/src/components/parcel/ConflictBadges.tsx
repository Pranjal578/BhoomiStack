import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import type { LandTruthFlag } from '../../types';

interface ConflictBadgesProps {
  flags?: LandTruthFlag[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore?: number;
}

export default function ConflictBadges({ flags = [], riskLevel = 'LOW', riskScore }: ConflictBadgesProps) {
  if (!flags.length) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#ecfdf5',
        color: '#065f46',
        border: '1px solid #a7f3d0',
        borderRadius: 20,
        padding: '4px 12px',
        fontSize: 12,
        fontWeight: 600
      }}>
        <CheckCircle size={14} color="#059669" />
        Records Reconciled & Consistent
      </div>
    );
  }

  const highCount = flags.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = flags.filter((f) => f.severity === 'MEDIUM').length;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {riskScore !== undefined && (
        <span className={`badge badge-${riskLevel}`} style={{ fontWeight: 700 }}>
          <ShieldAlert size={13} />
          Risk Score: {riskScore}/100 ({riskLevel})
        </span>
      )}
      {highCount > 0 && (
        <span className="badge badge-HIGH" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <AlertTriangle size={13} />
          {highCount} Critical {highCount === 1 ? 'Mismatch' : 'Mismatches'}
        </span>
      )}
      {mediumCount > 0 && (
        <span className="badge badge-MEDIUM" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <AlertTriangle size={13} />
          {mediumCount} Minor Discrepancies
        </span>
      )}
    </div>
  );
}
