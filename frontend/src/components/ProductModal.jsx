import React, { useState, useEffect } from 'react';

const translations = {
  am: {
    editProduct: "ምርት ማስተካከያ",
    addProduct: "አዲስ ምርት መመዝገቢያ",
    productName: "የምርት ስም",
    category: "ምድብ (Category)",
    general: "ጠቅላላ (General)",
    salePrice: "የመሸጫ ዋጋ",
    productType: "የምርት ዓይነት",
    stock: "ዕቃ (Stock)",
    service: "አገልግሎት (Service)",
    boughtPrice: "የመግዣ ዋጋ (ብር)",
    stockThreshold: "የማስጠንቀቂያ መጠን (አማራጭ)",
    unit: "መለኪያ (Unit)",
    selectUnit: "-- መለኪያ ይምረጡ --",
    units: {
      kg: "ኪሎ (Kg)", meter: "ሜትር (Meter)", sqm: "ካሬ ሜትር (Sq.m)",
      quintal: "ኩንታል (Quintal)", packet: "ፓኬት (Packet)", set: "ሴት (Set)",
      liter: "ሊትር (Liter)", box: "ካርቶን / ቦክስ (Box)", roll: "ሮል (Roll)", pcs: "ቁራጭ (Pcs)"
    },
    materialType: "የዕቃው ዓይነት (አማራጭ)",
    selectType: "-- ዓይነት ይምረጡ --",
    materials: {
      cement: "ሲሚንቶ (Cement)", ironBar: "ባለ ብረት / ፌሮ (Iron Bar)", roofingSheet: "ቆርቆሮ (Roofing Sheet)",
      pipes: "ፓይፕ / ቧንቧ (Pipes)", paint: "ቀለም (Paint)", plywood: "ፕላይዉድ (Plywood)",
      nails: "ሚስማር (Nails)", plumbing: "የቧንቧ ዕቃዎች (Plumbing)", sanitary: "የሳኒተሪ ዕቃዎች (Sanitary)",
      electrical: "የኤሌክትሪክ ዕቃዎች (Electrical)", other: "ሌላ (Other)"
    },
    medicineType: "የመድኃኒት ዓይነት (አማራጭ)",
    medicines: {
      syrup: "ሲሮፕ (Syrup)", suspension: "ሱሴንሽን (Suspension)", tablet: "ኪኒን (Tablet)",
      powder: "ፓውደር (Powder)", cream: "ክሬም (Cream)", ointment: "ቅባት (Ointment)",
      medicalDevice: "የሕክምና መሣሪያ (Medical Device)", capsule: "ካፕሱል (Capsule)", other: "ሌላ (Other)"
    },
    isSyrup: "ሲሮፕ / ፈሳሽ መድኃኒት ነው?",
    expiryDate: "የአገልግሎት ማብቂያ ቀን",
    inStoreQty: "በመጋዘን ያለ መጠን",
    inShopQty: "በሱቅ ያለ መጠን",
    cancel: "ሰርዝ",
    update: "አድስ (Update)",
    save: "መዝግብ (Save)"
  },
  om: {
    editProduct: "Gulaala Oomishaa",
    addProduct: "Oomisha Haaraa Galmeessi",
    productName: "Maqaa Oomishaa",
    category: "Gosa (Category)",
    general: "Waliigala (General)",
    salePrice: "Gattii Gurgurtaa",
    productType: "Gosa Oomishaa",
    stock: "Meesshaa (Stock)",
    service: "Tajaajila (Service)",
    boughtPrice: "Gattii Bittaa (Birr)",
    stockThreshold: "Akeekkachiisa Ammaa (Filiannoo)",
    unit: "Safartuu (Unit)",
    selectUnit: "-- Safartuu Filadhu --",
    units: {
      kg: "Kiloogiraama (Kg)", meter: "Meetira (Meter)", sqm: "Sondii Meetira (Sq.m)",
      quintal: "Kuntaala (Quintal)", packet: "Paakeetii (Packet)", set: "Seetii (Set)",
      liter: "Liitira (Liter)", box: "Saanduqa (Box)", roll: "Roolii (Roll)", pcs: "Cabaa (Pcs)"
    },
    materialType: "Gosa Meeshaa (Filiannoo)",
    selectType: "-- Gosa Filadhu --",
    materials: {
      cement: "Simintoos (Cement)", ironBar: "Sibiila / Sibiila Ijaarsaa (Iron Bar)", roofingSheet: "Qoorqoorroo (Roofing Sheet)",
      pipes: "Ummuxee / Uummoo (Pipes)", paint: "Halluu (Paint)", plywood: "Pilaayiwuudii (Plywood)",
      nails: "Misooma / Saamunaa Sibiilaa (Nails)", plumbing: "Meeshaa Bisani (Plumbing)", sanitary: "Meeshaa Qulqullinaa (Sanitary)",
      electrical: "Meeshaa Ibsaa (Electrical)", other: "Kan biraa (Other)"
    },
    medicineType: "Gosa Qoricha (Filiannoo)",
    medicines: {
      syrup: "Siirooppii (Syrup)", suspension: "Saspenshiinii (Suspension)", tablet: "Taanbleeti / Qoricha Akaakuu (Tablet)",
      powder: "Daakuu (Powder)", cream: "Kiriimii (Cream)", ointment: "Dibata / Moomii (Ointment)",
      medicalDevice: "Meeshaa Yaalaa (Medical Device)", capsule: "Kaapsuulii (Capsule)", other: "Kan biraa (Other)"
    },
    isSyrup: "Dhangala'aa/Syrup Dha?",
    expiryDate: "Guyyaa Booda Fayyadamuun Hin Danda'amne",
    inStoreQty: "Baay'ina Kuusaa (Store)",
    inShopQty: "Baay'ina Suuqii",
    cancel: "Dhiisi",
    update: "Haaressi",
    save: "Galmeessi"
  },
  en: {
    editProduct: "Edit Product",
    addProduct: "Add New Product",
    productName: "Product Name",
    category: "Category",
    general: "General",
    salePrice: "Sale Price",
    productType: "Product Type",
    stock: "Stock",
    service: "Service",
    boughtPrice: "Bought Price (Birr)",
    stockThreshold: "Stock Threshold (optional)",
    unit: "Unit",
    selectUnit: "-- Select Unit --",
    units: {
      kg: "Kg", meter: "Meter", sqm: "Sq.m", quintal: "Quintal", packet: "Packet",
      set: "Set", liter: "Liter", box: "Box", roll: "Roll", pcs: "Pcs"
    },
    materialType: "Material Type (optional)",
    selectType: "-- Select Type --",
    materials: {
      cement: "Cement", ironBar: "Iron Bar", roofingSheet: "Roofing Sheet", pipes: "Pipes",
      paint: "Paint", plywood: "Plywood", nails: "Nails", plumbing: "Plumbing",
      sanitary: "Sanitary", electrical: "Electrical", other: "Other"
    },
    medicineType: "Medicine Type (optional)",
    medicines: {
      syrup: "Syrup", suspension: "Suspension", tablet: "Tablet", powder: "Powder",
      cream: "Cream", ointment: "Ointment", medicalDevice: "Medical Device", capsule: "Capsule", other: "Other"
    },
    isSyrup: "Is Syrup/Liquid?",
    expiryDate: "Expiry Date",
    inStoreQty: "In Store Quantity",
    inShopQty: "In Shop Quantity",
    cancel: "Cancel",
    update: "Update",
    save: "Save"
  }
};

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

  const t = translations[lang] || translations.am;

  const isBuildingMode = 
    businessType === 'building' || 
    businessType === 'building_materials' || 
    businessType === 'buildingMaterials';

  // Helper date format convertor for <input type="date" />
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    handleSubmit({
      ...formData,
      price: Number(formData.price) || 0,
      boughtPrice: Number(formData.boughtPrice) || 0,
      quantity: Number(formData.quantity) || 0,
      inStoreQty: Number(formData.inStoreQty) || 0,
      stockThreshold: Number(formData.stockThreshold) || 0
    });
  };

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
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#0f172a', fontWeight: '700' }}>
          {editingId ? t.editProduct : t.addProduct}
        </h3>

        <form onSubmit={handleOnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
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
                min="0"
                step="any"
                value={formData.price ?? ''}
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
                min="0"
                step="any"
                value={formData.boughtPrice ?? ''}
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
                min="0"
                value={formData.stockThreshold ?? ''}
                onChange={(e) => setFormData({ ...formData, stockThreshold: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* BUILDING MATERIALS MODE FIELDS */}
          {isBuildingMode ? (
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                  {t.unit} *
                </label>
                <select
                  required
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="">{t.selectUnit}</option>
                  <option value="Kg">{t.units.kg}</option>
                  <option value="Meter">{t.units.meter}</option>
                  <option value="Sq.m">{t.units.sqm}</option>
                  <option value="Quintal">{t.units.quintal}</option>
                  <option value="Packet">{t.units.packet}</option>
                  <option value="Set">{t.units.set}</option>
                  <option value="Liter">{t.units.liter}</option>
                  <option value="Box">{t.units.box}</option>
                  <option value="Roll">{t.units.roll}</option>
                  <option value="Pcs">{t.units.pcs}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                  {t.materialType}
                </label>
                <select
                  value={formData.specificType || ''}
                  onChange={(e) => setFormData({ ...formData, specificType: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="">{t.selectType}</option>
                  <option value="Cement">{t.materials.cement}</option>
                  <option value="Iron Bar">{t.materials.ironBar}</option>
                  <option value="Roofing Sheet">{t.materials.roofingSheet}</option>
                  <option value="Pipes">{t.materials.pipes}</option>
                  <option value="Paint">{t.materials.paint}</option>
                  <option value="Plywood">{t.materials.plywood}</option>
                  <option value="Nails">{t.materials.nails}</option>
                  <option value="Plumbing">{t.materials.plumbing}</option>
                  <option value="Sanitary">{t.materials.sanitary}</option>
                  <option value="Electrical">{t.materials.electrical}</option>
                  <option value="Other">{t.materials.other}</option>
                </select>
              </div>
            </div>
          ) : (
            /* PHARMACY MODE FIELDS */
            <>
              <div>
                <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                  {t.medicineType}
                </label>
                <select
                  value={formData.specificType || ''}
                  onChange={(e) => setFormData({ ...formData, specificType: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="">{t.selectType}</option>
                  <option value="Syrup">{t.medicines.syrup}</option>
                  <option value="Suspension">{t.medicines.suspension}</option>
                  <option value="Tablet">{t.medicines.tablet}</option>
                  <option value="Powder">{t.medicines.powder}</option>
                  <option value="Cream">{t.medicines.cream}</option>
                  <option value="Ointment">{t.medicines.ointment}</option>
                  <option value="Medical Device">{t.medicines.medicalDevice}</option>
                  <option value="Capsule">{t.medicines.capsule}</option>
                  <option value="Other">{t.medicines.other}</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isSyrup"
                  checked={Boolean(formData.isSyrup)}
                  onChange={(e) => setFormData({ ...formData, isSyrup: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="isSyrup" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  {t.isSyrup}
                </label>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                  {t.expiryDate}
                </label>
                <input
                  type="date"
                  value={formatDateForInput(formData.expiryDate)}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
            </>
          )}

          {/* Store & Shop Quantities */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                {t.inStoreQty}
              </label>
              <input
                type="number"
                min="0"
                value={formData.inStoreQty ?? ''}
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
                min="0"
                value={formData.quantity ?? ''}
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