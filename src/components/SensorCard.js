import React from 'react';

function SensorCard({ title, value, unit, isDanger, title2 }) {
  
  let statusText = "";
  let adviceList = [];

  if (isDanger) {
    statusText = "⚠️ NGUY HIỂM!";
    adviceList = [
        " CẢNH BÁO: Phát hiện " + title2,
        " TUYỆT ĐỐI KHÔNG: Bật lửa, hút thuốc, tạo tia lửa.",
        " KHÔNG DÙNG ĐIỆN: Không bật/tắt công tắc đèn, quạt.",
        " MỞ CỬA NGAY: Mở toang cửa sổ, cửa chính để thông gió.",
        " SƠ TÁN: Rời khỏi khu vực ngay lập tức.",
        " GỌI CỨU HỘ: Gọi PCCC hoặc kỹ thuật từ nơi an toàn."
    ];
  } else {
    statusText = "🛡️ AN TOÀN";
    adviceList = [
        "✅ Hệ thống hoạt động ổn định.",
        "✅ Không phát hiện khí độc hại."
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
      margin: '15px',
      // Tăng chiều rộng lên để chứa chữ dài không bị xuống dòng xấu
      width: '320px', 
      boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37)`,
      border: `1px solid rgba(255, 255, 255, 0.18)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Hiệu ứng nền nhấp nháy */}
      {isDanger && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255, 0, 0, 0.15)',
          animation: 'pulse 0.8s infinite alternate',
          zIndex: 0
        }} />
      )}

      {/* TIÊU ĐỀ */}
      <h3 style={{ 
        color: '#ffffff', 
        fontSize: '1.2rem', 
        marginBottom: '20px', 
        letterSpacing: '1px',
        textTransform: 'uppercase',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        paddingBottom: '10px',
        width: '100%',
        textAlign: 'center',
        zIndex: 2
      }}>
        {title}
      </h3>

      <div style={{ position: 'relative', width: '160px', height: '160px', zIndex: 2, marginBottom: '20px' }}>
        <svg height="160" width="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx="80"
            cy="80"
          />
          <circle
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ 
                strokeDashoffset, 
                transition: 'stroke-dashoffset 0.5s ease-in-out',
                filter: `drop-shadow(0 0 10px ${color})`
            }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx="80"
            cy="80"
          />
        </svg>
        
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
            {value}
          </div>
          <div style={{ fontSize: '1rem', color: '#ccc' }}>{unit}</div>
        </div>
      </div>

      {/* TRẠNG THÁI NGẮN GỌN */}
      <div style={{ 
          marginBottom: '15px', 
          padding: '5px 20px',
          borderRadius: '50px',
          fontWeight: 'bold', 
          background: isDanger ? 'rgba(255, 82, 82, 0.2)' : 'rgba(0, 230, 118, 0.2)',
          color: color,
          border: `1px solid ${color}`,
          zIndex: 2,
          textTransform: 'uppercase',
          boxShadow: `0 0 10px ${shadowColor}`
      }}>
        {statusText}
      </div>

      {/* KHU VỰC LỜI KHUYÊN (Đã thiết kế lại dạng danh sách) */}
      <div style={{
          width: '100%',
          backgroundColor: isDanger ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '15px',
          zIndex: 2,
          border: isDanger ? '1px solid #ff5252' : 'none',
          boxSizing: 'border-box' // Đảm bảo padding không làm vỡ khung
      }}>
        {adviceList.map((item, index) => (
            <div key={index} style={{
                color: isDanger ? '#ffcdd2' : '#e0f2f1',
                fontSize: '0.9rem',
                marginBottom: '8px',
                textAlign: 'left', // Căn trái cho dễ đọc
                lineHeight: '1.4',
                display: 'flex',
                alignItems: 'start'
            }}>
                {/* Dấu chấm đầu dòng nếu không phải dòng tiêu đề */}
                <span style={{ marginRight: '8px', color: color }}>•</span> 
                {item}
            </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default SensorCard;