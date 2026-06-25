import React from 'react';

export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      zIndex: 9999
    }}>
      <div style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Outer rotating ring */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '3px solid rgba(212, 175, 55, 0.2)',
          borderTopColor: '#d4af37',
          borderRadius: '50%',
          animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
        }}></div>
        
        {/* Inner pulsing logo wrapper */}
        <div style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          {/* Fallback to simple circle if image fails */}
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#d4af37',
            borderRadius: '50%'
          }}></div>
        </div>
      </div>
      
      <p style={{
        marginTop: '1.5rem',
        color: '#111111',
        fontWeight: '800',
        fontSize: '1.1rem',
        letterSpacing: '0.5px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        جاري التحميل...
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
