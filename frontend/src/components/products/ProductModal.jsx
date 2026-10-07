import React, { useState, useEffect } from 'react';
import { modalTranslations } from './productModalTranslations';
import { BuildingFields, PharmacyFields } from './ProductFormFields';

function ProductModal({
  showModal,
  editingId,
  formData,
  setFormData,
  categories,
  businessType,
  handleCloseModal,
  handleSubmit
}) {
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('appLanguage') || 'am');
    };
    window.addEventListener('storage', handleLangChange);
    window.addEventListener('languageChanged', handleLangChange);
    return () => {
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  if (!showModal) return null;

  const t = modalTranslations[lang] || modalTranslations.am;

  const isBuildingMode = 
    businessType === 'building' || 
    businessType === 'building_materials' || 
    businessType === 'buildingMaterials';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px'
    }}>
      <div className="modal-content" style={{
        background: '#ffffff', 
        padding: '24px', 
        borderRadius: '12px', 
        width: '100%', 
        maxWidth: '520px', 
        maxHeight: '90vh', 
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        
        {/* Header */}
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#0f172a', fontWeight: '700' }}>
          {editingId ? t.editProduct : t.addProduct}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Product Name */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
              {t.productName} *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
              {t.category} *
            </label>
            <select
              required
              value={formData.category || 'General'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              {categories && categories.length === 0 ? (
                <option value="General">{t.general}</option>
              ) : (
                categories && categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Sale Price & Product Type */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                {t.salePrice} *
              </label>
              <input
                type="number"
                required
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                {t.productType} *
              </label>
              <select
                value={formData.productType || 'Stock'}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              >
                <option value="Stock">{t.stock}</option>
                <option value="Service">{t.service}</option>
              </select>
            </div>
          </div>

          {/* Bought Price & Stock Threshold */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                {t.boughtPrice} *
              </label>
              <input
                type="number"
                required
                value={formData.boughtPrice || ''}
                onChange={(e) => setFormData({ ...formData, boughtPrice: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                {t.stockThreshold}
              </label>
              <input
                type="number"
                value={formData.stockThreshold || ''}
                onChange={(e) => setFormData({ ...formData, stockThreshold: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Dynamic Fields Section */}
          {isBuildingMode ? (
  <BuildingFields formData={formData} setFormData={setFormData} t={t} />
) : (
  <PharmacyFields formData={formData} setFormData={setFormData} t={t} />
)}

          {/* Store & Shop Quantities */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                {t.inStoreQty}
              </label>
              <input
                type="number"
                value={formData.inStoreQty || ''}
                onChange={(e) => setFormData({ ...formData, inStoreQty: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                {t.inShopQty}
              </label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
            <button
              type="button"
              onClick={handleCloseModal}
              style={{
                flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569',
                border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              style={{
                flex: 1, padding: '10px', background: '#2563eb', color: '#ffffff',
                border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              {editingId ? t.update : t.save}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ProductModal;