// src/components/Timetable.jsx
import React from "react"
import { useState, useEffect, useMemo } from "react"
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react"
import { getSchedules } from "../../../api/scheduleApi"
import { getMyRegistrations } from "../../../api/dangkyApi"
import { getAllSemesters } from "../../../api/utilsApi"
import { getCurrentMsv } from "../../utils/auth"
import "./timetable.css"

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
  13: { start: "19:30", end: "20:20" },
}
function getTimeFromTiet(tietbd, tietkt) {
  const start = tietThoiGian[tietbd]?.start ?? "??:??"
  const end = tietThoiGian[tietkt]?.end ?? "??:??"
  return `${start} – ${end}`
}
// Tên các ngày trong tuần - Chủ nhật ở cuối
const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"]

export default function Timetable() {
  const msv = getCurrentMsv()
  if (!msv) return <div>Vui lòng đăng nhập để xem thời khóa biểu.</div>

  // === 1) State cho học kỳ ===
  const [semesters, setSemesters] = useState([])
  const [selectedMahk, setSelectedMahk] = useState("") // mã học kỳ đang chọn

  // === 2) State cho sessions / registrations ===
  const [sessions, setSessions] = useState([])    // all sessions from API
  const [regs, setRegs] = useState([])            // all registrations của sinh viên
  const [coursesData, setCoursesData] = useState([])  // mảng courses sau khi lọc + map

  // === 3) State cho hiển thị ngày/tuần ===
  // 3a) currentDay khởi tạo = index của "hôm nay"
  const [currentDay, setCurrentDay] = useState(() => {
    const today = new Date()
    const dow = today.getDay()    // 0 = Chủ nhật, 1 = Thứ 2, ...
    return dow === 0 ? 6 : dow - 1
  })
  // 3b) weekStartDate khởi tạo = Thứ Hai của tuần hôm nay
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date()
    const dow = today.getDay()     // 0=CN,1=T2,...
    const daysToMonday = dow === 0 ? 6 : dow - 1
    const monday = new Date(today)
    monday.setDate(today.getDate() - daysToMonday)
    monday.setHours(0, 0, 0, 0)
    return monday
  })
  const [currentWeek, setCurrentWeek] = useState(0) // offset tuần (0 = tuần hiện tại hoặc tuần học kỳ)
  const [activeTab, setActiveTab] = useState("day") // "day" / "week"

  // Danh sách tiết để render grid
  const periods = Object.entries(tietThoiGian).map(([period, time]) => ({
    period: parseInt(period),
    time: `${time.start} - ${time.end}`
  }))

  // === 4) Load sessions + registrations lần đầu ===
  useEffect(() => {
    ; (async () => {
      try {
        const resS = await getSchedules()
        setSessions(resS.data)
        const resR = await getMyRegistrations()
        setRegs(resR.data)
      } catch (err) {
        console.error("Lỗi khi fetch lịch hoặc đăng ký:", err)
      }
    })()
  }, [])

  // === 5) Khi sessions hoặc regs thay đổi, build coursesData ===
  useEffect(() => {
    const regIds = new Set(regs.map(r => r.lichhoc_id))
    const mySessions = sessions
      .filter(s => regIds.has(s.id))
      .map(s => {
        const start = new Date(s.ngaybd)
        start.setHours(0, 0, 0, 0)
        const end = new Date(s.ngaykt)
        end.setHours(23, 59, 59, 999)
        return {
          id: s.id,
          name: s.tenmh,
          code: s.mamh,
          room: s.tenphong,
          khu: s.khu,
          instructor: s.tengv,
          tennhom: s.tennhom,
          day: s.thu - 2 < 0 ? 6 : s.thu - 2,
          startPeriod: s.tietbd,
          endPeriod: s.tietkt,
          startTime: getTimeFromTiet(s.tietbd, s.tietkt).split(" – ")[0],
          endTime: getTimeFromTiet(s.tietbd, s.tietkt).split(" – ")[1],
          ngaybd: start,
          ngaykt: end
        }
      })
    setCoursesData(mySessions)
  }, [sessions, regs])

  // === 6) Load danh sách học kỳ ngay khi mount ===
  useEffect(() => {
    ; (async () => {
      try {
        const { data } = await getAllSemesters()
        setSemesters(data)
      } catch (err) {
        console.error("Không tải được danh sách học kỳ:", err)
      }
    })()
  }, [])

  // === 7) Khi user chọn học kỳ ===
  useEffect(() => {
    if (!selectedMahk) return

    const hk = semesters.find(h => h.mahk === selectedMahk)
    if (hk && hk.ngaybd) {
      const d0 = new Date(hk.ngaybd)
      d0.setHours(0, 0, 0, 0)
      setWeekStartDate(d0)
      setCurrentWeek(0)
      setCurrentDay(0)
    }
  }, [selectedMahk, semesters])

  // === 8) Hàm tính ngày Thứ Hai của tuần dựa vào “hôm nay” hoặc “học kỳ” + offset tuần ===
  const calculateWeekStartDate = (weekOffset) => {
    if (selectedMahk) {
      // Nếu đã chọn học kỳ → tính dựa trên ngaybd của học kỳ
      const hk = semesters.find(h => h.mahk === selectedMahk)
      if (!hk || !hk.ngaybd) return

      const base = new Date(hk.ngaybd)
      base.setHours(0, 0, 0, 0)
      base.setDate(base.getDate() + weekOffset * 7)
      setWeekStartDate(base)
      return
    }

    // Nếu chưa chọn học kỳ → tính tuần chứa “hôm nay” + offset
    const today = new Date()
    const dayOfWeek = today.getDay()   // 0=CN,1=T2,...
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - daysToSubtract + weekOffset * 7)
    startDate.setHours(0, 0, 0, 0)
    setWeekStartDate(startDate)
  }

  // Khi currentWeek hoặc selectedMahk/semesters thay đổi, gọi lại
  useEffect(() => {
    calculateWeekStartDate(currentWeek)
  }, [currentWeek, selectedMahk, semesters])

  // === 9) Hàm lấy ngày tương ứng cho ô “Ngày” (0..6) ===
  const getDateForDay = (dayIndex) => {
    const d = new Date(weekStartDate)
    d.setDate(weekStartDate.getDate() + dayIndex)
    return d
  }

  // === 10) Lọc courses theo ngày ===
  const getCoursesByDay = (dayIndex) => {
    const date = getDateForDay(dayIndex)
    date.setHours(0, 0, 0, 0)
    return coursesData.filter(course =>
      course.day === dayIndex &&
      date >= course.ngaybd &&
      date <= course.ngaykt
    )
  }

  // === 11) Chọn / mở dialog chi tiết môn học ===
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const handleCourseClick = (course) => {
    setSelectedCourse(course)
    setIsDialogOpen(true)
  }
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDialogOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // === 12) Điều hướng Ngày / Tuần ===
  const handlePreviousDay = () => setCurrentDay(prev => (prev === 0 ? 6 : prev - 1))
  const handleNextDay = () => setCurrentDay(prev => (prev === 6 ? 0 : prev + 1))
  const handlePreviousWeek = () => setCurrentWeek(prev => prev - 1)
  const handleNextWeek = () => setCurrentWeek(prev => prev + 1)

  // === 13) Xử lý xung đột ===
  const conflicts = useMemo(() => {
    const list = []
    for (let i = 0; i < coursesData.length; i++) {
      for (let j = i + 1; j < coursesData.length; j++) {
        const a = coursesData[i]
        const b = coursesData[j]
        if (a.day !== b.day) continue
        const timeOverlap = a.startPeriod <= b.endPeriod && b.startPeriod <= a.endPeriod
        const dateOverlap = a.ngaybd <= b.ngaykt && b.ngaybd <= a.ngaykt
        if (timeOverlap && dateOverlap) list.push({ a, b })
      }
    }
    return list
  }, [coursesData])

  // === 14) Format Date ===
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
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
          {/* Chọn học kỳ */}
          <label>
            Học kỳ:&nbsp;
            <select
              value={selectedMahk}
              onChange={e => {
                const mhk = e.target.value
                setSelectedMahk(mhk)
                // effect (7) sẽ set weekStartDate = ngày bắt đầu học kỳ, reset tuần/ngày
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
            {weekdays.map((day, index) => (
              <button
                key={index}
                className={`day-button ${currentDay === index ? "active" : ""}`}
                onClick={() => setCurrentDay(index)}
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

          {/* Hiển thị môn học theo ngày */}
          <div className="day-view">
            <h2 className="day-title">
              {weekdays[currentDay]} ({formatDate(getDateForDay(currentDay))})
            </h2>
            <div className="course-list">
              {getCoursesByDay(currentDay).length > 0 ? (
                getCoursesByDay(currentDay).map((course) => (
                  <div
                    key={course.id}
                    className="course-card blue"
                    onClick={() => handleCourseClick(course)}
                  >
                    <div className="course-name">{course.name}</div>
                    <div className="course-info">
                      <User className="course-icon" /> {course.instructor}
                    </div>
                    <div className="course-info">
                      <MapPin className="course-icon" /> {course.room} - Khu {course.khu}
                    </div>
                    <div className="course-info">
                      <Clock className="course-icon" /> Tiết {course.startPeriod}-
                      {course.endPeriod} ({course.startTime} - {course.endTime})
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">Không có môn học nào vào ngày này</div>
              )}
            </div>
          </div>
        </div>

        {/* === Tab “Theo Tuần” === */}
        <div className={`tab-content ${activeTab === "week" ? "active" : ""}`}>
          <div className="week-info">
            Tuần: {formatDate(weekStartDate)} - {formatDate(getDateForDay(6))}
          </div>

          {/* Điều hướng Tuần trước/sau */}
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
                {/* Header cột đầu trống */}
                <div className="header-cell"></div>
                {weekdays.map((day, index) => (
                  <div key={index} className="header-cell">
                    {day}
                    <div className="header-date">{formatDate(getDateForDay(index))}</div>
                  </div>
                ))}

                {/* Dòng cho từng tiết */}
                {periods.map((period, periodIndex) => (
                  <React.Fragment key={`period-${periodIndex}`}>
                    <div className="time-cell">
                      Tiết {period.period}
                      <br />
                      <small>{period.time}</small>
                    </div>
                    {weekdays.map((_, dayIndex) => {
                      const dateOfThisCell = getDateForDay(dayIndex)
                      const coursesAtPeriod = coursesData.filter(course =>
                        course.day === dayIndex &&
                        dateOfThisCell >= course.ngaybd &&
                        dateOfThisCell <= course.ngaykt &&
                        (
                          course.startPeriod === period.period ||
                          (course.startPeriod < period.period && course.endPeriod >= period.period)
                        )
                      )
                      return (
                        <div key={`slot-${dayIndex}-${periodIndex}`} className="slot-cell">
                          {coursesAtPeriod.map((course) => {
                            if (course.startPeriod === period.period) {
                              return (
                                <div
                                  key={`course-${course.id}`}
                                  className="course-item blue"
                                  style={{
                                    height: `${(course.endPeriod - course.startPeriod + 1) * 54}px`,
                                    zIndex: 2,
                                  }}
                                  onClick={() => handleCourseClick(course)}
                                >
                                  <div className="course-item-name">
                                    {course.name} ({course.code})
                                  </div>
                                  <div className="course-item-details">
                                    <span>
                                      <b>Nhóm:</b> {course.tennhom}
                                    </span>
                                    <br />
                                    <span>
                                      <b>Phòng:</b> {course.room} - Khu {course.khu}
                                    </span>
                                    <br />
                                    <span>
                                      <b>GV:</b> {course.instructor}
                                    </span>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          })}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {activeTab === "week" && conflicts.length > 0 && (
            <div className="conflict-summary">
              <h3>Các xung đột lịch học</h3>
              <ul>
                {conflicts.map(({ a, b }, idx) => (
                  <li key={idx}>
                    <b>{a.name} (Nhóm {a.tennhom})</b> xung đột với{" "}
                    <b>{b.name} (Nhóm {b.tennhom})</b> — Tiết{" "}
                    {Math.max(a.startPeriod, b.startPeriod)}–
                    {Math.min(a.endPeriod, b.endPeriod)}, {weekdays[a.day]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* === Dialog chi tiết môn học === */}
        {isDialogOpen && selectedCourse && (
          <div className="dialog-overlay" onClick={() => setIsDialogOpen(false)}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <div className="dialog-title">
                  {selectedCourse.name} ({selectedCourse.code})
                </div>
              </div>
              <div className="dialog-body">
                {/* Tên nhóm */}
                <div className="info-item">
                  <div className="icon-container blue">
                    <Calendar />
                  </div>
                  <div>
                    <div className="info-label">Tên nhóm</div>
                    <div className="info-value">{selectedCourse.tennhom}</div>
                  </div>
                </div>
                {/* Phòng học */}
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
                {/* Giảng viên */}
                <div className="info-item">
                  <div className="icon-container blue">
                    <User />
                  </div>
                  <div>
                    <div className="info-label">Giảng viên</div>
                    <div className="info-value">{selectedCourse.instructor}</div>
                  </div>
                </div>
                {/* Thời gian */}
                <div className="info-item">
                  <div className="icon-container blue">
                    <Clock />
                  </div>
                  <div>
                    <div className="info-label">Thời gian</div>
                    <div className="info-value">
                      {weekdays[selectedCourse.day]}, Tiết {selectedCourse.startPeriod}-
                      {selectedCourse.endPeriod} ({selectedCourse.startTime} - {selectedCourse.endTime})
                    </div>
                  </div>
                </div>
              </div>
              <button className="close-button" onClick={() => setIsDialogOpen(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
