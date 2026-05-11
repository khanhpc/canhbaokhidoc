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
  const [confirmPass, setConfirmPass] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (isRegister && pass !== confirmPass) {
      setErrMsg("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    setErrMsg("");

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, pass);
      }
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
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        // Đổi sang màu xanh nước biển nhạt (Gradient nhẹ cho hiện đại)
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#2c3e50", // Đổi chữ sang màu tối để dễ đọc trên nền sáng
        fontFamily: "sans-serif",
      }}
    >
      <style>
        {`
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active{
              -webkit-box-shadow: 0 0 0 30px #fff inset !important;
              -webkit-text-fill-color: #333 !important;
              transition: background-color 5000s ease-in-out 0s;
          }
        `}
      </style>

      <form
        onSubmit={handleAuth}
        style={{
          background: "rgba(255, 255, 255, 0.8)", // Form trắng trong suốt nhẹ
          padding: "40px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "340px",
          boxSizing: "border-box",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)", // Đổ bóng nhẹ nhàng hơn
          transition: "all 0.3s ease",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", letterSpacing: "1px", color: "#1976d2" }}>
          {isRegister ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}
        </h2>

        {errMsg && (
          <div style={{
            background: "#ffebee", color: "#d32f2f", padding: "10px",
            borderRadius: "8px", marginBottom: "15px", fontSize: "0.85rem",
            textAlign: "center", border: "1px solid #ffcdd2"
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
            borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box",
            background: "#fff", color: "#333", outline: "none"
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
            marginBottom: isRegister ? "15px" : "25px",
            borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box",
            background: "#fff", color: "#333", outline: "none"
          }}
          required
        />

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
              borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box",
              background: "#fff", color: "#333", outline: "none"
            }}
            required={isRegister}
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%", padding: "14px",
            background: isLoading ? "#bdc3c7" : "#1976d2", // Màu xanh dương đậm cho nút
            color: "#fff",
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
              setErrMsg("");
            }
          }}
          style={{
            marginTop: "25px", cursor: isLoading ? "default" : "pointer",
            textAlign: "center", color: "#546e7a", fontSize: "0.85rem",
            textDecoration: "underline"
          }}
        >
          {isRegister ? "Đã có tài khoản? Đăng nhập ngay" : "Chưa có tài khoản? Đăng ký mới"}
        </p>
      </form>
    </div>
  );
}

export default Auth;