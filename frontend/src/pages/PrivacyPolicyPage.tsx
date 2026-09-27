import React from 'react';
import { Shield, Lock, Eye, Server, Mail, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 90, paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px', background: '#e0e7ff', color: '#3730a3',
            borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 16
          }}>
            <Shield size={14} /> Legal &amp; Compliance
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Last updated: September 2026 &nbsp;|&nbsp; Effective from: October 2026
          </p>
        </div>

        {/* Notice Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
          color: '#e0e7ff', borderRadius: 12, padding: '20px 24px', marginBottom: 36,
          display: 'flex', alignItems: 'flex-start', gap: 16
        }}>
          <Lock size={24} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Government Data Protection Notice</div>
            <div style={{ fontSize: 13, color: '#c7d2fe', lineHeight: 1.6 }}>
              BhoomiStack is a Digital Public Infrastructure (DPI) demonstration prototype compliant with India's
              Digital Personal Data Protection Act, 2023 (DPDPA), CERT-In guidelines, and the NIC Data Privacy Framework.
              Land record data accessed through this platform is governed by applicable State Land Revenue Acts.
            </div>
          </div>
        </div>

        {/* Sections */}
        {[
          {
            icon: <Eye size={20} />,
            title: '1. Information We Collect',
            content: `BhoomiStack collects the following categories of information:

**Account Information:** Government email address, name, department role, and employee ID when you sign in through the Role-Based Access Control (RBAC) system.

**Usage Data:** Pages visited, features used, parcels queried, verification requests made, and timestamps of these actions for audit logging purposes.

**Technical Data:** IP address, browser type, device information, and session tokens for security and fraud detection.

**Land Record Queries:** ULPIN (Unique Land Parcel Identification Numbers), Khasra numbers, and associated search terms you enter to query the integrated land registry database.

We do NOT collect biometric data, financial details beyond what is already in integrated departmental records, or any data not necessary for land governance functions.`
          },
          {
            icon: <Server size={20} />,
            title: '2. How We Use Your Data',
            content: `Your data is used exclusively for the following lawful purposes:

• **Authentication & Authorization:** Verifying your government identity and enforcing role-based access boundaries (citizen, revenue officer, planning officer, municipal officer, admin).

• **Land Record Services:** Executing parcel lookups, cross-department data reconciliation, fraud/anomaly detection, and generating tamper-proof verification certificates.

• **Audit Trails:** Maintaining immutable logs of all record modifications, certificate issuances, and administrative actions as required by the Right to Information Act and departmental audit standards.

• **System Security:** Detecting unauthorized access, bot activity, and ensuring CERT-In compliance.

• **Service Improvement:** Aggregated, anonymized analytics to improve system performance and usability.

We never use your data for advertising, profiling for commercial purposes, or selling to third parties.`
          },
          {
            icon: <Shield size={20} />,
            title: '3. Data Security',
            content: `BhoomiStack implements multiple layers of security:

• **Encryption in Transit:** All communications use TLS 1.3. HTTP connections are automatically redirected to HTTPS.

• **JWT Authentication:** Short-lived (8-hour) JSON Web Tokens with RS256 signing. Tokens are stored in browser memory, not persistent cookies.

• **Role-Based Access Control:** Strict departmental boundaries enforced server-side. No cross-department data leakage is architecturally possible.

• **Audit Logging:** Every data access and modification event is logged with user identity, timestamp, and action type.

• **Infrastructure Security:** Deployed on isolated containers with restricted network access per CERT-In guidelines (CISA/4/2022).

• **No Secrets on Frontend:** API keys and secret tokens are never exposed in client-side code.

In the event of a data breach, affected users will be notified within 72 hours as required by DPDPA Section 8.`
          },
          {
            icon: <FileText size={20} />,
            title: '4. Data Sharing & Third Parties',
            content: `Land record data integrated into BhoomiStack originates from and is shared back with the following authorised government departments only:

• Revenue Department (Bhulekh / RoR records)
• Inspector General of Registration and Stamps (IGRS)
• Town & Country Planning Department
• Municipal Bodies (Property Tax Records)
• Banking institutions via CERSAI (mortgage records)
• District Courts (litigation records)

No data is shared with private entities, commercial data brokers, or foreign parties. Inter-departmental sharing follows the NGDAS (National Geospatial Data Sharing Policy) framework.`
          },
          {
            icon: <Eye size={20} />,
            title: '5. Your Rights (Data Principal Rights)',
            content: `Under the Digital Personal Data Protection Act, 2023, you have the right to:

• **Access:** Request a summary of personal data BhoomiStack holds about you.
• **Correction:** Request correction of inaccurate personal data.
• **Erasure:** Request deletion of your account data (subject to audit retention requirements of 7 years).
• **Nomination:** Nominate a representative to exercise these rights on your behalf.
• **Grievance Redressal:** File a complaint with our Data Protection Officer (see contact below).

To exercise any of these rights, write to the DPO at the address below with your government employee ID.`
          },
          {
            icon: <Lock size={20} />,
            title: '6. Cookies & Local Storage',
            content: `BhoomiStack uses browser storage minimally and only for functional purposes:

• **Session Token (localStorage):** Your JWT authentication token is stored in browser localStorage under the key \`bhoomi_token\`. This expires in 8 hours and is cleared on logout.

• **User Preferences (localStorage):** Your selected map layer preferences and UI settings.

• **Analytics Cookie (if enabled):** An anonymous session identifier for aggregate usage statistics. You may opt out via the Cookie Consent banner.

We do NOT use tracking cookies, third-party advertising cookies, or fingerprinting technologies.`
          },
          {
            icon: <Mail size={20} />,
            title: '7. Contact & Grievance Redressal',
            content: `**Data Protection Officer (DPO)**
BhoomiStack Project Directorate
Department of Land Resources
Ministry of Rural Development, Government of India

**Email:** dpo@bhoomistack.gov.in
**Postal Address:** Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi – 110001

**Grievance Redressal Timeline:** We will acknowledge your complaint within 48 hours and resolve it within 30 days. If unsatisfied, you may approach the Data Protection Board of India.`
          }
        ].map((section, idx) => (
          <div key={idx} className="card" style={{ marginBottom: 20, padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#e0e7ff', color: '#3730a3',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {section.icon}
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{section.title}</h2>
            </div>
            <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {section.content.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <strong key={i} style={{ color: '#0f172a', display: 'block', marginTop: 12, marginBottom: 4 }}>{line.replace(/\*\*/g, '')}</strong>;
                }
                if (line.startsWith('• **')) {
                  const parts = line.replace('• **', '').split('**:');
                  return <div key={i} style={{ marginBottom: 8 }}>• <strong style={{ color: '#0f172a' }}>{parts[0]}:</strong>{parts[1]}</div>;
                }
                if (line.startsWith('•')) {
                  return <div key={i} style={{ marginBottom: 6 }}>{line}</div>;
                }
                return <span key={i}>{line}{'\n'}</span>;
              })}
            </div>
          </div>
        ))}

        {/* Footer Note */}
        <div style={{ textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 13 }}>
          <p>This privacy policy may be updated periodically. Continued use of BhoomiStack constitutes acceptance of the updated policy.</p>
          <p style={{ marginTop: 8 }}>
            <a href="/terms" style={{ color: '#1a56db', textDecoration: 'none' }}>Terms &amp; Conditions</a>
            {' '}·{' '}
            <a href="/" style={{ color: '#1a56db', textDecoration: 'none' }}>Return to Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
