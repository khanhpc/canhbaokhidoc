import React from 'react';

const SensorCard = ({ title = "THIẾT BỊ", value = 0, unit = "%", isDanger = false }) => {
  // 1. Xử lý Logic lời khuyên (Đảm bảo luôn có dữ liệu, không lo crash map)
  let statusText = "🛡️ AN TOÀN";
  let adviceList = ["✅ Hệ thống hoạt động ổn định.", "✅ Chỉ số trong ngưỡng cho phép."];

  if (isDanger) {
    statusText = "⚠️ NGUY HIỂM!";
    // Chuyển title về chữ hoa để so sánh cho chính xác
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

  // 2. Tính toán SVG (Đã fix để không bị NaN)
  const safeValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100);
  const radius = 65;
  const strokeWidth = 5;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div style={{
      background: 'linear-gradient(165deg, #121418 0%, #050505 100%)',
      borderRadius: '20px',
      padding: '25px 20px',
      margin: '10px auto',
      width: '95%',
      maxWidth: '320px', // Bóp lại để không bị thô trên màn hình to
      boxSizing: 'border-box',
      border: `1px solid ${isDanger ? 'rgba(255, 59, 48, 0.4)' : 'rgba(197, 160, 89, 0.2)'}`,
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
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
          position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
          background: 'linear-gradient(90deg, transparent, #ff3b30, transparent)',
          boxShadow: '0 0 10px #ff3b30', zIndex: 1
        }} />
      )}

      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span style={{ color: '#666', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          MONITOR
        </span>
        <span style={{ color: isDanger ? '#ff3b30' : '#C5A059', fontSize: '0.6rem', fontWeight: 'bold' }}>
          ● LIVE
        </span>
      </div>

      <h3 style={{
        color: '#fff', fontSize: '0.9rem', fontWeight: '500', marginBottom: '25px',
        letterSpacing: '2px', textTransform: 'uppercase'
      }}>
        {title}
      </h3>

      {/* Vòng Gauge đã tinh chỉnh */}
      <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '25px' }}>
        <svg height="130" width="130" style={{ transform: 'rotate(-90deg)' }}>
          <circle stroke="#1a1c1e" strokeWidth={strokeWidth} fill="transparent" r={normalizedRadius} cx="65" cy="65" />
          <circle
            stroke={isDanger ? '#ff3b30' : '#C5A059'}
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
          <div style={{ fontSize: '2.4rem', fontWeight: '200', color: '#fff' }}>{safeValue}</div>
          <div style={{ fontSize: '0.6rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>{unit}</div>
        </div>
      </div>

      {/* Trạng thái */}
      <div style={{
        padding: '6px 16px', borderRadius: '4px', fontSize: '0.7rem',
        background: isDanger ? 'rgba(255, 59, 48, 0.1)' : 'transparent',
        color: isDanger ? '#ff3b30' : '#C5A059',
        border: `1px solid ${isDanger ? '#ff3b30' : '#333'}`,
        marginBottom: '20px', letterSpacing: '1.5px', fontWeight: '600'
      }}>
        {statusText}
      </div>

      {/* Lời khuyên */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {adviceList.map((item, index) => (
          <div key={index} style={{
            color: '#999', fontSize: '0.75rem', lineHeight: '1.4',
            padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
            borderLeft: `2px solid ${isDanger ? '#ff3b30' : '#C5A059'}`,
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SensorCard;