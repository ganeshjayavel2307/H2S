import React from 'react';
import { Users, UserCheck, Stethoscope, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function StaffAttendanceView({ facilities }) {
  let totalDocs = 0, onDutyDocs = 0;
  let totalNurses = 0, onDutyNurses = 0;
  let totalPharms = 0, onDutyPharms = 0;
  let totalParams = 0, onDutyParams = 0;

  facilities.forEach(f => {
    totalDocs += f.staff.doctors.total;
    onDutyDocs += f.staff.doctors.onDuty;
    totalNurses += f.staff.nurses.total;
    onDutyNurses += f.staff.nurses.onDuty;
    totalPharms += f.staff.pharmacists.total;
    onDutyPharms += f.staff.pharmacists.onDuty;
    totalParams += f.staff.paramedics.total;
    onDutyParams += f.staff.paramedics.onDuty;
  });

  return (
    <div className="animate-fade">
      {/* Attendance KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Doctors & Physicians</div>
            <div className="kpi-value">{totalDocs > 0 ? ((onDutyDocs / totalDocs) * 100).toFixed(1) : 0}%</div>
            <div className="kpi-subtext">{onDutyDocs} / {totalDocs} On Active Duty</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-cyan" style={{ width: `${totalDocs > 0 ? (onDutyDocs / totalDocs) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan"><Stethoscope size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Nursing Staff</div>
            <div className="kpi-value">{totalNurses > 0 ? ((onDutyNurses / totalNurses) * 100).toFixed(1) : 0}%</div>
            <div className="kpi-subtext">{onDutyNurses} / {totalNurses} On Active Duty</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-emerald" style={{ width: `${totalNurses > 0 ? (onDutyNurses / totalNurses) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald"><UserCheck size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Clinical Pharmacists</div>
            <div className="kpi-value">{totalPharms > 0 ? ((onDutyPharms / totalPharms) * 100).toFixed(1) : 0}%</div>
            <div className="kpi-subtext">{onDutyPharms} / {totalPharms} Managing Dispensaries</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-violet" style={{ width: `${totalPharms > 0 ? (onDutyPharms / totalPharms) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-violet"><Users size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Emergency Paramedics</div>
            <div className="kpi-value">{totalParams > 0 ? ((onDutyParams / totalParams) * 100).toFixed(1) : 0}%</div>
            <div className="kpi-subtext">{onDutyParams} / {totalParams} On Emergency Response</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-amber" style={{ width: `${totalParams > 0 ? (onDutyParams / totalParams) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber"><Clock size={22} /></div>
        </div>
      </div>

      {/* Facility Staff Roster Grid */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Users size={20} color="#06b6d4" />
            Healthcare Facility Medical Personnel Roster & Attendance
          </div>
          <span className="badge badge-success">Live Biometric / Shift Sync Active</span>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Medical Superintendent / In-Charge</th>
                <th>Doctors On Duty</th>
                <th>Nurses On Duty</th>
                <th>Pharmacists On Duty</th>
                <th>Paramedics On Duty</th>
                <th>Overall Staffing Status</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map(f => {
                const docRate = ((f.staff.doctors.onDuty / f.staff.doctors.total) * 100).toFixed(1);
                const nurseRate = ((f.staff.nurses.onDuty / f.staff.nurses.total) * 100).toFixed(1);

                return (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f3f4f6' }}>{f.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{f.type} • {f.stateId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.contactPerson}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: parseFloat(docRate) < 80 ? '#fbbf24' : '#f3f4f6' }}>
                        {f.staff.doctors.onDuty} / {f.staff.doctors.total} ({docRate}%)
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.staff.doctors.onLeave} on leave</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {f.staff.nurses.onDuty} / {f.staff.nurses.total} ({nurseRate}%)
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.staff.nurses.onLeave} on leave</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {f.staff.pharmacists.onDuty} / {f.staff.pharmacists.total}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {f.staff.paramedics.onDuty} / {f.staff.paramedics.total}
                      </div>
                    </td>
                    <td>
                      {parseFloat(docRate) < 80 ? (
                        <span className="badge badge-warning">Staffing Strain</span>
                      ) : (
                        <span className="badge badge-success">Optimal Coverage</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
