// src/components/TimetableGV.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getSchedulesByTeacher } from "../../../api/scheduleApi";
import { getAllSemesters } from "../../../api/utilsApi";
import { getCurrentMgv } from "../../utils/auth";
import "./timetableGV.css";

// Các tiết học
const tietThoiGian = {
  1: { start: "06:45", end: "07:35" },
  2: { start: "07:45", end: "08:35" },
  3: { start: "08:45", end: "09:35" },
  4: { start: "09:45", end: "10:35" },
  5: { start: "10:45", end: "11:35" },
  6: { start: "12:30", end: "13:20" },
  7: { start: "13:30", end: "14:20" },
  8: { start: "14:30", end: "15:20" },
  9: { start: "15:30", end: "16:20" },
  10: { start: "16:30", end: "17:20" },
  11: { start: "17:30", end: "18:20" },
  12: { start: "18:30", end: "19:20" },
  13: { start: "19:30", end: "20:20" }
};
function getTimeFromTiet(tietbd, tietkt) {
  const start = tietThoiGian[tietbd]?.start ?? "??:??";
  const end = tietThoiGian[tietkt]?.end ?? "??:??";
  return `${start} – ${end}`;
}
// Tên các ngày trong tuần (Chủ Nhật đặt cuối)
const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

export default function TimetableGV() {
  const mgv = getCurrentMgv();
  if (!mgv) return <div>Vui lòng đăng nhập để xem thời khóa biểu.</div>;

  // 1) Lấy danh sách học kỳ
  const [semesters, setSemesters] = useState([]);
  // 2) Mã học kỳ đang chọn (mặc định = "")
  const [selectedMahk, setSelectedMahk] = useState("");
  // 3) Tất cả session của giảng viên (không phân biệt học kỳ)
  const [sessions, setSessions] = useState([]);
  // 4) coursesData = mapped từ sessions, không lọc theo học kỳ
  const [coursesData, setCoursesData] = useState([]);

  // 5) weekStartDate: Ngày gốc (Thứ Hai đầu tiên của tuần chứa hôm nay, hoặc ngày bắt đầu của học kỳ khi chọn)
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const dow = today.getDay(); // 0=CN,1=T2,2=T3,...
    // Nếu hôm nay là Chủ Nhật (0) → lùi 6 ngày; nếu thứ Hai (1) → giữ nguyên; nếu thứ khác → lùi (dow-1) ngày
    const daysToMonday = dow === 0 ? 6 : dow - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // 6) Tab active: "day" / "week"
  const [activeTab, setActiveTab] = useState("day");
  // 7) Ngày trong tuần (0..6) khi xem “Theo Ngày”
  const [currentDay, setCurrentDay] = useState(() => {
    const today = new Date();
    const dow = today.getDay(); // 0=CN,1=T2,...
    return dow === 0 ? 6 : dow - 1; // Chủ Nhật → index 6, Thứ Hai → 0, Thứ Ba → 1, ...
  });

  // === Load danh sách học kỳ ===
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllSemesters();
        setSemesters(data);
        // Giữ mặc định "-- Chọn học kỳ --"
      } catch (err) {
        console.error("Không tải được danh sách học kỳ:", err);
      }
    })();
  }, []);

  // === Load tất cả lịch của giảng viên ===
  useEffect(() => {
    if (!mgv) return;
    (async () => {
      try {
        const { data } = await getSchedulesByTeacher(mgv);
        setSessions(data);
      } catch (err) {
        console.error("Không lấy được lịch của giảng viên:", err);
      }
    })();
  }, [mgv]);

  // === Khi sessions thay đổi, map sang coursesData ===
  useEffect(() => {
    const mapped = sessions.map(s => {
      const start = new Date(s.ngaybd);
      start.setHours(0, 0, 0, 0);
      const end = new Date(s.ngaykt);
      end.setHours(23, 59, 59, 999);
      return {
        id: s.id,
        name: s.tenmh,
        code: s.mamh,
        room: s.tenphong,
        khu: s.khu,
        tennhom: s.tennhom,
        day: s.thu - 2 < 0 ? 6 : s.thu - 2, // 0..6
        startPeriod: s.tietbd,
        endPeriod: s.tietkt,
        startTime: getTimeFromTiet(s.tietbd, s.tietkt).split(" – ")[0],
        endTime: getTimeFromTiet(s.tietbd, s.tietkt).split(" – ")[1],
        ngaybd: start,
        ngaykt: end
      };
    });
    setCoursesData(mapped);
  }, [sessions]);

  // === Khi user chọn một học kỳ ===
  //      Đặt weekStartDate = ngaybd của học kỳ đó, reset currentDay = 0
  useEffect(() => {
    if (!selectedMahk) return;
    const hk = semesters.find(h => h.mahk === selectedMahk);
    if (hk && hk.ngaybd) {
      const d0 = new Date(hk.ngaybd);
      d0.setHours(0, 0, 0, 0);
      setWeekStartDate(d0);
      setCurrentDay(0);
    }
  }, [selectedMahk, semesters]);

  // === Điều hướng Ngày trước/sau ===
  const handlePreviousDay = () =>
    setCurrentDay(prev => (prev === 0 ? 6 : prev - 1));
  const handleNextDay = () =>
    setCurrentDay(prev => (prev === 6 ? 0 : prev + 1));

  // === Điều hướng Tuần trước/sau ===
  const handlePreviousWeek = () =>
    setWeekStartDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  const handleNextWeek = () =>
    setWeekStartDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      d.setHours(0, 0, 0, 0);
      return d;
    });

  // === Đóng dialog khi ESC ===
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleCourseClick = course => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") setIsDialogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // === Tính xung đột (nếu muốn hiển thị ở chế độ “Theo Tuần”) ===
  const conflicts = useMemo(() => {
    const list = [];
    for (let i = 0; i < coursesData.length; i++) {
      for (let j = i + 1; j < coursesData.length; j++) {
        const a = coursesData[i];
        const b = coursesData[j];
        if (a.day !== b.day) continue;
        const timeOverlap =
          a.startPeriod <= b.endPeriod && b.startPeriod <= a.endPeriod;
        const dateOverlap = a.ngaybd <= b.ngaykt && b.ngaybd <= a.ngaykt;
        if (timeOverlap && dateOverlap) list.push({ a, b });
      }
    }
    return list;
  }, [coursesData]);

  // === Chuẩn bị dữ liệu render grid tiết ===
  const periods = Object.entries(tietThoiGian).map(([period, time]) => ({
    period: parseInt(period),
    time: `${time.start} - ${time.end}`
  }));

  // === Hàm lấy Date cho “ô ngày” (0..6) ===
  const getDateForDay = dayIndex => {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + dayIndex);
    return d;
  };

  // === Lọc courses theo ngày ===
  const getCoursesByDay = dayIndex => {
    const date = getDateForDay(dayIndex);
    date.setHours(0, 0, 0, 0);
    return coursesData.filter(
      c => c.day === dayIndex && date >= c.ngaybd && date <= c.ngaykt
    );
  };

  // Helper: format Date thành dd/mm/yyyy
  function formatDate(date) {
    const dd = date.getDate().toString().padStart(2, "0");
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  return (
    <div className="app-container">
      <div className="main-content">
        {/* === Header + Tabs === */}
        <div className="header">
          <h1 className="title">Thời Khóa Biểu</h1>
          <div className="tabs-container">
            <div className="tabs-list">
              <button
                className={`tab-trigger ${activeTab === "day" ? "active" : ""}`}
                onClick={() => setActiveTab("day")}
              >
                Theo Ngày
              </button>
              <button
                className={`tab-trigger ${activeTab === "week" ? "active" : ""}`}
                onClick={() => setActiveTab("week")}
              >
                Theo Tuần
              </button>
            </div>
          </div>
        </div>

        <div className="filters" style={{ marginBottom: 16 }}>
          <label>
            Học kỳ:&nbsp;
            <select
              value={selectedMahk}
              onChange={e => {
                const mhk = e.target.value;
                setSelectedMahk(mhk);
                // Khi chọn học kỳ, effect (chọn học kỳ) sẽ set weekStartDate = ngaybd của học kỳ và currentDay = 0
              }}
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map(s => (
                <option key={s.mahk} value={s.mahk}>
                  {s.tenhk} &ndash; {s.namhoc}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* === Tab “Theo Ngày” === */}
        <div className={`tab-content ${activeTab === "day" ? "active" : ""}`}>
          {/* Chọn ngày trong tuần */}
          <div className="day-buttons">
            {weekdays.map((day, idx) => (
              <button
                key={idx}
                className={`day-button ${currentDay === idx ? "active" : ""}`}
                onClick={() => setCurrentDay(idx)}
              >
                {day}
              </button>
            ))}
          </div>
          {/* Điều hướng Ngày trước/sau */}
          <div className="navigation-buttons">
            <button className="nav-button" onClick={handlePreviousDay}>
              <ChevronLeft size={20} />
              <span>Ngày trước</span>
            </button>
            <button className="nav-button" onClick={handleNextDay}>
              <span>Ngày sau</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Hiển thị buổi học theo ngày */}
          <div className="day-view">
            <h2 className="day-title">
              {weekdays[currentDay]} ({formatDate(getDateForDay(currentDay))})
            </h2>
            <div className="course-list">
              {getCoursesByDay(currentDay).length > 0 ? (
                getCoursesByDay(currentDay).map(course => (
                  <div
                    key={course.id}
                    className="course-card blue"
                    onClick={() => handleCourseClick(course)}
                  >
                    <div className="course-name">
                      {course.name} ({course.code})
                    </div>
                    <div className="course-info">
                      <MapPin className="course-icon" />
                      {course.room} - Khu {course.khu}
                    </div>
                    <div className="course-info">
                      <Clock className="course-icon" />
                      Tiết {course.startPeriod}-{course.endPeriod} (
                      {course.startTime} - {course.endTime})
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">
                  Không có buổi nào trong ngày này
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === Tab “Theo Tuần” === */}
        <div className={`tab-content ${activeTab === "week" ? "active" : ""}`}>
          <div className="week-info">
            Tuần: {formatDate(weekStartDate)} - {formatDate(getDateForDay(6))}
          </div>
          <div className="navigation-buttons">
            <button className="nav-button" onClick={handlePreviousWeek}>
              <ChevronLeft size={20} />
              <span>Tuần trước</span>
            </button>
            <button className="nav-button" onClick={handleNextWeek}>
              <span>Tuần sau</span>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="week-view">
            <div className="timetable">
              <div className="timetable-grid">
                <div className="header-cell"></div>
                {weekdays.map((_, idx) => (
                  <div key={idx} className="header-cell">
                    {weekdays[idx]}
                    <div className="header-date">
                      {formatDate(getDateForDay(idx))}
                    </div>
                  </div>
                ))}

                {periods.map((period, pIdx) => (
                  <React.Fragment key={`period-${pIdx}`}>
                    <div className="time-cell">
                      Tiết {period.period}
                      <br />
                      <small>{period.time}</small>
                    </div>
                    {weekdays.map((_, dayIdx) => {
                      const realDate = getDateForDay(dayIdx);
                      const coursesAtPeriod = coursesData.filter(course => {
                        return (
                          course.day === dayIdx &&
                          realDate >= course.ngaybd &&
                          realDate <= course.ngaykt &&
                          (course.startPeriod === period.period ||
                            (course.startPeriod < period.period &&
                              course.endPeriod >= period.period))
                        );
                      });
                      return (
                        <div
                          key={`slot-${dayIdx}-${pIdx}`}
                          className="slot-cell"
                        >
                          {coursesAtPeriod.map(course => {
                            if (course.startPeriod === period.period) {
                              return (
                                <div
                                  key={`course-${course.id}`}
                                  className="course-item blue"
                                  style={{
                                    height: `${(course.endPeriod -
                                      course.startPeriod +
                                      1) *
                                      54}px`,
                                    zIndex: 2
                                  }}
                                  onClick={() => handleCourseClick(course)}
                                >
                                  <div className="course-item-name">
                                    {course.name} ({course.code})
                                  </div>
                                  <div className="course-item-details">
                                    <span>
                                      <b>Nhóm: </b>
                                      {course.tennhom}
                                    </span>
                                    <br />
                                    <span>
                                      <b>Phòng:</b> {course.room} - Khu{" "}
                                      {course.khu}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {activeTab === "week" && conflicts.length > 0 && (
              <div className="conflict-summary">
                <h3>Các xung đột lịch học</h3>
                <ul>
                  {conflicts.map(({ a, b }, idx) => (
                    <li key={idx}>
                      <b>
                        {a.name} (Nhóm {a.tennhom})
                      </b>{" "}
                      xung đột với{" "}
                      <b>
                        {b.name} (Nhóm {b.tennhom})
                      </b>{" "}
                      — Tiết{" "}
                      {Math.max(a.startPeriod, b.startPeriod)}–
                      {Math.min(a.endPeriod, b.endPeriod)},{" "}
                      {weekdays[a.day]}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* === Dialog chi tiết buổi học === */}
        {isDialogOpen && selectedCourse && (
          <div
            className="dialog-overlay"
            onClick={() => setIsDialogOpen(false)}
          >
            <div
              className="dialog-content"
              onClick={e => e.stopPropagation()}
            >
              <div className="dialog-header">
                <div className="dialog-title">
                  {selectedCourse.name} ({selectedCourse.code})
                </div>
              </div>
              <div className="dialog-body">
                <div className="info-item">
                  <div className="icon-container blue">
                    <Calendar />
                  </div>
                  <div>
                    <div className="info-label">Tên nhóm</div>
                    <div className="info-value">
                      {selectedCourse.tennhom}
                    </div>
                  </div>
                </div>
                <div className="info-item">
                  <div className="icon-container blue">
                    <MapPin />
                  </div>
                  <div>
                    <div className="info-label">Phòng học</div>
                    <div className="info-value">
                      {selectedCourse.room} – Khu {selectedCourse.khu}
                    </div>
                  </div>
                </div>
                <div className="info-item">
                  <div className="icon-container blue">
                    <Clock />
                  </div>
                  <div>
                    <div className="info-label">Thời gian</div>
                    <div className="info-value">
                      {weekdays[selectedCourse.day]}, Tiết{" "}
                      {selectedCourse.startPeriod}-{" "}
                      {selectedCourse.endPeriod} ({" "}
                      {selectedCourse.startTime} -{" "}
                      {selectedCourse.endTime} )
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="close-button"
                onClick={() => setIsDialogOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
