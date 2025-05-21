import "./sidebar.css"
import { NavLink, useNavigate } from "react-router-dom"
import { Calendar, BookOpen, FileText, User, LogOut } from "lucide-react"



const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const profile = user.profile || {};
  const handleLogout = () => {
    localStorage.removeItem('vaitro');
    // Nếu có lưu thêm token hay user => xóa luôn
    // localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login'); // chuyển về trang đăng nhập
  };
  return (
    <div className="sidebar">
      <div className="profile">
        <div className="user-info">
          <h3 className="name">{profile.ten || 'Tên người dùng'}</h3>
          <p className="student-id">MSV: {profile.msv || 'N/A'}</p>
        </div>
      </div>

      <div className="divider"></div>

      <nav className="menu">
        <NavLink to="/student/info" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
          <User size={20} />
          <span>Thông tin sinh viên</span>
        </NavLink>

        <NavLink to="/student/timetable" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
          <Calendar size={20} />
          <span>Thời khóa biểu</span>
        </NavLink>


      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>

  )
}

export default Sidebar