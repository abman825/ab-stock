import React from 'react';

export function BuildingFields({ formData, setFormData, t }) {
  return (
    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div>
        <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
          {t?.unit || 'Unit'} *
        </label>
        <select
          required
          value={formData?.unit || ''}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        >
          <option value="">{t?.selectUnit || 'Select Unit'}</option>
          <option value="Meter">{t?.units?.meter || 'Meter'}</option>
          <option value="Sq.m">{t?.units?.sqm || 'Sq.m'}</option>
          <option value="Quintal">{t?.units?.quintal || 'Quintal'}</option>
          <option value="Packet">{t?.units?.packet || 'Packet'}</option>
          <option value="Set">{t?.units?.set || 'Set'}</option>
          <option value="Liter">{t?.units?.liter || 'Liter'}</option>
          <option value="Box">{t?.units?.box || 'Box'}</option>
          <option value="Roll">{t?.units?.roll || 'Roll'}</option>
          <option value="Pcs">{t?.units?.pcs || 'Pcs'}</option>
          <option value="Kg">{t?.units?.kg || 'Kg'}</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
          {t?.materialType || 'Material Type'}
        </label>
        <select
          value={formData?.specificType || ''}
          onChange={(e) => setFormData({ ...formData, specificType: e.target.value })}
          style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        >
          <option value="">{t?.selectType || 'Select Type'}</option>
          <option value="Cement">{t?.materials?.cement || 'Cement'}</option>
          <option value="Iron Bar">{t?.materials?.ironBar || 'Iron Bar'}</option>
          <option value="Roofing Sheet">{t?.materials?.roofingSheet || 'Roofing Sheet'}</option>
          <option value="Pipes">{t?.materials?.pipes || 'Pipes'}</option>
          <option value="Paint">{t?.materials?.paint || 'Paint'}</option>
          <option value="Plywood">{t?.materials?.plywood || 'Plywood'}</option>
          <option value="Nails">{t?.materials?.nails || 'Nails'}</option>
          <option value="Plumbing">{t?.materials?.plumbing || 'Plumbing'}</option>
          <option value="Sanitary">{t?.materials?.sanitary || 'Sanitary'}</option>
          <option value="Electrical">{t?.materials?.electrical || 'Electrical'}</option>
          <option value="Other">{t?.materials?.other || 'Other'}</option>
        </select>
      </div>
    </div>
  );
}

export function PharmacyFields({ formData, setFormData, t }) {
  return (
    <>
      <div>
        <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
          {t?.medicineType || 'Medicine Type'}
        </label>
        <select
          value={formData?.specificType || ''}
          onChange={(e) => setFormData({ ...formData, specificType: e.target.value })}
          style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        >
          <option value="">{t?.selectType || 'Select Type'}</option>
          <option value="Syrup">{t?.medicines?.syrup || 'Syrup'}</option>
          <option value="Suspension">{t?.medicines?.suspension || 'Suspension'}</option>
          <option value="Tablet">{t?.medicines?.tablet || 'Tablet'}</option>
          <option value="Powder">{t?.medicines?.powder || 'Powder'}</option>
          <option value="Cream">{t?.medicines?.cream || 'Cream'}</option>
          <option value="Ointment">{t?.medicines?.ointment || 'Ointment'}</option>
          <option value="Medical Device">{t?.medicines?.medicalDevice || 'Medical Device'}</option>
          <option value="Capsule">{t?.medicines?.capsule || 'Capsule'}</option>
          <option value="Other">{t?.medicines?.other || 'Other'}</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          id="isSyrup"
          checked={formData?.isSyrup || false}
          onChange={(e) => setFormData({ ...formData, isSyrup: e.target.checked })}
          style={{ cursor: 'pointer' }}
        />
        <label htmlFor="isSyrup" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
          {t?.isSyrup || 'Is Syrup'}
        </label>
      </div>

      <div>
        <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
          {t?.expiryDate || 'Expiry Date'}
        </label>
        <input
          type="date"
          value={formData?.expiryDate || ''}
          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>
    </>
  );
}