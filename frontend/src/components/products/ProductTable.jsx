import React from 'react';

function ProductTable({ filteredProducts, isBuilding, t, handleEditClick, handleDelete }) {
  
  // 1. Type ትርጉም መፈለግ (Case-insensitive & Nesting support)
  const getTranslatedType = (type) => {
    if (!type || !t) return type;
    const lower = type.toLowerCase();
    
    return (
      t[type] || 
      t[lower] || 
      t.materials?.[type] || 
      t.materials?.[lower] || 
      type
    );
  };

  // 2. Unit ትርጉም መፈለግ
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

  return (
    <div className="table-container">
      <table className="products-table">
        <thead>
          <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6', color: '#6c757d' }}>
            <th style={{ padding: '10px' }}>{t.thName}</th>
            <th style={{ padding: '10px' }}>{t.thCategory}</th>
            <th style={{ padding: '10px' }}>{t.thProdType}</th>
            
            {isBuilding ? (
              <>
                <th style={{ padding: '10px' }}>{t.thMaterialType}</th>
                <th style={{ padding: '10px' }}>{t.thUnit}</th>
              </>
            ) : (
              <th style={{ padding: '10px' }}>{t.thSpecificType}</th>
            )}

            <th style={{ padding: '10px' }}>{t.thSalePrice}</th>
            <th style={{ padding: '10px' }}>{t.thBoughtPrice}</th>
            <th style={{ padding: '10px' }}>{t.thInStore}</th>
            <th style={{ padding: '10px' }}>{t.thInShop}</th>
            <th style={{ padding: '10px' }}>{t.thInvoice}</th>
            {!isBuilding && <th style={{ padding: '10px' }}>{t.thExpiry}</th>}
            <th style={{ padding: '10px' }}>{t.thActions}</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={isBuilding ? "11" : "10"} style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                {t.noProducts}
              </td>
            </tr>
          ) : (
            filteredProducts.map((p) => {
              const exp = p.expiryDate || p.expirationDate;
              const qty = p.quantity ?? p.inShop ?? 0;
              
              const rawType = p.specificType || p.materialType || '';
              const displayType = getTranslatedType(rawType);
              const displayUnit = getTranslatedUnit(p.unit);

              return (
                <tr key={p._id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>{p.name}</td>
                  <td style={{ padding: '8px 10px' }}>{p.category}</td>
                  <td style={{ padding: '8px 10px' }}>{p.productType || 'Stock'}</td>
                  
                  {isBuilding ? (
                    <>
                      <td style={{ padding: '8px 10px', color: '#0d6efd', fontWeight: '500' }}>
                        {displayType || t.na}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>
                        {displayUnit || '-'}
                      </td>
                    </>
                  ) : (
                    <td style={{ padding: '8px 10px' }}>{displayType || t.na}</td>
                  )}

                  <td style={{ padding: '8px 10px' }}>{p.price} {t.birr}</td>
                  <td style={{ padding: '8px 10px', color: '#28a745', fontWeight: 'bold' }}>
                    {p.boughtPrice ? `${p.boughtPrice} ${t.birr}` : `0 ${t.birr}`}
                  </td>
                  <td style={{ padding: '8px 10px' }}>{p.inStoreQty ?? 0}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ 
                      background: qty < (p.stockThreshold || 5) ? '#f8d7da' : '#d1e7dd', 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      fontWeight: 'bold' 
                    }}>
                      {qty}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#6c757d' }}>{p.invoiceNo || t.na}</td>
                  
                  {!isBuilding && (
                    <td style={{ padding: '8px 10px', color: exp ? '#fd7e14' : '#6c757d', fontWeight: exp ? 'bold' : 'normal' }}>
                      {exp ? new Date(exp).toLocaleDateString() : t.na}
                    </td>
                  )}

                  <td style={{ padding: '8px 10px', display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => handleEditClick(p)}
                      style={{ background: '#ffc107', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {t.delete}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;