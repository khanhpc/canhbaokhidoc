import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

function Auth() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState(""); // State mới cho Xác nhận mật khẩu
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    // 1. Lọc sạch khoảng trắng ở email
    const cleanEmail = email.trim();

    // 2. Kiểm tra mật khẩu nhập lại nếu đang ở chế độ Đăng ký
    if (isRegister && pass !== confirmPass) {
      setErrMsg("❌ Mật khẩu xác nhận không khớp!");
      return; // Dừng lại luôn, không gọi Firebase nữa
    }

    setIsLoading(true);
    setErrMsg("");

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        // Đăng ký xong thì chuyển trang luôn, không cần alert nữa cho mượt
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, pass);
      }
      // 3. Thành công là chuyển trang luôn, component sẽ tự huỷ
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.code);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrMsg("❌ Sai Email hoặc Mật khẩu! Vui lòng kiểm tra lại.");
      } else if (error.code === 'auth/invalid-email') {
        setErrMsg("❌ Định dạng Email không hợp lệ.");
      } else if (error.code === 'auth/missing-password') {
        setErrMsg("❌ Vui lòng nhập mật khẩu.");
      } else {
        setErrMsg("⚠️ Lỗi hệ thống: " + error.message);
      }

      // 4. Chỉ tắt Loading khi có lỗi (để người dùng còn bấm thử lại)
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f2027",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <style>
        {`
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active{
              -webkit-box-shadow: 0 0 0 30px rgba(255,255,255,0.1) inset !important;
              -webkit-text-fill-color: white !important;
              transition: background-color 5000s ease-in-out 0s;
          }
        `}
      </style>

      <form
        onSubmit={handleAuth}
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "40px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "340px",
          boxSizing: "border-box",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 15px 35px rgba(0,0,0,0.5)",
          transition: "all 0.3s ease", // Giúp hiệu ứng đổi Form mượt hơn
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", letterSpacing: "2px" }}>
          {isRegister ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}
        </h2>

        {errMsg && (
          <div style={{
            background: "rgba(255, 59, 48, 0.1)", color: "#ff3b30", padding: "10px",
            borderRadius: "8px", marginBottom: "15px", fontSize: "0.85rem",
            textAlign: "center", border: "1px solid rgba(255, 59, 48, 0.3)"
          }}>
            {errMsg}
          </div>
        )}

        <input
          type="email"
          name="email"
          autoComplete="username email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          style={{
            width: "100%", padding: "12px", marginBottom: "15px",
            borderRadius: "8px", border: "none", boxSizing: "border-box",
            background: "rgba(255,255,255,0.1)", color: "#fff", outline: "none"
          }}
          required
        />

        <input
          type="password"
          name="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          placeholder="Mật khẩu"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          disabled={isLoading}
          style={{
            width: "100%", padding: "12px",
            marginBottom: isRegister ? "15px" : "25px", // Đổi khoảng cách tuỳ trạng thái
            borderRadius: "8px", border: "none", boxSizing: "border-box",
            background: "rgba(255,255,255,0.1)", color: "#fff", outline: "none"
          }}
          required
        />

        {/* Ô XÁC NHẬN MẬT KHẨU - Chỉ hiện khi Đăng Ký */}
        {isRegister && (
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%", padding: "12px", marginBottom: "25px",
              borderRadius: "8px", border: "none", boxSizing: "border-box",
              background: "rgba(255,255,255,0.1)", color: "#fff", outline: "none"
            }}
            required={isRegister} // Cực quan trọng: Chuyển sang đăng nhập thì ko bắt buộc nhập ô này
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%", padding: "14px",
            background: isLoading ? "#555" : "#C5A059",
            color: isLoading ? "#aaa" : "#000",
            border: "none", borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: "bold", letterSpacing: "1px", transition: "all 0.3s"
          }}
        >
          {isLoading ? "ĐANG XỬ LÝ..." : (isRegister ? "TẠO TÀI KHOẢN" : "ĐĂNG NHẬP")}
        </button>

        <p
          onClick={() => {
            if (!isLoading) {
              setIsRegister(!isRegister);
              setErrMsg(""); // Bấm chuyển qua lại thì xoá lỗi cũ đi cho sạch
            }
          }}
          style={{
            marginTop: "25px", cursor: isLoading ? "default" : "pointer",
            textAlign: "center", color: "#999", fontSize: "0.85rem"
          }}
        >
          {isRegister ? "Đã có tài khoản? Đăng nhập ngay" : "Chưa có tài khoản? Đăng ký mới"}
        </p>
      </form>
    </div>
  );
}

export default Auth;