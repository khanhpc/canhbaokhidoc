import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HistoryChart = ({ dataHistory }) => (
  <div
    style={{
      width: "100%",
      background: "rgba(255,255,255,0.03)",
      padding: "10px",
      borderRadius: "15px",
      marginTop: "5px",
      border: "1px solid rgba(255,255,255,0.08)",
      boxSizing: "border-box",
      minHeight: "180px", // Đảm bảo khung luôn có chiều cao tối thiểu
    }}
  >
    <div style={{ width: "100%", height: 180 }}>
      {/* Thêm thuộc tính aspect để cố định tỷ lệ 2:1 */}
      <ResponsiveContainer width="100%" aspect={2}>
        <LineChart
          data={dataHistory}
          margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis dataKey="time" stroke="#555" fontSize={9} />
          <YAxis stroke="#555" fontSize={9} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: "#1e1e1e",
              border: "none",
              fontSize: "10px",
            }}
          />
          <Line
            type="monotone"
            dataKey="gas"
            stroke="#00e676"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="smoke"
            stroke="#ff5252"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default HistoryChart;
