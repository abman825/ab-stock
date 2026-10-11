import React from 'react';

function ProductCard({ product, isAdded, isLowStock, isBuildingMode, addToCart, t }) {
  const qty = product.quantity ?? product.inShop ?? product.stock ?? 0;
  const expDate = product.expiryDate || product.expirationDate;
  
  const rawType = product.specificType || product.materialType || '';
  const rawUnit = product.unit || '';

  // Type ትርጉም በሁሉም ቦታዎች (Root, Lowercase, materials object) በመፈለግ ማግኘት
  const getTranslatedType = (type) => {
    if (!type || !t) return type;
    const lower = type.toLowerCase();
    
    return (
      t[type] || 
      t[lower] || 
      t.materials?.[type] || 
      t.materials?.[lower] || 
      t.medicines?.[type] || 
      t.medicines?.[lower] || 
      type
    );
  };

  // Unit ትርጉም በሁሉም ቦታዎች በመፈለግ ማግኘት
  const getTranslatedUnit = (unit) => {
    if (!unit || !t) return unit;
    const lower = unit.toLowerCase();
    
    return (
      t[unit] || 
      t[lower] || 
      t.units?.[unit] || 
      t.units?.[lower] || 
      unit
    );
  };

  const displayType = getTranslatedType(rawType);
  const displayUnit = getTranslatedUnit(rawUnit);

  return (
    <div 
      style={{ 
        background: '#fff', 
        borderRadius: '8px', 
        padding: '12px', 
        border: isLowStock ? '2px solid #dc3545' : '1px solid #e0e0e0', 
        textAlign: 'center',
        position: 'relative'
      }}
    >
      {isLowStock && (
        <span 
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            background: '#dc3545',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
        >
          {t?.lowStock || 'Low Stock'}
        </span>
      )}

      {/* Product Image Box */}
      <div style={{ height: '70px', background: '#f8f9fa', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '32px' }}>📦</span>
      </div>

      {/* Price */}
      <div style={{ background: '#e8f5e9', color: '#28a745', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '6px' }}>
        {Number(product.price || 0).toFixed(2)} {t?.birr || 'ETB'}
      </div>

      {/* Product Name */}
      <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#333' }}>{product.name}</div>
      
      {/* Product Specific/Material Type (Translated) */}
      {displayType && (
        <div style={{ marginTop: '3px', marginBottom: '3px' }}>
          <span style={{
            background: '#eff6ff',
            color: '#2563eb',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 8px',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            {displayType}
          </span>
        </div>
      )}

      {/* Quantity and Unit in brackets */}
      <div style={{ fontSize: '10px', color: isLowStock ? '#dc3545' : '#6c757d', fontWeight: isLowStock ? 'bold' : 'normal', marginBottom: '2px' }}>
        {t?.qty || 'Qty'}: {qty} {displayUnit ? `(${displayUnit})` : ''} {isLowStock && '⚠️'}
      </div>

      {/* Expiry Date (Pharmacy Mode ብቻ) */}
      {!isBuildingMode && (
        <div style={{ fontSize: '10px', color: expDate ? '#fd7e14' : '#adb5bd', fontWeight: '500', marginBottom: '8px' }}>
          {t?.exp || 'Exp'}: {expDate ? new Date(expDate).toLocaleDateString() : (t?.na || 'N/A')}
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={() => addToCart(product)}
        style={{
          width: '100%',
          background: isAdded ? '#17a2b8' : isLowStock ? '#dc3545' : '#0d6efd',
          color: '#fff',
          border: 'none',
          padding: '6px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 'bold',
          marginTop: isBuildingMode ? '6px' : '0'
        }}
      >
        {isAdded ? (t?.added || 'Added') : (t?.addToCart || 'Add to Cart')}
      </button>
    </div>
  );
}

export default ProductCard;