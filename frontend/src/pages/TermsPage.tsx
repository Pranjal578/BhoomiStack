import React from 'react';
import { Scale, AlertTriangle, FileText, Globe, Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 90, paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px', background: '#fef3c7', color: '#92400e',
            borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 16
          }}>
            <Scale size={14} /> Terms &amp; Conditions
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Terms and Conditions of Use
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Last updated: September 2026 &nbsp;|&nbsp; Governing Law: Laws of India
          </p>
        </div>

        {/* Disclaimer Banner */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12,
          padding: '20px 24px', marginBottom: 36,
          display: 'flex', alignItems: 'flex-start', gap: 16
        }}>
          <AlertTriangle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Important Disclaimer</div>
            <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
              BhoomiStack is a <strong>demonstration prototype</strong> of a proposed national Digital Public Infrastructure
              for land governance. Data shown is illustrative and sourced from anonymised/synthetic records for the
              Prayagraj district of Uttar Pradesh. It does NOT constitute official government records and must NOT be used for
              any legal, financial, or real-estate transaction decisions.
            </div>
          </div>
        </div>

        {/* Sections */}
        {[
          {
            icon: <FileText size={20} />,
            title: '1. Acceptance of Terms',
            content: [
              'By accessing or using the BhoomiStack platform ("the Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms, you must not use the Platform.',
              'These Terms apply to all users of the Platform, including citizens, government officials, researchers, developers, and automated systems.',
              'The Government of India reserves the right to modify these Terms at any time. Continued use after modification constitutes acceptance of the updated Terms.'
            ]
          },
          {
            icon: <Globe size={20} />,
            title: '2. Nature of the Platform',
            content: [
              'BhoomiStack is a Digital Public Infrastructure (DPI) prototype designed to demonstrate integrated land governance through convergence of GIS cadastral maps, revenue records (Bhulekh), sub-registrar records (IGRS), municipal tax data, and banking lien (CERSAI) data.',
              'The Platform operates as a demonstration system. All land records, parcel data, ownership information, and certificates shown are illustrative. They do not represent live, legally binding, or officially certified government records unless explicitly stated by the competent authority.',
              'The official and legally binding land records continue to reside with respective State Revenue Departments, Sub-Registrar Offices, Municipal Boards, and Courts as per applicable laws.'
            ]
          },
          {
            icon: <Scale size={20} />,
            title: '3. Permitted Use',
            content: [
              'You may use the Platform solely for the following permitted purposes:',
              '• Understanding the architecture and capabilities of integrated land governance systems',
              '• Policy research, academic study, and government evaluation of DPI models',
              '• Demonstration to stakeholders of how land data convergence works',
              '• Testing and providing feedback on the BhoomiStack prototype system',
              'You may NOT use the Platform for: any commercial purpose without express written permission; extracting, scraping, or bulk downloading data; attempting to gain unauthorized access to system components; presenting Platform outputs as official government records; or any purpose that contravenes applicable Indian law.'
            ]
          },
          {
            icon: <Shield size={20} />,
            title: '4. Role-Based Access & Security',
            content: [
              'The Platform implements Role-Based Access Control (RBAC) with five defined roles: Citizen, Revenue Officer, Planning Officer, Municipal Officer, and Administrator. Each role has strictly defined permissions enforced at the API level.',
              'Demo credentials provided on the login page are for demonstration purposes only. You must not attempt to circumvent RBAC controls, access data beyond your assigned role, or share credentials with unauthorized parties.',
              'All access to the Platform is logged. Unauthorized access attempts will be reported to CERT-In and relevant law enforcement agencies as required under the Information Technology Act, 2000.'
            ]
          },
          {
            icon: <AlertTriangle size={20} />,
            title: '5. Data Accuracy Disclaimer',
            content: [
              'The Platform displays synthesized and illustrative data. While the architecture faithfully represents how a production BhoomiStack system would integrate real government data, the specific records, parcel data, ownership names, and anomalies shown are NOT live or legally verified records.',
              'Verification Certificates generated by the Platform ("Land Title Verification Certificate") are demonstration documents only. They carry no legal weight and must not be submitted to any court, bank, government office, or used in any real-estate, financial, or legal proceeding.',
              'The Government of India, the project team, and hosting providers expressly disclaim all liability for any loss or damage arising from reliance on Platform data.'
            ]
          },
          {
            icon: <Scale size={20} />,
            title: '6. Intellectual Property',
            content: [
              'The BhoomiStack platform, its source code, design, and documentation are the property of the Department of Land Resources, Ministry of Rural Development, Government of India.',
              'The underlying land record data, GIS cadastral maps, and official datasets belong to their respective originating departments and are protected by applicable data governance laws.',
              'You may not reproduce, distribute, modify, or create derivative works from Platform content without express written permission from the Department of Land Resources.'
            ]
          },
          {
            icon: <Globe size={20} />,
            title: '7. Governing Law & Dispute Resolution',
            content: [
              'These Terms are governed by the laws of India, including the Information Technology Act, 2000; the Digital Personal Data Protection Act, 2023; the Land Acquisition Act, 2013 (as applicable); and all other applicable Central and State laws.',
              'Any dispute arising from use of the Platform shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.',
              'For grievances related to data protection, users may contact the Data Protection Officer (see Privacy Policy) before approaching the Data Protection Board of India.'
            ]
          },
          {
            icon: <FileText size={20} />,
            title: '8. Limitation of Liability',
            content: [
              'To the maximum extent permitted by applicable law, BhoomiStack and the Government of India shall not be liable for: any indirect, incidental, or consequential damages; loss of data or profits arising from use of the Platform; decisions made based on Platform data; or any technical errors, outages, or service interruptions.',
              'The Platform is provided "as-is" for demonstration purposes without any warranty of fitness for a particular purpose, merchantability, or uninterrupted availability.'
            ]
          }
        ].map((section, idx) => (
          <div key={idx} className="card" style={{ marginBottom: 20, padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#fef3c7', color: '#92400e',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {section.icon}
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{section.title}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.content.map((para, i) => (
                <p key={i} style={{
                  fontSize: 14, color: '#475569', lineHeight: 1.8,
                  ...(para.startsWith('•') ? { paddingLeft: 8 } : {})
                }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* Footer Note */}
        <div style={{ textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 13 }}>
          <p>By using BhoomiStack, you acknowledge that you have read, understood, and agree to these Terms.</p>
          <p style={{ marginTop: 8 }}>
            <a href="/privacy" style={{ color: '#1a56db', textDecoration: 'none' }}>Privacy Policy</a>
            {' '}·{' '}
            <a href="/" style={{ color: '#1a56db', textDecoration: 'none' }}>Return to Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
