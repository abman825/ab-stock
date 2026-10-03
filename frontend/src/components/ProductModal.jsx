import React from 'react';

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
  if (!showModal) return null;

  // Business Type 'building' ወይም 'building_materials' መሆኑን ወይም default መሆኑን ማረጋገጫ
  const isBuildingMode = 
    businessType === 'building' || 
    businessType === 'building_materials' || 
    businessType === 'buildingMaterials';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px'
    }}>
      <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>
          {editingId ? 'Edit Product' : 'Add New Product'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Product Name */}
          <div>
            <label style={{ fontSize: '11px', color: '#6c757d' }}>Product Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: '11px', color: '#6c757d' }}>Category *</label>
            <select
              required
              value={formData.category || 'General'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            >
              {categories && categories.length === 0 ? (
                <option value="General">General</option>
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
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#6c757d' }}>Sale Price *</label>
              <input
                type="number"
                required
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#6c757d' }}>Product Type *</label>
              <select
                value={formData.productType || 'Stock'}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
              >
                <option value="Stock">Stock</option>
                <option value="Service">Service</option>
              </select>
            </div>
          </div>

          {/* Bought Price & Stock Threshold */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#6c757d' }}>Bought Price (Birr) *</label>
              <input
                type="number"
                required
                value={formData.boughtPrice || ''}
                onChange={(e) => setFormData({ ...formData, boughtPrice: e.target.value })}
                placeholder="Required"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#6c757d' }}>Stock Threshold (optional)</label>
              <input
                type="number"
                value={formData.stockThreshold || ''}
                onChange={(e) => setFormData({ ...formData, stockThreshold: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Unit & Material/Specific Type Fields */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#6c757d' }}>Unit (ለ Store/Shop) *</label>
              <select
                required
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
              >
                <option value="">-- Select Unit --</option>
                <option value="Kg">Kg</option>
                <option value="Meter">Meter</option>
                <option value="Sq.m">Sq.m</option>
                <option value="Quintal">Quintal</option>
                <option value="Packet">Packet</option>
                <option value="Set">Set</option>
                <option value="Liter">Liter</option>
                <option value="Box">Box</option>
                <option value="Roll">Roll</option>
                <option value="Pcs">Pcs</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#6c757d' }}>Material Type (optional)</label>
              <select
                value={formData.specificType || ''}
                onChange={(e) => setFormData({ ...formData, specificType: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
              >
                <option value="">Select Type</option>
                <option value="Cement">Cement</option>
                <option value="Iron Bar">Iron Bar</option>
                <option value="Roofing Sheet">Roofing Sheet</option>
                <option value="Pipes">Pipes</option>
                <option value="Paint">Paint</option>
                <option value="Plywood">Plywood</option>
                <option value="Nails">Nails</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Sanitary">Sanitary</option>
                <option value="Electrical">Electrical</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Pharmacy specific fields (በ pharmacy mode ብቻ የሚታዩ) */}
          {!isBuildingMode && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isSyrup"
                  checked={formData.isSyrup || false}
                  onChange={(e) => setFormData({ ...formData, isSyrup: e.target.checked })}
                />
                <label htmlFor="isSyrup" style={{ fontSize: '12px' }}>Is Syrup/Liquid?</label>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#6c757d' }}>Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                />
              </div>
            </>
          )}

          {/* Quantities */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#6c757d' }}>In Store Quantity</label>
              <input
                type="number"
                value={formData.inStoreQty || ''}
                onChange={(e) => setFormData({ ...formData, inStoreQty: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#6c757d' }}>In Shop Quantity</label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              type="button"
              onClick={handleCloseModal}
              style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: '10px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ProductModal;