import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  ref,
  onValue,
  set,
  push,
  remove,
  query,
  limitToLast,
} from "firebase/database";
import { signOut } from "firebase/auth";
import SensorCard from "./SensorCard";
import HistoryChart from "./HistoryChart";

const DeviceItem = ({ deviceId, deviceName, userId, onViewKey }) => {
  const [deviceData, setDeviceData] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const deviceRef = ref(db, `devices/${deviceId}/home`);
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();
      setDeviceData(data);

      if (data && data.lastUpdate) {
        push(ref(db, `devices/${deviceId}/history`), {
          gasLevel: Number(data.gasLevel),
          smokeLevel: Number(data.smokeLevel),
          timestamp: data.lastUpdate,
        });
      }
    });

    const historyRef = query(
      ref(db, `devices/${deviceId}/history`),
      limitToLast(20),
    );
    const unsubscribeHistory = onValue(historyRef, (snap) => {
      const hData = snap.val();
      if (hData) {
        setHistoryData(
          Object.keys(hData).map((key) => ({
            time: new Date(hData[key].timestamp).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            gas: hData[key].gasLevel,
            smoke: hData[key].smokeLevel,
          })),
        );
      }
    });

    return () => {
      unsubscribe();
      unsubscribeHistory();
    };
  }, [deviceId]);

  const handleDelete = () => {
    if (
      window.confirm(
        `CẢNH BÁO: Bạn có chắc muốn xóa VĨNH VIỄN thiết bị "${deviceName}"?\nDữ liệu trên Firebase cũng sẽ mất!`,
      )
    ) {
      remove(ref(db, `users/${userId}/${deviceId}`));
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

  return (
    <div
      style={
        isDanger
          ? {
              ...styles.cardContainer,
              border: "2px solid #ff5252",
              boxShadow: "0 0 20px rgba(255, 82, 82, 0.4)",
            }
          : styles.cardContainer
      }
    >
      <div style={styles.cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{isDanger ? "🔥" : "📍"}</span>
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
          {new Date(deviceData.lastUpdate).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>

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

      <HistoryChart dataHistory={historyData} />

      <div style={styles.controlBox}>
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
        <div style={styles.controlRow}>
          <ControlToggle
            label="Gas"
            isOn={deviceData.configGas}
            onClick={() => toggleConfig("configGas", deviceData.configGas)}
            color="#639ad1"
          />
          <ControlToggle
            label="Lửa"
            isOn={deviceData.configSmoke}
            onClick={() => toggleConfig("configSmoke", deviceData.configSmoke)}
            color="#639ad1"
          />
        </div>
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

function Dashboard({ user }) {
  const [userDevices, setUserDevices] = useState(null);
  const [dangerList, setDangerList] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [viewingKey, setViewingKey] = useState(null);
  const [viewingName, setViewingName] = useState("");

  useEffect(() => {
    onValue(ref(db, `users/${user.uid}`), (snapshot) =>
      setUserDevices(snapshot.val()),
    );
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
      setViewingKey(newKey);
      setViewingName(newDeviceName);
    });
  };

  return (
    <div style={styles.pageWrapper}>
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
            style={{ ...styles.miniBtn }}
          >
            Thoát
          </button>
        </div>
      </div>

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
              onViewKey={(k, n) => {
                setViewingKey(k);
                setViewingName(n);
              }}
            />
          ))
        )}
      </div>

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
            <p>
              Thiết bị: <b>{viewingName}</b>
            </p>
            <div style={styles.bigKeyBox}>{viewingKey}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(viewingKey);
                alert("Đã copy!");
              }}
              style={{
                ...styles.modalSaveBtn,
                width: "100%",
                marginTop: "15px",
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

const styles = {
  pageWrapper: {
    background: "#e8eef2", // Nền tổng thể bạch kim ánh băng
    minHeight: "100vh",
    color: "#05182e", // Chữ màu Navy đen 
    fontFamily: "-apple-system, system-ui, sans-serif",
    paddingBottom: "50px",
    boxSizing: "border-box",
  },
  alertHeaderSafe: {
    position: "sticky",
    top: 0,
    zIndex: 99,
    background: "#d3e0ea", // Nền header chìm xuống một xíu
    backdropFilter: "blur(10px)",
    padding: "15px 20px",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
    boxShadow: "0 8px 20px rgba(5, 24, 46, 0.08)", // Đổ bóng Navy đậm
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#0d47a1", // Chữ nhấn Xanh Dương Đậm
    fontWeight: "700",
  },
  alertHeaderDanger: {
    position: "sticky",
    top: 0,
    zIndex: 99,
    background: "rgba(225, 29, 72, 0.95)", // Đỏ Rose cao cấp
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
    boxShadow: "0 8px 25px rgba(225, 29, 72, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#ffffff",
  },
  gridList: {
    padding: "20px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },
  cardContainer: {
    background: "#f4f7f9", // Thẻ sáng hơn nền trang một chút
    padding: "20px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "390px",
    border: "1px solid #b4c5d6", // Viền kim loại
    boxShadow: "0 10px 30px rgba(5, 24, 46, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    overflow: "hidden", 
    minWidth: "320px", 
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #b4c5d6",
    paddingBottom: "10px",
  },
  sensorRow: { display: "flex", gap: "10px", justifyContent: "center" },
  controlBox: {
    background: "#e8eef2", // Hộp điều khiển đồng bộ nền trang
    padding: "15px",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  controlRow: { display: "flex", gap: "10px" },
  miniBtn: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #b4c5d6",
    background: "#ffffff", // Điểm nhấn sáng nhẹ cho nút mini
    color: "#05182e",
    fontSize: "0.75rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  viewKeyBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #0d47a1", // Viền Xanh Dương Đậm
    background: "transparent",
    color: "#0d47a1",
    fontSize: "0.85rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  deleteBtn: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    border: "1px solid #e11d48",
    color: "#e11d48",
    cursor: "pointer",
    fontSize: "0.8rem",
    borderRadius: "8px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(5, 24, 46, 0.7)", // Kính mờ Navy cực sang
    zIndex: 10000,
    display: "grid",
    placeItems: "center",
    padding: "20px",
  },
  modalContent: {
    background: "#f4f7f9",
    padding: "30px",
    borderRadius: "25px",
    width: "100%",
    maxWidth: "340px",
    textAlign: "center",
    border: "1px solid #b4c5d6",
    boxSizing: "border-box",
  },
  modalInput: {
    width: "100%",
    padding: "15px",
    marginTop: "20px",
    borderRadius: "12px",
    border: "2px solid #b4c5d6",
    background: "#e8eef2",
    color: "#05182e",
    fontSize: "1.1rem",
    boxSizing: "border-box",
    outline: "none",
    textAlign: "center",
    fontWeight: "600",
  },
  modalSaveBtn: {
    flex: 1,
    padding: "15px",
    background: "#0d47a1", // Nút Xanh Dương Đậm nổi bần bật
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(13, 71, 161, 0.3)",
  },
  modalCancelBtn: {
    flex: 1,
    padding: "15px",
    background: "#c2d1df", // Nút hủy màu xám xanh chìm xuống
    border: "none",
    borderRadius: "12px",
    color: "#05182e",
    cursor: "pointer",
    fontWeight: "bold",
  },
  bigKeyBox: {
    background: "#e8eef2",
    color: "#0d47a1", // Mã thiết bị hiện Xanh dương đậm
    padding: "20px",
    borderRadius: "12px",
    fontFamily: "monospace",
    fontSize: "1.3rem",
    fontWeight: "bold",
    wordBreak: "break-all",
    marginTop: "15px",
    border: "2px dashed #0d47a1", // Nét đứt bo viền
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
  background: isMuted ? "#f59e0b" : "#183a5e", // Vàng hổ phách khi Mute, Xanh dương đậm khi bình thường
  color: isMuted ? "#05182e" : "#ffffff", // Chữ tối khi nền sáng, chữ trắng khi nền đậm
  fontWeight: "bold",
  fontSize: "0.8rem",
  cursor: "pointer",
  boxShadow: isMuted ? "0 4px 10px rgba(245, 158, 11, 0.3)" : "none", // Thêm tí bóng cho nút Mute nổi bật
});

const toggleBtnStyle = (isOn, color) => ({
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: isOn ? color : "#183a5e", // Lấy màu truyền vào khi ON, Xanh dương đậm khi OFF
  color: isOn ? "#05182e" : "#d3e0ea", // Chữ màu Navy đen khi ON, chữ xanh băng nhạt khi OFF
  fontSize: "0.8rem",
  fontWeight: "bold",
  flex: 1,
  cursor: "pointer",
});

export default Dashboard;
