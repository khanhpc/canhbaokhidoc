import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { signOut } from "firebase/auth";
import SensorCard from "./SensorCard";

// --- 1. DEVICE ITEM ---
// Nhận thêm prop: onViewKey để gọi ngược ra Dashboard
const DeviceItem = ({ deviceId, deviceName, userId, onViewKey }) => {
  const [deviceData, setDeviceData] = useState(null);

  useEffect(() => {
    const deviceRef = ref(db, `devices/${deviceId}/home`);
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      setDeviceData(snapshot.val());
    });
    return () => unsubscribe();
  }, [deviceId]);

  const handleDelete = () => {
    if (window.confirm(`Xóa thiết bị "${deviceName}"?`)) {
      remove(ref(db, `users/${userId}/${deviceId}`));
    }
  };

  const toggleConfig = (key, currentVal) =>
    set(ref(db, `devices/${deviceId}/home/${key}`), !currentVal);
  const toggleMute = () =>
    deviceData &&
    set(ref(db, `devices/${deviceId}/home/isMuted`), !deviceData.isMuted);

  if (!deviceData)
    return <div style={{ color: "#777", padding: "20px" }}>Đang tải...</div>;

  const isDanger = deviceData.isDanger || deviceData.smokeDanger;
  const cardStyle = isDanger
    ? {
        ...styles.cardContainer,
        border: "2px solid #ff5252",
        background: "rgba(255, 82, 82, 0.15)",
      }
    : styles.cardContainer;
  const gasVal = deviceData.gasLevel
    ? Number(deviceData.gasLevel).toFixed(1)
    : 0;
  const smokeVal = deviceData.smokeLevel
    ? Number(deviceData.smokeLevel).toFixed(1)
    : 0;

  let lastUpdateStr = "...";
  if (deviceData.lastUpdate) {
    lastUpdateStr = new Date(deviceData.lastUpdate).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  }

  return (
    <div style={cardStyle}>
      <div style={{ textAlign: "center", marginBottom: "10px", width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              margin: "0",
              color: isDanger ? "#ff5252" : "#4db6ac",
              fontSize: "1.1rem",
            }}
          >
            {isDanger ? "🔥 " : "📍 "} {deviceName}
          </h3>
          <span style={{ fontSize: "0.7rem", color: "#aaa" }}>
            {lastUpdateStr}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "5px",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div style={wrapperStyle(deviceData.configGas)}>
          <SensorCard
            title="GAS"
            value={gasVal}
            unit="%"
            isDanger={deviceData.isDanger}
          />
        </div>
        <div style={wrapperStyle(deviceData.configSmoke)}>
          <SensorCard
            title="KHÓI"
            value={smokeVal}
            unit="%"
            isDanger={deviceData.smokeDanger}
          />
        </div>
      </div>

      <div style={styles.controlBox}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <button onClick={toggleMute} style={muteBtnStyle(deviceData.isMuted)}>
            {deviceData.isMuted ? "🔇 ĐÃ TẮT CÒI" : "🔊 LOA ĐANG BẬT"}
          </button>

          {/* NÚT XEM KEY MỚI */}
          <button
            onClick={() => onViewKey(deviceId, deviceName)}
            style={styles.viewKeyBtn}
          >
            🔑 Xem Key
          </button>
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <ControlToggle
            label="Gas"
            isOn={deviceData.configGas}
            onClick={() => toggleConfig("configGas", deviceData.configGas)}
          />
          <ControlToggle
            label="Lửa"
            isOn={deviceData.configSmoke}
            onClick={() => toggleConfig("configSmoke", deviceData.configSmoke)}
          />
        </div>
      </div>

      <button onClick={handleDelete} style={styles.deleteLink}>
        Gỡ thiết bị
      </button>
    </div>
  );
};

const ControlToggle = ({ label, isOn, onClick }) => (
  <button style={toggleBtnStyle(isOn)} onClick={onClick}>
    {label}: {isOn ? "ON" : "OFF"}
  </button>
);

// --- 2. DASHBOARD ---
function Dashboard({ user }) {
  const [userDevices, setUserDevices] = useState(null);
  const [dangerList, setDangerList] = useState([]);

  // Modal Thêm thiết bị
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");

  // Modal Xem Key (MỚI)
  const [viewingKey, setViewingKey] = useState(null); // Lưu Key đang xem
  const [viewingName, setViewingName] = useState(""); // Lưu tên đang xem

  useEffect(() => {
    const userRef = ref(db, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      setUserDevices(snapshot.val());
    });
  }, [user.uid]);

  // Logic check cháy (Header)
  useEffect(() => {
    if (!userDevices) return;
    const keys = Object.keys(userDevices);
    const checkDangers = () => {
      const currentDangers = [];
      keys.forEach((key) => {
        const devRef = ref(db, `devices/${key}/home`);
        onValue(
          devRef,
          (snap) => {
            const d = snap.val();
            if (d && (d.isDanger || d.smokeDanger)) {
              if (!currentDangers.includes(userDevices[key].name))
                currentDangers.push(userDevices[key].name);
            }
            setDangerList([...new Set(currentDangers)]);
          },
          { onlyOnce: true },
        );
      });
    };
    const interval = setInterval(checkDangers, 2000);
    return () => clearInterval(interval);
  }, [userDevices]);

  // Logic thêm thiết bị
  const handleConfirmAdd = () => {
    if (!newDeviceName.trim()) return alert("Nhập tên đi bạn ơi!");
    const newDeviceRef = push(ref(db, "devices"));
    const newKey = newDeviceRef.key;
    set(newDeviceRef, {
      home: {
        gasLevel: 0,
        smokeLevel: 0,
        isDanger: false,
        smokeDanger: false,
        configGas: true,
        configSmoke: true,
        isMuted: false,
        lastUpdate: Date.now(),
      },
    });
    set(ref(db, `users/${user.uid}/${newKey}`), {
      name: newDeviceName,
      added_at: Date.now(),
    }).then(() => {
      setNewDeviceName("");
      setIsAddModalOpen(false);
      // Mở luôn cái bảng xem key sau khi tạo xong
      handleViewKey(newKey, newDeviceName);
    });
  };

  // Logic Mở bảng xem Key
  const handleViewKey = (key, name) => {
    setViewingKey(key);
    setViewingName(name);
  };

  // Logic Copy (Hỗ trợ mobile)
  const handleCopyKey = () => {
    const textArea = document.createElement("textarea");
    textArea.value = viewingKey;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      alert("Đã copy KEY thành công!");
    } catch (err) {
      alert("Lỗi copy, bạn hãy bôi đen và copy thủ công nhé.");
    }
    document.body.removeChild(textArea);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* HEADER STICKY */}
      <div
        style={
          dangerList.length > 0
            ? styles.alertHeaderDanger
            : styles.alertHeaderSafe
        }
      >
        <div style={{ flex: 1 }}>
          {dangerList.length > 0 ? (
            <div style={{ animation: "blinker 1s linear infinite" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", textAlign: "center" }}>
                🔥 CẢNH BÁO NGUY HIỂM!
              </h2>
              <div style={{ fontSize: "0.9rem", opacity: 0.9, textAlign: "center" }}>
                Tại: <b>{dangerList.join(", ")}</b>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", textAlign: "center" }}>
                🛡️ HỆ THỐNG AN TOÀN
              </h2>
              <div style={{ fontSize: "0.8rem", opacity: 0.8, textAlign: "center" }}>
                -----KhanhDTK-----
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={styles.miniBtn}
          >
            + Thêm
          </button>
          <button
            onClick={() => signOut(auth)}
            style={{ ...styles.miniBtn, background: "rgba(0,0,0,0.3)" }}
          >
            Thoát
          </button>
        </div>
      </div>

      {/* DANH SÁCH */}
      <div style={styles.gridList}>
        {!userDevices ? (
          <div
            style={{ textAlign: "center", color: "#888", marginTop: "100px" }}
          >
            Đang tải dữ liệu...
          </div>
        ) : (
          Object.keys(userDevices).map((key) => (
            <DeviceItem
              key={key}
              deviceId={key}
              deviceName={userDevices[key].name}
              userId={user.uid}
              onViewKey={handleViewKey} // Truyền hàm mở bảng key vào
            />
          ))
        )}
      </div>

      {/* --- MODAL 1: THÊM THIẾT BỊ --- */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Thêm Thiết Bị</h3>
            <input
              type="text"
              placeholder="Tên phòng (VD: Bếp)"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              style={styles.modalInput}
              autoFocus
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={styles.modalCancelBtn}
              >
                Hủy
              </button>
              <button onClick={handleConfirmAdd} style={styles.modalSaveBtn}>
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: XEM KEY (CHI TIẾT) --- */}
      {viewingKey && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3
              style={{
                color: "#4db6ac",
                borderBottom: "1px solid #444",
                paddingBottom: "10px",
              }}
            >
              🔑 Mã Kết Nối
            </h3>
            <p style={{ marginBottom: "5px" }}>
              Thiết bị: <b>{viewingName}</b>
            </p>

            {/* Hộp chứa Key to đùng */}
            <div style={styles.bigKeyBox}>{viewingKey}</div>

            <p style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "5px" }}>
              Copy mã này và dán vào phần cấu hình WiFi của ESP32.
            </p>

            <button
              onClick={handleCopyKey}
              style={{
                ...styles.modalSaveBtn,
                width: "100%",
                marginTop: "15px",
                background: "#00e676",
              }}
            >
              📋 SAO CHÉP MÃ
            </button>

            <button
              onClick={() => setViewingKey(null)}
              style={{
                ...styles.modalCancelBtn,
                width: "100%",
                marginTop: "10px",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CSS STYLES (Đã Căn Giữa Chuẩn 100%) ---
const styles = {
  pageWrapper: {
    background: "#3b4f52",
    minHeight: "100vh",
    color: "white",
    fontFamily: "sans-serif",
    paddingBottom: "50px",
    boxSizing: "border-box", // Quan trọng để không bị tràn
  },

  // Header Sticky
  alertHeaderSafe: {
    position: "sticky",
    top: 0,
    zIndex: 99,
    background: "rgba(29, 185, 84, 0.95)", // Màu xanh Spotify dịu mắt
    backdropFilter: "blur(10px)",
    padding: "15px 20px",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alertHeaderDanger: {
    position: "sticky",
    top: 0,
    zIndex: 99,
    background: "rgba(255, 65, 54, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
    boxShadow: "0 5px 20px rgba(255, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Danh sách thiết bị
  gridList: {
    padding: "20px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },

  // Thẻ Card
  cardContainer: {
    background: "#3b4f52",
    padding: "20px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "360px", // Giới hạn chiều ngang trên PC
    border: "1px solid #333",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  controlBox: {
    background: "rgba(255,255,255,0.05)",
    padding: "15px",
    borderRadius: "15px",
    marginTop: "15px",
  },

  // Các nút bấm
  miniBtn: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "none",
    background: "white",
    color: "#333",
    fontSize: "0.75rem",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
  viewKeyBtn: {
    padding: "8px 15px",
    borderRadius: "10px",
    border: "1px solid #4db6ac",
    background: "rgba(77, 182, 172, 0.1)",
    color: "#4db6ac",
    fontSize: "0.8rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteLink: {
    marginTop: "15px",
    background: "transparent",
    border: "none",
    color: "#ff5252",
    cursor: "pointer",
    fontSize: "0.8rem",
    textDecoration: "underline",
    width: "100%",
    opacity: 0.8,
  },

  // --- MODAL (POPUP) CĂN GIỮA TUYỆT ĐỐI ---
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.85)", // Nền tối hơn chút
    zIndex: 10000,
    // Dùng GRID để căn giữa bất chấp mọi loại màn hình
    display: "grid",
    placeItems: "center",
    padding: "20px", // Để popup không dính sát lề khi màn hình quá nhỏ
  },
  modalContent: {
    background: "#222",
    padding: "30px",
    borderRadius: "25px",
    width: "100%",
    maxWidth: "340px", // Độ rộng lý tưởng cho Mobile
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    position: "relative", // Để nội dung bên trong ổn định
    boxSizing: "border-box",
  },

  // Input và Button trong Modal
  modalInput: {
    width: "100%",
    padding: "15px",
    marginTop: "20px",
    borderRadius: "12px",
    border: "1px solid #444",
    background: "#111",
    color: "white",
    fontSize: "1.1rem",
    boxSizing: "border-box",
    outline: "none",
    textAlign: "center",
  },
  modalSaveBtn: {
    flex: 1,
    padding: "15px",
    background: "#00e676",
    border: "none",
    borderRadius: "12px",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem",
    boxShadow: "0 5px 15px rgba(0, 230, 118, 0.3)",
  },
  modalCancelBtn: {
    flex: 1,
    padding: "15px",
    background: "#333",
    border: "none",
    borderRadius: "12px",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "1rem",
  },

  bigKeyBox: {
    background: "#0a0a0a",
    color: "#00e676",
    padding: "20px",
    borderRadius: "12px",
    fontFamily: "monospace",
    fontSize: "1.3rem", // Chữ to đùng
    fontWeight: "bold",
    wordBreak: "break-all",
    marginTop: "15px",
    border: "2px dashed #333",
    userSelect: "text", // Cho phép bôi đen
  },
};

const wrapperStyle = (isEnabled) => ({
  opacity: isEnabled ? 1 : 0.4,
  filter: isEnabled ? "none" : "grayscale(100%)",
  flex: 1,
});
const muteBtnStyle = (isMuted) => ({
  flex: 1,
  padding: "8px",
  borderRadius: "8px",
  border: "none",
  background: isMuted ? "#ffc107" : "#455a64",
  color: isMuted ? "#000" : "#fff",
  fontWeight: "bold",
  fontSize: "0.7rem",
  marginRight: "10px",
});
const toggleBtnStyle = (isOn) => ({
  padding: "5px 10px",
  borderRadius: "5px",
  border: "none",
  background: isOn ? "#00e676" : "#444",
  color: isOn ? "#000" : "#ccc",
  fontSize: "0.7rem",
  fontWeight: "bold",
  flex: 1,
});

export default Dashboard;
