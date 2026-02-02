import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { signOut } from "firebase/auth";
import SensorCard from "./SensorCard";

// --- 1. DEVICE ITEM (ĐÃ SỬA XÓA SẠCH + CĂN CHỈNH ĐẸP) ---
const DeviceItem = ({ deviceId, deviceName, userId, onViewKey }) => {
  const [deviceData, setDeviceData] = useState(null);

  useEffect(() => {
    const deviceRef = ref(db, `devices/${deviceId}/home`);
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      setDeviceData(snapshot.val());
    });
    return () => unsubscribe();
  }, [deviceId]);

  // --- HÀM XÓA MỚI (XÓA CẢ GỐC LẪN NGỌN) ---
  const handleDelete = () => {
    if (
      window.confirm(
        `CẢNH BÁO: Bạn có chắc muốn xóa VĨNH VIỄN thiết bị "${deviceName}"?\nDữ liệu trên Firebase cũng sẽ mất!`,
      )
    ) {
      // 1. Xóa liên kết trong tài khoản User
      remove(ref(db, `users/${userId}/${deviceId}`));

      // 2. Xóa luôn dữ liệu gốc trong nhánh devices
      remove(ref(db, `devices/${deviceId}`));
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
  const gasVal = deviceData.gasLevel
    ? Number(deviceData.gasLevel).toFixed(1)
    : 0;
  const smokeVal = deviceData.smokeLevel
    ? Number(deviceData.smokeLevel).toFixed(1)
    : 0;

  // Style đặc biệt khi cháy
  const containerStyle = isDanger
    ? {
        ...styles.cardContainer,
        border: "2px solid #ff5252",
        boxShadow: "0 0 20px rgba(255, 82, 82, 0.4)",
      }
    : styles.cardContainer;

  let lastUpdateStr = "...";
  if (deviceData.lastUpdate) {
    lastUpdateStr = new Date(deviceData.lastUpdate).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }

  return (
    <div style={containerStyle}>
      {/* HEADER CARD */}
      <div style={styles.cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.2rem" }}>{isDanger ? "🔥" : "📍"}</span>
          <h3
            style={{
              margin: 0,
              color: isDanger ? "#ff5252" : "#4db6ac",
              fontSize: "1.1rem",
            }}
          >
            {deviceName}
          </h3>
        </div>
        <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
          {lastUpdateStr}
        </span>
      </div>

      {/* KHU VỰC CẢM BIẾN (Căn giữa đều) */}
      <div style={styles.sensorRow}>
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
            title="LỬA"
            value={smokeVal}
            unit="%"
            isDanger={deviceData.smokeDanger}
          />
        </div>
      </div>

      {/* CONTROL PANEL (Chia hàng cột rõ ràng để không bị lệch) */}
      <div style={styles.controlBox}>
        {/* Hàng 1: Loa + Xem Key */}
        <div style={styles.controlRow}>
          <button onClick={toggleMute} style={muteBtnStyle(deviceData.isMuted)}>
            {deviceData.isMuted ? "🔇 LOA TẮT" : "🔊 LOA BẬT"}
          </button>
          <button
            onClick={() => onViewKey(deviceId, deviceName)}
            style={styles.viewKeyBtn}
          >
            🔑 Xem Key
          </button>
        </div>

        {/* Hàng 2: Nút Gas + Nút Lửa */}
        <div style={styles.controlRow}>
          <ControlToggle
            label="Gas"
            isOn={deviceData.configGas}
            onClick={() => toggleConfig("configGas", deviceData.configGas)}
            color="#00e676"
          />
          <ControlToggle
            label="Lửa"
            isOn={deviceData.configSmoke}
            onClick={() => toggleConfig("configSmoke", deviceData.configSmoke)}
            color="#00e676"
          />
        </div>

        {/* Nút Gỡ */}
        <button onClick={handleDelete} style={styles.deleteBtn}>
          Gỡ thiết bị này
        </button>
      </div>
    </div>
  );
};

const ControlToggle = ({ label, isOn, onClick, color }) => (
  <button style={toggleBtnStyle(isOn, color)} onClick={onClick}>
    {label}: {isOn ? "ON" : "OFF"}
  </button>
);

// --- 2. DASHBOARD ---
function Dashboard({ user }) {
  const [userDevices, setUserDevices] = useState(null);
  const [dangerList, setDangerList] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [viewingKey, setViewingKey] = useState(null);
  const [viewingName, setViewingName] = useState("");

  useEffect(() => {
    const userRef = ref(db, `users/${user.uid}`);
    onValue(userRef, (snapshot) => setUserDevices(snapshot.val()));
  }, [user.uid]);

  useEffect(() => {
    if (!userDevices) return;
    const interval = setInterval(() => {
      const currentDangers = [];
      Object.keys(userDevices).forEach((key) => {
        onValue(
          ref(db, `devices/${key}/home`),
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
    }, 2000);
    return () => clearInterval(interval);
  }, [userDevices]);

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
      handleViewKey(newKey, newDeviceName);
    });
  };

  const handleViewKey = (key, name) => {
    setViewingKey(key);
    setViewingName(name);
  };
  const handleCopyKey = () => {
    navigator.clipboard.writeText(viewingKey);
    alert("Đã copy KEY!");
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
              <h2
                style={{ margin: 0, fontSize: "1.2rem", textAlign: "center" }}
              >
                🔥 CẢNH BÁO NGUY HIỂM!
              </h2>
              <div style={{ fontSize: "0.9rem", textAlign: "center" }}>
                Tại: <b>{dangerList.join(", ")}</b>
              </div>
            </div>
          ) : (
            <div>
              <h2
                style={{ margin: 0, fontSize: "1.1rem", textAlign: "center" }}
              >
                🛡️ HỆ THỐNG AN TOÀN
              </h2>
              <div
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.8,
                  textAlign: "center",
                }}
              >
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
              onViewKey={handleViewKey}
            />
          ))
        )}
      </div>

      {/* MODAL THÊM */}
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

      {/* MODAL XEM KEY */}
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
            <div style={styles.bigKeyBox}>{viewingKey}</div>
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

// --- CSS STYLES (ĐÃ CĂN CHỈNH THẲNG HÀNG) ---
const styles = {
  pageWrapper: {
    background: "#1c1c1d",
    minHeight: "100vh",
    color: "white",
    fontFamily: "sans-serif",
    paddingBottom: "50px",
    boxSizing: "border-box",
  },
  alertHeaderSafe: {
    position: "sticky",
    top: 0,
    zIndex: 99,
    background: "#1c1e21",
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
    background: "rgba(255, 65, 108, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
    boxShadow: "0 5px 20px rgba(255, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridList: {
    padding: "20px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },

  // CARD CONTAINER
  cardContainer: {
    background: "#1e1e1e",
    padding: "20px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "390px", // Giới hạn chiều ngang
    border: "1px solid #333",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "10px",
  },
  sensorRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },

  // CONTROL PANEL (Dùng Flex Column để xếp hàng dọc)
  controlBox: {
    background: "rgba(255,255,255,0.05)",
    padding: "15px",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px", // Cách nhau 10px
  },
  // Mỗi hàng control (Dùng Flex Row)
  controlRow: {
    display: "flex",
    gap: "10px", // Các nút cách nhau 10px
  },

  miniBtn: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "none",
    background: "white",
    color: "#333",
    fontSize: "0.75rem",
    fontWeight: "bold",
    cursor: "pointer",
  },

  // CÁC NÚT BẤM (Dùng flex: 1 để tự co giãn đều nhau)
  viewKeyBtn: {
    flex: 1, // Tự giãn đều
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #4db6ac",
    background: "transparent",
    color: "#4db6ac",
    fontSize: "0.85rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  deleteBtn: {
    width: "100%", // Nút xóa full chiều ngang
    padding: "10px",
    background: "transparent",
    border: "1px solid #ff5252",
    color: "#ff5252",
    cursor: "pointer",
    fontSize: "0.8rem",
    borderRadius: "8px",
    marginTop: "5px",
  },

  // MODAL
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.85)",
    zIndex: 10000,
    display: "grid",
    placeItems: "center",
    padding: "20px",
  },
  modalContent: {
    background: "#222",
    padding: "30px",
    borderRadius: "25px",
    width: "100%",
    maxWidth: "340px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    boxSizing: "border-box",
  },
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
    fontSize: "1.3rem",
    fontWeight: "bold",
    wordBreak: "break-all",
    marginTop: "15px",
    border: "2px dashed #333",
  },
};

const wrapperStyle = (isEnabled) => ({
  opacity: isEnabled ? 1 : 0.4,
  filter: isEnabled ? "none" : "grayscale(100%)",
  flex: 1,
});
const muteBtnStyle = (isMuted) => ({
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: isMuted ? "#ffc107" : "#455a64",
  color: isMuted ? "#000" : "#fff",
  fontWeight: "bold",
  fontSize: "0.8rem",
  cursor: "pointer",
});
const toggleBtnStyle = (isOn, color) => ({
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: isOn ? color : "#444",
  color: isOn ? "#000" : "#ccc",
  fontSize: "0.8rem",
  fontWeight: "bold",
  flex: 1,
  cursor: "pointer",
});

export default Dashboard;
