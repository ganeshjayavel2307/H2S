import React from 'react';
import { Globe2, MapPin, Building2, ArrowRight } from 'lucide-react';

export default function LocationPromptBanner({ step = 'city', cityName = '', areaName = '', onQuickSelect }) {
  if (step === 'city') {
    return (
      <div className="content-card animate-fade" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px dashed rgba(6, 182, 212, 0.35)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: '#22d3ee'
        }}>
          <Globe2 size={32} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f9fafb', marginBottom: '0.5rem' }}>
          Please select a city to continue.
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
          Use the <strong>[ Select City ▼ ]</strong> dropdown above to choose <strong>Chennai</strong> or <strong>Coimbatore</strong>. Healthcare telemetry, patient demand, and medicine inventory will unlock sequentially.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-info" style={{ padding: '0.4rem 0.8rem' }}>
            Step 1: Select City (Chennai / Coimbatore)
          </span>
          <span className="badge badge-neutral" style={{ padding: '0.4rem 0.8rem' }}>
            Step 2: Select Area
          </span>
          <span className="badge badge-neutral" style={{ padding: '0.4rem 0.8rem' }}>
            Step 3: Select PHC
          </span>
        </div>
      </div>
    );
  }

  if (step === 'area') {
    return (
      <div className="content-card animate-fade" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px dashed rgba(245, 158, 11, 0.35)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: '#fbbf24'
        }}>
          <MapPin size={32} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f9fafb', marginBottom: '0.5rem' }}>
          Please select an area.
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
          City <strong>{cityName}</strong> active. Please choose a local area in {cityName} (such as <em>{cityName === 'Chennai' ? 'Porur, Tambaram, Kelambakkam, Ambattur, Anna Nagar, Adyar' : 'Gandhipuram, RS Puram, Peelamedu, Singanallur, Saibaba Colony'}</em>) from the <strong>[ Select Area ▼ ]</strong> dropdown.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem' }}>
            ✓ City: {cityName}
          </span>
          <span className="badge badge-warning" style={{ padding: '0.4rem 0.8rem' }}>
            Step 2: Select Area Required
          </span>
          <span className="badge badge-neutral" style={{ padding: '0.4rem 0.8rem' }}>
            Step 3: Select PHC
          </span>
        </div>
      </div>
    );
  }

  if (step === 'phc') {
    return (
      <div className="content-card animate-fade" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px dashed rgba(139, 92, 246, 0.35)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: '#a78bfa'
        }}>
          <Building2 size={32} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f9fafb', marginBottom: '0.5rem' }}>
          Please select a PHC.
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
          Area <strong>{areaName}</strong> in <strong>{cityName}</strong> selected. Choose a specific Primary Health Centre from <strong>[ Select PHC ▼ ]</strong> to load patient telemetry, medicine inventory ledger, and stock-out alerts.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem' }}>
            ✓ City: {cityName}
          </span>
          <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem' }}>
            ✓ Area: {areaName}
          </span>
          <span className="badge badge-critical" style={{ padding: '0.4rem 0.8rem' }}>
            Step 3: Select PHC Required
          </span>
        </div>
      </div>
    );
  }

  return null;
}
