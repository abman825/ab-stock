import React from 'react';

function CartPanel({
  cart,
  removeFromCart,
  updateQty,
  updateSoldAtDate,
  isBuildingMode,
  discountValue,
  setDiscountValue,
  discountType,
  setDiscountType,
  discountBirr,
  subtotal,
  grandTotal,
  paymentMethod,
  setPaymentMethod,
  handleCheckout,
  loading,
  t
}) {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '8px', 
      padding: '15px', 
      border: '1px solid #e0e0e0', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      boxSizing: 'border-box' 
    }}>
      {/* ርዕስ */}
      <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#495057', textAlign: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
        {t.currentCart}
      </h4>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#adb5bd', padding: '40px 0' }}>{t.cartEmpty}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          {/* የተመረጡ እቃዎች ዝርዝር */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {cart.map((item) => {
              const itemId = item._id || item.id;
              const itemExpDate = item.expiryDate || item.expirationDate;
              const itemUnitPrice = Number(item.customPrice || item.price || 0);
              const itemTotal = itemUnitPrice * item.cartQty;

              return (
                <div key={itemId} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{item.name}</div>
                      <div style={{ fontSize: '10px', color: '#6c757d' }}>{itemUnitPrice.toFixed(2)} {t.birr}</div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(itemId)} 
                      style={{ background: 'none', border: 'none', color: '#6c757d', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                    >
                      ✖
                    </button>
                  </div>

                  {/* ብዛት መቀነሻ/መጨመሪያ እና አጠቃላይ ዋጋ */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button onClick={() => updateQty(itemId, -1)} style={{ border: '1px solid #ccc', background: '#fff', width: '22px', height: '22px', borderRadius: '3px', cursor: 'pointer' }}>-</button>
                      <span style={{ fontSize: '12px', padding: '0 5px' }}>{item.cartQty}</span>
                      <button onClick={() => updateQty(itemId, 1)} style={{ border: '1px solid #ccc', background: '#fff', width: '22px', height: '22px', borderRadius: '3px', cursor: 'pointer' }}>+</button>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{itemTotal.toFixed(2)} {t.birr}</span>
                  </div>

                  {/* ቀናት (የተሸጠበት ቀን እና የሚያልፍበት ቀን) */}
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '10px', color: '#6c757d', display: 'block', marginBottom: '2px' }}>{t.soldAt}</label>
                      <input
                        type="date"
                        value={item.soldAtDate}
                        onChange={(e) => updateSoldAtDate(itemId, e.target.value)}
                        style={{ width: '100%', padding: '3px 4px', fontSize: '10px', border: '1px solid #ced4da', borderRadius: '4px', color: '#495057', boxSizing: 'border-box' }}
                      />
                    </div>
                    
                    {!isBuildingMode && (
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '10px', color: '#6c757d', display: 'block', marginBottom: '2px' }}>{t.expDate}</label>
                        <div style={{ fontSize: '10px', padding: '4px', background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '4px', color: '#6c757d' }}>
                          {itemExpDate ? new Date(itemExpDate).toLocaleDateString() : t.na}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* የታችኛው ሂሳብ እና የክፍያ ክፍሎች */}
          <div style={{ borderTop: '2px dashed #dee2e6', paddingTop: '10px', marginTop: 'auto' }}>
            
            {/* ቅናሽ (Discount) */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '10px', color: '#6c757d', display: 'block', marginBottom: '2px' }}>{t.discount}</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  style={{ width: '70px', padding: '4px', fontSize: '11px', border: '1px solid #ced4da', borderRadius: '4px' }}
                />
                <div style={{ display: 'flex', border: '1px solid #ced4da', borderRadius: '4px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    style={{ border: 'none', padding: '4px 8px', fontSize: '10px', background: discountType === 'percent' ? '#0d6efd' : '#f8f9fa', color: discountType === 'percent' ? '#fff' : '#333', cursor: 'pointer' }}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    style={{ border: 'none', padding: '4px 8px', fontSize: '10px', background: discountType === 'fixed' ? '#0d6efd' : '#f8f9fa', color: discountType === 'fixed' ? '#fff' : '#333', cursor: 'pointer' }}
                  >
                    {t.birr}
                  </button>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', marginLeft: 'auto', color: '#dc3545' }}>
                  -{discountBirr.toFixed(2)} {t.birr}
                </span>
              </div>
            </div>

            {/* ጠቅላላ እና የመጨረሻ ዋጋ */}
            <div style={{ marginTop: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6c757d', marginBottom: '2px' }}>
                <span>{t.subtotal}:</span>
                <span>{subtotal.toFixed(2)} {t.birr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6c757d', marginBottom: '2px' }}>
                <span>{t.discount} ({discountType === 'percent' ? `${discountValue}%` : 'fixed'}):</span>
                <span>{discountBirr.toFixed(2)} {t.birr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
                <span>{t.total}:</span>
                <span style={{ color: '#28a745' }}>{grandTotal.toFixed(2)} {t.birr}</span>
              </div>
            </div>

            {/* የክፍያ መንገድ (Payment Method - 3 የተደረደሩ ቁልፎች) */}
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '10px', color: '#6c757d', display: 'block', marginBottom: '4px' }}>{t.paymentMethod}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {['Cash', 'Bank', 'Telebirr'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: '6px',
                      fontSize: '11px',
                      border: paymentMethod === method ? '2px solid #28a745' : '1px solid #ced4da',
                      background: paymentMethod === method ? '#e8f5e9' : '#fff',
                      color: paymentMethod === method ? '#28a745' : '#333',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {method === 'Cash' ? t.cash : method === 'Bank' ? t.bank : t.telebirr}
                  </button>
                ))}
              </div>
            </div>

            {/* ሽያጭ ጨርስ ቁልፍ */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                width: '100%',
                background: '#28a745',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 'bold',
                marginTop: '12px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? t.processing : t.completeSale}
            </button>

          </div>

        </div>
      )}
    </div>
  );
}

export default CartPanel;