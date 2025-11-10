import Navbar from "./Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h1>Welcome to GreenMarket 🌱</h1>
        <p>هنا الصفحة الرئيسية العامة لكل المستخدمين.</p>
      </div>
    </div>
  );
}
