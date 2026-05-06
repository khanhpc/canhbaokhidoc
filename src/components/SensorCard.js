import React from 'react';

const SensorCard = ({ title = "THIẾT BỊ", value = 0, unit = "%", isDanger = false }) => {
  // 1. Xử lý Logic lời khuyên
  let statusText = "🛡️ AN TOÀN";
  let adviceList = ["✅ Hệ thống hoạt động ổn định.", "✅ Chỉ số trong ngưỡng cho phép."];

  if (isDanger) {
    statusText = "⚠️ NGUY HIỂM!";
    const upperTitle = title.toUpperCase();
    if (upperTitle.includes("GAS")) {
      adviceList = [
        "🔥 CẢNH BÁO: RÒ RỈ KHÍ GAS!",
        "🚫 TUYỆT ĐỐI KHÔNG: Bật lửa, hút thuốc.",
        "⚡ KHÔNG DÙNG ĐIỆN: Tránh tia lửa điện.",
        "💨 MỞ CỬA NGAY: Thông gió khu vực."
      ];
    } else {
      adviceList = [
        "🔥 CẢNH BÁO: PHÁT HIỆN LỬA/KHÓI!",
        "🧯 DẬP LỬA NGAY: Dùng bình chữa cháy.",
        "🏃 SƠ TÁN: Di chuyển đến nơi an toàn.",
        "📞 GỌI 114: Nếu mất kiểm soát."
      ];
    }
  }

  // 2. Tính toán SVG
  const safeValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100);
  const radius = 65;
  const strokeWidth = 5;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div style={{
      background: 'linear-gradient(165deg, #e8eef2 0%, #d3e0ea 100%)', // Nền Bạch kim pha ánh băng mát lạnh
      borderRadius: '20px',
      padding: '25px 20px',
      margin: '10px auto',
      width: '95%',
      maxWidth: '320px', 
      boxSizing: 'border-box',
      border: `1px solid ${isDanger ? 'rgba(225, 29, 72, 0.4)' : '#b4c5d6'}`, 
      boxShadow: '0 10px 30px rgba(5, 24, 46, 0.1)', // Bóng đổ Navy đậm
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      fontFamily: '-apple-system, system-ui, sans-serif',
      overflow: 'hidden'
    }}>

      {/* Chỉ báo Danger phía trên */}
      {isDanger && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
          background: 'linear-gradient(90deg, transparent, #e11d48, transparent)',
          boxShadow: '0 0 12px rgba(225, 29, 72, 0.5)', zIndex: 1
        }} />
      )}

      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span style={{ color: '#2b445e', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          MONITOR
        </span>
        <span style={{ color: isDanger ? '#e11d48' : '#0d47a1', fontSize: '0.65rem', fontWeight: 'bold' }}>
          ● LIVE
        </span>
      </div>

      <h3 style={{
        color: '#05182e', fontSize: '0.9rem', fontWeight: '800', marginBottom: '25px', // Chữ Navy Đen cực nét
        letterSpacing: '2px', textTransform: 'uppercase'
      }}>
        {title}
      </h3>

      {/* Vòng Gauge đã tinh chỉnh */}
      <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '25px' }}>
        <svg height="130" width="130" style={{ transform: 'rotate(-90deg)' }}>
          {/* Vòng track nền */}
          <circle stroke="#c2d1df" strokeWidth={strokeWidth} fill="transparent" r={normalizedRadius} cx="65" cy="65" />
          {/* Vòng giá trị (Deep Cobalt Blue hoặc Rose Danger) */}
          <circle
            stroke={isDanger ? '#e11d48' : '#0d47a1'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            strokeLinecap="butt" fill="transparent" r={normalizedRadius} cx="65" cy="65"
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: '500', color: '#05182e' }}>{safeValue}</div>
          <div style={{ fontSize: '0.65rem', color: '#0d47a1', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{unit}</div>
        </div>
      </div>

      {/* Trạng thái */}
      <div style={{
        padding: '6px 16px', borderRadius: '8px', fontSize: '0.7rem',
        background: isDanger ? 'rgba(225, 29, 72, 0.1)' : 'rgba(13, 71, 161, 0.1)', // Nền xanh dương đậm trong suốt
        color: isDanger ? '#e11d48' : '#0d47a1',
        border: `1px solid ${isDanger ? 'rgba(225, 29, 72, 0.3)' : 'rgba(13, 71, 161, 0.3)'}`,
        marginBottom: '20px', letterSpacing: '1px', fontWeight: '700'
      }}>
        {statusText}
      </div>

      {/* Lời khuyên */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {adviceList.map((item, index) => (
          <div key={index} style={{
            color: '#1a334d', fontSize: '0.75rem', lineHeight: '1.4', fontWeight: '600', 
            padding: '10px 12px', background: 'rgba(5, 24, 46, 0.04)', borderRadius: '8px',
            borderLeft: `3px solid ${isDanger ? '#e11d48' : '#0d47a1'}`,
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SensorCard;