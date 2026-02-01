import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { signOut } from "firebase/auth";
import SensorCard from "./SensorCard";

// --- 1. COMPONENT HIỂN THỊ TỪNG THIẾT BỊ ---
const DeviceItem = ({ deviceId, deviceName, userId }) => {
  const [deviceData, setDeviceData] = useState(null);

  useEffect(() => {
    const deviceRef = ref(db, `devices/${deviceId}/home`);
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      setDeviceData(snapshot.val());
    });
    return () => unsubscribe();
  }, [deviceId]);

  const handleDelete = () => {
    // Dùng window.confirm ở đây tạm ổn, hoặc làm modal xóa riêng nếu muốn
    if (window.confirm(`Xóa thiết bị "${deviceName}" khỏi danh sách?`)) {
      remove(ref(db, `users/${userId}/${deviceId}`));
    }
  };

  const toggleConfig = (key, currentVal) => {
    set(ref(db, `devices/${deviceId}/home/${key}`), !currentVal);
  };

  const toggleMute = () => {
    if (deviceData) {
      set(ref(db, `devices/${deviceId}/home/isMuted`), !deviceData.isMuted);
    }
  };

  if (!deviceData)
    return <div style={{ color: "#777", padding: "20px" }}>Đang tải...</div>;

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
    <div style={styles.cardContainer}>
      {/* Header Card */}
      <div style={{ textAlign: "center", marginBottom: "15px", width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "5px",
          }}
        >
          <h3 style={{ margin: "0", color: "#4db6ac", fontSize: "1.1rem" }}>
            📍 {deviceName}
          </h3>
          <span style={{ fontSize: "0.7rem", color: "#aaa" }}>
            🕒 {lastUpdateStr}
          </span>
        </div>

        {/* Khu vực Copy Key */}
        <div
          onClick={(e) => {
            e.stopPropagation();

            // Cách 1: Thử dùng API chuẩn (Cho Laptop/HTTPS)
            if (navigator.clipboard && window.isSecureContext) {
              navigator.clipboard
                .writeText(deviceId)
                .then(() => alert("Đã copy KEY (Chuẩn)!"))
                .catch((err) => alert("Lỗi copy: " + err));
            } else {
              // Cách 2: Dùng chiêu cũ (Cho Điện thoại/HTTP/IP Lan)
              const textArea = document.createElement("textarea");
              textArea.value = deviceId;

              // Giấu textarea đi để người dùng ko thấy
              textArea.style.position = "fixed";
              textArea.style.left = "-9999px";
              textArea.style.top = "0";
              document.body.appendChild(textArea);

              textArea.focus();
              textArea.select();

              try {
                document.execCommand("copy");
                alert("Đã copy KEY (Mobile)!");
              } catch (err) {
                alert("Không thể copy trên máy này: " + err);
              }

              document.body.removeChild(textArea);
            }
          }}
          style={styles.keyBadge}
        >
          <span style={{ fontSize: "1.1rem" }}>🔑</span>
          <span>{deviceId.substring(0, 8)}...</span>
          <span
            style={{
              fontSize: "0.7rem",
              background: "#00e676",
              color: "#000",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            COPY
          </span>
        </div>
      </div>

      {/* Cảm biến */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div style={wrapperStyle(deviceData.configGas)}>
          <SensorCard
            title="KHÍ GAS"
            value={gasVal}
            unit="%"
            isDanger={deviceData.isDanger}
          />
        </div>
        <div style={wrapperStyle(deviceData.configSmoke)}>
          <SensorCard
            title="LỬA/KHÓI"
            value={smokeVal}
            unit="%"
            isDanger={deviceData.smokeDanger}
          />
        </div>
      </div>

      {/* Control Panel */}
      <div style={styles.controlBox}>
        <div style={styles.muteRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.5rem" }}>
              {deviceData.isMuted ? "🔇" : "🔊"}
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "left",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                CÒI BÁO
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  color: deviceData.isMuted ? "#ffc107" : "#aaa",
                }}
              >
                {deviceData.isMuted ? "Đã tắt" : "Đang bật"}
              </span>
            </div>
          </div>
          <button onClick={toggleMute} style={muteBtnStyle(deviceData.isMuted)}>
            {deviceData.isMuted ? "BẬT LẠI" : "TẮT TIẾNG"}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            marginTop: "10px",
          }}
        >
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
        Gỡ thiết bị này
      </button>
    </div>
  );
};

// Component con cho nút gạt ON/OFF
const ControlToggle = ({ label, isOn, onClick }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      background: "rgba(0,0,0,0.2)",
      padding: "5px 10px",
      borderRadius: "8px",
      flex: 1,
      justifyContent: "space-between",
    }}
  >
    <span style={{ fontSize: "0.8rem" }}>{label}</span>
    <button style={toggleBtnStyle(isOn)} onClick={onClick}>
      {isOn ? "ON" : "OFF"}
    </button>
  </div>
);

// --- 2. COMPONENT CHÍNH DASHBOARD ---
function Dashboard({ user }) {
  const [userDevices, setUserDevices] = useState(null);

  // State cho Modal (Popup)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [createdKey, setCreatedKey] = useState(null); // Lưu key vừa tạo để hiện lên

  useEffect(() => {
    const userRef = ref(db, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      setUserDevices(snapshot.val());
    });
  }, [user.uid]);

  // Xử lý khi bấm nút "Lưu" trong Modal
  const handleConfirmAdd = () => {
    if (!newDeviceName.trim()) return alert("Vui lòng nhập tên!");

    const newDeviceRef = push(ref(db, "devices"));
    const newKey = newDeviceRef.key;

    // Tạo dữ liệu gốc
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

    // Liên kết vào User
    set(ref(db, `users/${user.uid}/${newKey}`), {
      name: newDeviceName,
      added_at: Date.now(),
    }).then(() => {
      setCreatedKey(newKey); // Hiện mã Key cho người dùng copy
      setNewDeviceName(""); // Reset tên
    });
  };

  // Reset Modal khi tắt
  const closeAllModals = () => {
    setIsModalOpen(false);
    setCreatedKey(null);
    setNewDeviceName("");
  };

  return (
    <div style={styles.pageWrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>🛡️ PCCC SYSTEM</h2>
          <small style={{ color: "#aaa", fontSize: "0.8rem" }}>
            {user.email}
          </small>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setIsModalOpen(true)} style={styles.addBtn}>
            + THÊM
          </button>
          <button onClick={() => signOut(auth)} style={styles.logoutBtn}>
            Thoát
          </button>
        </div>
      </div>

      {/* DANH SÁCH THIẾT BỊ */}
      <div style={styles.gridList}>
        {!userDevices ? (
          <div
            style={{ textAlign: "center", color: "#888", marginTop: "50px" }}
          >
            <p>Chưa có thiết bị nào.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ ...styles.addBtn, padding: "10px 20px" }}
            >
              Thêm thiết bị ngay
            </button>
          </div>
        ) : (
          Object.keys(userDevices).map((key) => (
            <DeviceItem
              key={key}
              deviceId={key}
              deviceName={userDevices[key].name}
              userId={user.uid}
            />
          ))
        )}
      </div>

      {/* --- MODAL 1: NHẬP TÊN THIẾT BỊ --- */}
      {isModalOpen && !createdKey && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Thêm Thiết Bị Mới</h3>
            <p style={{ fontSize: "0.9rem", color: "#ccc" }}>
              Đặt tên cho vị trí lắp đặt (VD: Bếp, Phòng Khách...)
            </p>
            <input
              type="text"
              placeholder="Nhập tên..."
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              style={styles.modalInput}
              autoFocus
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.modalCancelBtn}
              >
                Hủy
              </button>
              <button onClick={handleConfirmAdd} style={styles.modalSaveBtn}>
                Tạo Thiết Bị
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: HIỂN THỊ KEY SAU KHI TẠO --- */}
      {createdKey && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>✅</div>
            <h3 style={{ color: "#00e676" }}>Tạo Thành Công!</h3>
            <p style={{ fontSize: "0.9rem" }}>
              Đây là mã KEY để nạp vào ESP32:
            </p>

            <div
              style={styles.keyDisplayBox}
              onClick={() => navigator.clipboard.writeText(createdKey)}
            >
              {createdKey}
            </div>
            <small
              style={{ color: "#aaa", display: "block", marginTop: "5px" }}
            >
              (Chạm vào mã trên để copy)
            </small>

            <button
              onClick={closeAllModals}
              style={{
                ...styles.modalSaveBtn,
                width: "100%",
                marginTop: "20px",
              }}
            >
              Đã Copy, Xong!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CSS STYLES (ĐÃ FIX CHUẨN MOBILE) ---
const styles = {
  pageWrapper: {
    background:
      "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    minHeight: "100vh",
    color: "white",
    padding: "10px", // Giảm padding để đỡ tốn chỗ trên mobile
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box", // Quan trọng: Để không bị tràn ngang
    overflowX: "hidden", // Chặn cuộn ngang tuyệt đối
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.1)",
    padding: "10px 15px",
    borderRadius: "12px",
    marginBottom: "20px",
    backdropFilter: "blur(10px)",
    position: "sticky", // Dính chặt lên đầu
    top: "10px", // Cách mép trên 10px
    zIndex: 100, // Luôn nổi lên trên cùng
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  gridList: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "15px",
    paddingBottom: "80px", // Chừa chỗ phía dưới để lỡ có nút bấm ko bị che
  },
  cardContainer: {
    background: "rgba(255,255,255,0.05)",
    padding: "15px",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%", // Chiếm hết chiều ngang điện thoại
    maxWidth: "400px", // Nhưng không to quá 400px trên máy tính
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    boxSizing: "border-box", // Quan trọng
  },
  keyBadge: {
    fontSize: "0.85rem",
    background: "rgba(0,0,0,0.4)", // Nền đậm hơn chút cho rõ
    padding: "12px 20px", // Tăng độ dày nút (Quan trọng nhất)
    borderRadius: "30px", // Bo tròn hơn
    color: "#00e676", // Đổi màu chữ sang xanh cho nổi bật hẳn
    cursor: "pointer",
    display: "inline-flex", // Dùng flex để căn giữa icon
    alignItems: "center",
    justifyContent: "center",
    gap: "8px", // Khoảng cách giữa chữ và icon
    marginTop: "10px", // Cách tên phòng ra một chút
    border: "1px solid rgba(0,230,118,0.3)", // Viền mờ màu xanh
    minWidth: "120px", // Đảm bảo nút không bao giờ quá bé
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)", // Đổ bóng nhẹ cho cảm giác bấm được
  },
  controlBox: {
    marginTop: "15px",
    width: "100%",
    background: "rgba(0,0,0,0.2)",
    padding: "12px",
    borderRadius: "12px",
    boxSizing: "border-box",
  },
  muteRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "10px",
  },
  deleteLink: {
    marginTop: "15px",
    background: "transparent",
    border: "none",
    color: "#ff5252",
    cursor: "pointer",
    fontSize: "0.75rem",
    textDecoration: "underline",
    opacity: 0.8,
  },
  addBtn: {
    padding: "8px 12px",
    background: "#00e676",
    border: "none",
    borderRadius: "8px",
    color: "#000",
    fontWeight: "bold",
    fontSize: "0.8rem",
    cursor: "pointer",
    whiteSpace: "nowrap", // Không cho chữ bị xuống dòng
  },
  logoutBtn: {
    padding: "8px 12px",
    background: "#ff5252",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "0.8rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // --- MODAL (POPUP) CỐ ĐỊNH CHUẨN ---
  modalOverlay: {
    position: "fixed", // Ghim chặt vào màn hình
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // Phủ kín 4 góc
    background: "rgba(0,0,0,0.85)", // Tối màu nền đi
    display: "flex",
    justifyContent: "center",
    alignItems: "center", // Căn giữa mọi thứ
    zIndex: 9999, // Đảm bảo đè lên tất cả mọi thứ
    padding: "20px", // Cách lề để không bị dính sát mép điện thoại
  },
  modalContent: {
    background: "#1e2933",
    padding: "25px",
    borderRadius: "15px",
    width: "100%",
    maxWidth: "320px", // Vừa vặn chiều ngang iPhone
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
    animation: "popIn 0.3s ease-out", // Hiệu ứng nảy ra (nếu muốn)
  },
  modalInput: {
    width: "100%",
    padding: "15px", // Ô nhập to ra cho dễ bấm
    marginTop: "15px",
    borderRadius: "8px",
    border: "1px solid #555",
    background: "#0f171e",
    color: "white",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
  },
  modalSaveBtn: {
    flex: 1,
    padding: "12px",
    background: "#00e676",
    border: "none",
    borderRadius: "8px",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem", // Chữ to rõ
  },
  modalCancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#455a64",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
  },
  keyDisplayBox: {
    background: "#000",
    color: "#00e676",
    padding: "15px",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "1.2rem",
    wordBreak: "break-all", // Tự xuống dòng nếu mã quá dài
    marginTop: "15px",
    border: "1px dashed #00e676",
    cursor: "pointer",
  },
};

const wrapperStyle = (isEnabled) => ({
  opacity: isEnabled ? 1 : 0.5,
  filter: isEnabled ? "none" : "grayscale(100%)",
  transition: "all 0.3s",
});

const muteBtnStyle = (isMuted) => ({
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  background: isMuted ? "#ffc107" : "#455a64",
  color: isMuted ? "#000" : "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "0.75rem",
});

const toggleBtnStyle = (isOn) => ({
  padding: "5px 10px",
  borderRadius: "6px",
  border: "none",
  background: isOn ? "#00e676" : "#455a64",
  color: isOn ? "#000" : "#ccc",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "0.75rem",
  minWidth: "45px",
});

export default Dashboard;
