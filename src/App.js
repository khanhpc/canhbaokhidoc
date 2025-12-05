// src/App.js
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";
import SensorCard from "./components/SensorCard";

function App() {
  const [gasLevel, setGasLevel] = useState(0);
  const [gasDanger, setGasDanger] = useState(false);
  const [smokeLevel, setSmokeLevel] = useState(0);
  const [smokeDanger, setSmokeDanger] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("Đang tải...");

  const [enableGas, setEnableGas] = useState(true);
  const [enableSmoke, setEnableSmoke] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const dataRef = ref(db, "home/");
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.gasLevel !== undefined) setGasLevel(Number(data.gasLevel).toFixed(1));
        if (data.isDanger !== undefined) setGasDanger(data.isDanger);
        if (data.smokeLevel !== undefined) setSmokeLevel(Number(data.smokeLevel).toFixed(1));
        if (data.smokeDanger !== undefined) setSmokeDanger(data.smokeDanger);

        if (data.configGas !== undefined) setEnableGas(data.configGas);
        if (data.configSmoke !== undefined) setEnableSmoke(data.configSmoke);
        if (data.isMuted !== undefined) setIsMuted(data.isMuted);

        if (data.lastUpdate) {
          const date = new Date(data.lastUpdate);
          setLastUpdate(date.toLocaleString("vi-VN"));
        }
      }
    });
  }, []);

  const toggleSensor = (type) => {
    if (type === "GAS") {
        const newState = !enableGas;
        setEnableGas(newState);
        set(ref(db, "home/configGas"), newState);
    } 
    else if (type === "SMOKE") {
        const newState = !enableSmoke;
        setEnableSmoke(newState);
        set(ref(db, "home/configSmoke"), newState);
    }
  };

  const toggleMute = () => {
    const newStatus = !isMuted;
    setIsMuted(newStatus);
    set(ref(db, "home/isMuted"), newStatus);
  };

  // --- STYLE ---
  const containerStyle = {
    background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px", // Padding nhỏ hơn cho mobile
    color: "white",
    boxSizing: "border-box",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "15px",
    marginTop: "5px",
    width: "100%",
    maxWidth: "500px", // Giới hạn chiều rộng
    padding: "15px 10px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "15px",
    backdropFilter: "blur(5px)",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  };

  const sensorContainerStyle = {
    display: "flex",
    flexDirection: "column", // Mặc định xếp dọc cho Mobile (Mobile First)
    alignItems: "center", // Căn giữa
    gap: "15px",
    width: "100%",
    maxWidth: "800px",
  };

  // Wrapper cho thẻ cảm biến (để xử lý ẩn hiện mượt hơn)
  const cardWrapperStyle = (isEnabled) => ({
    width: "100%", 
    display: "flex", 
    justifyContent: "center",
    opacity: isEnabled ? 1 : 0.5,
    filter: isEnabled ? "none" : "grayscale(100%)",
    transition: "all 0.3s",
  });

  const controlPanelStyle = {
    marginTop: "20px",
    marginBottom: "30px",
    padding: "20px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "360px", // Vừa khít màn hình điện thoại
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxSizing: "border-box"
  };

  const btnStyle = (isActive, activeColor = "#00e676") => ({
    padding: "12px 20px", // Nút to hơn chút cho dễ bấm
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.95rem",
    backgroundColor: isActive ? activeColor : "#455a64",
    color: isActive ? (activeColor === "#ffc107" ? "#000" : "#fff") : "#ccc",
    transition: "all 0.2s",
    minWidth: "80px",
    boxShadow: isActive ? `0 0 10px ${activeColor}80` : "none",
  });

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div className="App" style={containerStyle}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={{ margin: "0 0 5px 0", fontSize: "1.4rem", letterSpacing: "1px" }}>
          🛡️ Cảnh Báo Khí Độc
        </h1>
        <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
            <span style={{color: '#4db6ac'}}>● KhanhDTK</span> | 🕒 {lastUpdate}
        </div>
      </div>

      {/* KHU VỰC CẢM BIẾN */}
      {/* Trên PC sẽ dùng Flex Row, trên Mobile dùng Flex Column */}
      <div style={{
          ...sensorContainerStyle,
          flexDirection: window.innerWidth > 768 ? 'row' : 'column', // Hack nhẹ để PC nằm ngang, Mobile nằm dọc
          flexWrap: 'wrap'
      }}>
        
        {/* Thẻ Gas */}
        <div style={cardWrapperStyle(enableGas)}>
          <SensorCard 
            title="KHÍ GAS" 
            value={enableGas ? gasLevel : 0} 
            unit="%" 
            isDanger={gasDanger && enableGas} 
          />
        </div>

        {/* Thẻ Lửa */}
        <div style={cardWrapperStyle(enableSmoke)}>
          <SensorCard 
            title="CẢM BIẾN LỬA" 
            value={enableSmoke ? smokeLevel : 0} 
            unit="%" 
            isDanger={smokeDanger && enableSmoke} 
          />
        </div>
      </div>

      {/* BẢNG ĐIỀU KHIỂN */}
      <div style={controlPanelStyle}>
        <h3 style={{ 
            textAlign: "center", margin: "0 0 15px 0", 
            fontSize: "1.1rem", color: "#fff", textTransform: "uppercase", letterSpacing: "1px" 
        }}>
          ⚙️ Bảng Điều Khiển
        </h3>

        {/* NÚT MUTE (To nhất) */}
        <div style={{ ...rowStyle, borderBottom: "none", background: "rgba(0,0,0,0.2)", borderRadius: "15px", padding: "15px", marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.8rem" }}>{isMuted ? "🔇" : "🔊"}</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "bold" }}>LOA BÁO ĐỘNG</span>
              <span style={{ fontSize: "0.75rem", color: isMuted ? "#ffc107" : "#aaa" }}>
                {isMuted ? "Đang tắt tiếng" : "Đang bật"}
              </span>
            </div>
          </div>
          <button onClick={toggleMute} style={btnStyle(isMuted, "#ffc107")}>
            {isMuted ? "BẬT LẠI" : "TẮT TIẾNG"}
          </button>
        </div>

        {/* ON/OFF Cảm biến */}
        <div style={rowStyle}>
          <span>Cảm biến GAS</span>
          <button onClick={() => toggleSensor("GAS")} style={btnStyle(enableGas, "#00e676")}>
            {enableGas ? "ON" : "OFF"}
          </button>
        </div>

        <div style={{ ...rowStyle, borderBottom: "none" }}>
          <span>Cảm biến LỬA</span>
          <button onClick={() => toggleSensor("SMOKE")} style={btnStyle(enableSmoke, "#00e676")}>
            {enableSmoke ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: "10px", fontSize: "0.7rem", color: "#555", paddingBottom: "10px" }}>
        KhanhDTK Smart Home v2.0
      </div>
    </div>
  );
}

export default App;