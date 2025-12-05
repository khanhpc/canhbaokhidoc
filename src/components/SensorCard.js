// src/components/SensorCard.js
import React from 'react';

// Bỏ title2 đi, chỉ cần title là đủ
function SensorCard({ title, value, unit, isDanger }) { 
  
  let statusText = "";
  let adviceList = [];

  if (isDanger) {
    statusText = "⚠️ NGUY HIỂM!";
    if (title === "KHÍ GAS") {
        adviceList = [
            "🔥 CẢNH BÁO: RÒ RỈ KHÍ GAS ĐẬM ĐẶC!",
            "🚫 TUYỆT ĐỐI KHÔNG: Bật lửa, hút thuốc.",
            "⚡ KHÔNG DÙNG ĐIỆN: Không bật tắt công tắc.",
            "💨 MỞ CỬA NGAY: Thông gió toàn bộ khu vực.",
            "📞 GỌI HỖ TRỢ: Gọi người thân hoặc thợ."
        ];
    } 
    else { 
        adviceList = [
            "🔥 CẢNH BÁO: PHÁT HIỆN CÓ LỬA/KHÓI!",
            "🧯 DẬP LỬA NGAY: Dùng bình chữa cháy.",
            "🏃 SƠ TÁN: Đưa người già trẻ nhỏ ra ngoài.",
            "📞 GỌI 114: Nếu đám cháy mất kiểm soát."
        ];
    }
  } else {
    statusText = "🛡️ AN TOÀN";
    adviceList = [
        "✅ Hệ thống hoạt động ổn định.",
        "✅ Chỉ số trong ngưỡng cho phép."
    ];
  }

  const radius = 70;
  const stroke = 15;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - ((Math.min(value, 100) / 100) * circumference);

  const color = isDanger ? '#ff5252' : '#00e676'; 
  const shadowColor = isDanger ? 'rgba(255, 82, 82, 0.6)' : 'rgba(0, 230, 118, 0.4)';

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '20px',
      margin: '10px 0', // Giảm margin ngang về 0 để đỡ bị lệch trên đt
      
      // --- SỬA CHỖ NÀY ĐỂ RESPONSIVE ---
      width: '100%',        // Chiếm hết chiều rộng của khung chứa nó
      maxWidth: '360px',    // Nhưng không to quá 360px (trên máy tính bảng)
      boxSizing: 'border-box',
      // --------------------------------
      
      boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37)`,
      border: `1px solid rgba(255, 255, 255, 0.18)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      
      {isDanger && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255, 0, 0, 0.15)',
          animation: 'pulse 0.8s infinite alternate',
          zIndex: 0
        }} />
      )}

      <h3 style={{ 
        color: '#ffffff', fontSize: '1.2rem', marginBottom: '20px', letterSpacing: '1px',
        textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.2)',
        paddingBottom: '10px', width: '100%', textAlign: 'center', zIndex: 2
      }}>
        {title}
      </h3>

      <div style={{ position: 'relative', width: '160px', height: '160px', zIndex: 2, marginBottom: '20px' }}>
        <svg height="160" width="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle stroke="rgba(255, 255, 255, 0.1)" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx="80" cy="80" />
          <circle stroke={color} strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out', filter: `drop-shadow(0 0 10px ${color})` }}
            strokeLinecap="round" fill="transparent" r={normalizedRadius} cx="80" cy="80"
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{value}</div>
          <div style={{ fontSize: '1rem', color: '#ccc' }}>{unit}</div>
        </div>
      </div>

      <div style={{ 
          marginBottom: '15px', padding: '5px 20px', borderRadius: '50px',
          fontWeight: 'bold', background: isDanger ? 'rgba(255, 82, 82, 0.2)' : 'rgba(0, 230, 118, 0.2)',
          color: color, border: `1px solid ${color}`, zIndex: 2, textTransform: 'uppercase',
          boxShadow: `0 0 10px ${shadowColor}`
      }}>
        {statusText}
      </div>

      <div style={{
          width: '100%', backgroundColor: isDanger ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px', padding: '15px', zIndex: 2,
          border: isDanger ? '1px solid #ff5252' : 'none', boxSizing: 'border-box'
      }}>
        {adviceList.map((item, index) => (
            <div key={index} style={{
                color: isDanger ? '#ffcdd2' : '#e0f2f1', fontSize: '0.9rem', marginBottom: '8px',
                textAlign: 'left', lineHeight: '1.4', display: 'flex', alignItems: 'start'
            }}>
                <span style={{ marginRight: '8px', color: color }}>•</span> {item}
            </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 0.3; } 100% { opacity: 0.8; } }`}</style>
    </div>
  );
}

export default SensorCard;