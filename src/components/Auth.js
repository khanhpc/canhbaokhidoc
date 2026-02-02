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
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert("Đăng ký thành công!");
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
      navigate("/");
    } catch (error) {
      // --- SỬA ĐOẠN NÀY ĐỂ BÁO LỖI TIẾNG VIỆT ---
      console.error("Lỗi đăng nhập:", error.code); // In mã lỗi ra xem cho chắc

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert("❌ Sai Email hoặc Mật khẩu! Vui lòng kiểm tra lại.");
      } else if (error.code === 'auth/email-already-in-use') {
        alert("⚠️ Email này đã được đăng ký rồi. Hãy chuyển sang Đăng nhập.");
      } else if (error.code === 'auth/weak-password') {
        alert("⚠️ Mật khẩu yếu quá (phải trên 6 ký tự).");
      } else if (error.code === 'auth/too-many-requests') {
        alert("⛔ Bạn thử sai nhiều quá. Hãy đợi một chút rồi thử lại.");
      } else {
        alert("Lỗi hệ thống: " + error.message);
      }
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
      <form
        onSubmit={handleAuth}
        style={{
          background: "rgba(255,255,255,0.1)",
          padding: "40px",
          borderRadius: "20px",
          width: "320px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          {isRegister ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "none",
          }}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
          }}
          required
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#00e676",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isRegister ? "ĐĂNG KÝ NGAY" : "ĐĂNG NHẬP"}
        </button>
        <p
          onClick={() => setIsRegister(!isRegister)}
          style={{
            marginTop: "20px",
            cursor: "pointer",
            textAlign: "center",
            color: "#ccc",
            textDecoration: "underline",
          }}
        >
          {isRegister
            ? "Đã có tài khoản? Đăng nhập"
            : "Chưa có tài khoản? Tạo mới"}
        </p>
      </form>
    </div>
  );
}
export default Auth;
