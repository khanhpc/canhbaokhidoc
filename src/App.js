// src/App.js
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import SensorCard from "./components/SensorCard";

function App() {
  const [gasLevel, setGasLevel] = useState(0);
  const [gasDanger, setGasDanger] = useState(false);

  const [smokeLevel, setSmokeLevel] = useState(0);
  const [smokeDanger, setSmokeDanger] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("Đang tải...");

  useEffect(() => {
    const dataRef = ref(db, "home/");
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.gasLevel !== undefined)
          setGasLevel(Number(data.gasLevel).toFixed(1));
        if (data.isDanger !== undefined) setGasDanger(data.isDanger);

        if (data.smokeLevel !== undefined)
          setSmokeLevel(Number(data.smokeLevel).toFixed(1));
        if (data.smokeDanger !== undefined) setSmokeDanger(data.smokeDanger);

        if (data.lastUpdate) {
          const date = new Date(data.lastUpdate);
          setLastUpdate(date.toLocaleString("vi-VN"));
        }
      }
    });
  }, []);

  return (
    <div
      className="App"
      style={{
        // Background Gradient tối màu (Deep Blue)
        background:
          "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        color: "white",
      }}
    >
      {/* Header đơn giản */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
          marginTop: "20px",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2.5rem" }}>🏠 KhanhDTK's HOUSE</h1>
        <p style={{ color: "#aaa", marginTop: "10px" }}>
          🕒 Cập nhật lần cuối:{" "}
          <span style={{ color: "#4db6ac", fontWeight: "bold" }}>
            {lastUpdate}
          </span>
        </p>
      </div>

      {/* Khu vực hiển thị các cảm biến */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        {/* Cảm biến Gas */}
        <SensorCard
          title="CẢNH BÁO KHÍ GAS"
          value={gasLevel}
          unit="%"
          isDanger={gasDanger}
          title2="Khí Gas"
        />
        {/* Cảm biến khói */}
        <SensorCard
          title="CẢNH BÁO KHÓI/LỬA"
          value={smokeLevel}
          unit="%"
          isDanger={smokeDanger}
          title2="Khói/Lửa"
        />

        {/* Ví dụ Placeholder cho cảm biến tương lai (để bạn thấy bố cục đẹp thế nào) */}
        {/* <SensorCard 
            title="NHIỆT ĐỘ PHÒNG" 
            value={28.5} 
            unit="°C" 
            isDanger={false} 
        /> 
        */}
      </div>

      <footer
        style={{
          marginTop: "auto",
          padding: "20px",
          color: "#555",
          fontSize: "0.8rem",
        }}
      >
        System designed by{" "}
        <a
          href="https://www.facebook.com/KhanhDTK.dzzz"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#555", fontWeight: "bold", textDecoration: "none" }}
        >
          KhanhDTK
        </a>
      </footer>
    </div>
  );
}

export default App;
