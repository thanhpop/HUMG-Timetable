
import React from "react"
import { useState, useEffect, useMemo } from "react"
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react"


import { getSchedulesByTeacher } from "../../../api/scheduleApi"
import { getCurrentMgv } from "../../utils/auth";
import "./timetableGV.css"

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
// Tên các ngày trong tuần - đã thay đổi thứ tự để Chủ nhật ở cuối
const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"]

export default function TimetableGV() {

  const mgv = getCurrentMgv();
  if (!mgv) return <div>Vui lòng đăng nhập để xem thời khóa biểu.</div>;



  const [sessions, setSessions] = useState([]);     // all registrations of this student
  const [coursesData, setCoursesData] = useState([]);  // the filtered+mapped array for timetable
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // load sessions + registrations once
  useEffect(() => {
    (async () => {
      // gọi endpoint mới hoặc filter trực tiếp:
      const { data } = await getSchedulesByTeacher(mgv)
      setSessions(data)
    })()
  }, [mgv])

  // whenever sessions or regs change, build coursesData
  useEffect(() => {
    const mapped = sessions.map(s => {
      // parse và normalize ngày bắt đầu về 00:00
      const start = new Date(s.ngaybd)
      start.setHours(0, 0, 0, 0)

      // parse và normalize ngày kết thúc về 23:59:59.999
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
        ngaykt: end,
      }
    })

    setCoursesData(mapped)
  }, [sessions])
  // State lưu trữ dữ liệu môn học
  const getCoursesByDay = (dayIndex) => {
    const date = getDateForDay(dayIndex);
    date.setHours(0, 0, 0, 0);
    return coursesData.filter(course =>
      course.day === dayIndex &&
      date >= course.ngaybd &&
      date <= course.ngaykt
    );
  };

  // State lưu trữ môn học được chọn để xem chi tiết
  const [selectedCourse, setSelectedCourse] = useState(null)

  // State kiểm soát việc hiển thị dialog chi tiết môn học
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // State lưu trữ ngày hiện tại được chọn (0 = Thứ 2, ..., 6 = Chủ nhật)
  const [currentDay, setCurrentDay] = useState(0)

  // State lưu trữ tuần hiện tại (0 = tuần hiện tại, -1 = tuần trước, 1 = tuần sau)
  const [currentWeek, setCurrentWeek] = useState(0)

  // State lưu trữ ngày bắt đầu của tuần hiện tại
  const [weekStartDate, setWeekStartDate] = useState(new Date())

  // State kiểm soát tab đang active (day = xem theo ngày, week = xem theo tuần)
  const [activeTab, setActiveTab] = useState("day")
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = 2020; y <= currentYear + 1; y++) {
    years.push(y);
  }
  const periods = Object.entries(tietThoiGian).map(([period, time]) => ({
    period: parseInt(period),
    time: `${time.start} - ${time.end}`
  }))

  // Lấy dữ liệu từ localStorage khi component được mount
  useEffect(() => {


    // Tính toán ngày bắt đầu của tuần hiện tại (Thứ 2)
    calculateWeekStartDate(0)
  }, [])

  // Tính toán ngày bắt đầu của tuần dựa vào offset tuần
  const calculateWeekStartDate = (weekOffset) => {

    // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7

    // Tính số ngày cần trừ để về thứ 2 của tuần hiện tại
    // Nếu hôm nay là Chủ nhật (0), cần trừ 6 ngày để về thứ 2
    // Nếu hôm nay là thứ 2 (1), cần trừ 0 ngày
    // Nếu hôm nay là thứ 3 (2), cần trừ 1 ngày, v.v.
    const today = new Date()
    today.setFullYear(selectedYear)
    const dayOfWeek = today.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - daysToSubtract + weekOffset * 7)
    startDate.setFullYear(selectedYear)
    setWeekStartDate(startDate)
  }

  // Cập nhật ngày bắt đầu của tuần khi currentWeek thay đổi
  useEffect(() => {
    calculateWeekStartDate(currentWeek)
  }, [currentWeek, selectedYear])

  // Lưu dữ liệu vào localStorage khi coursesData thay đổi
  useEffect(() => {
    if (coursesData.length > 0) {
      // Lưu dữ liệu vào localStorage
      localStorage.setItem("timetableCourses", JSON.stringify(coursesData))
    }
  }, [coursesData])

  // Hiển thị thông tin chi tiết khi nhấp vào môn học
  const handleCourseClick = (course) => {
    // Lưu môn học được chọn vào state
    setSelectedCourse(course)
    // Mở dialog hiển thị chi tiết
    setIsDialogOpen(true)
  }

  // Lọc các môn học theo ngày

  // Đóng dialog khi nhấn ESC
  useEffect(() => {
    // Hàm xử lý sự kiện khi nhấn phím
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // Nếu nhấn ESC, đóng dialog chi tiết môn học
        setIsDialogOpen(false)
      }
    }

    // Thêm event listener để theo dõi sự kiện nhấn phím
    window.addEventListener("keydown", handleKeyDown)

    // Cleanup function để loại bỏ event listener khi component unmount hoặc dependencies thay đổi
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Xử lý di chuyển ngày trước đó
  const handlePreviousDay = () => {
    setCurrentDay((prev) => (prev === 0 ? 6 : prev - 1))
  }

  // Xử lý di chuyển ngày tiếp theo
  const handleNextDay = () => {
    setCurrentDay((prev) => (prev === 6 ? 0 : prev + 1))
  }

  // Xử lý di chuyển tuần trước đó
  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => prev - 1)
  }

  // Xử lý di chuyển tuần tiếp theo
  const handleNextWeek = () => {
    setCurrentWeek((prev) => prev + 1)
  }

  // Hàm định dạng ngày thành chuỗi dd/mm/yyyy
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Hàm lấy ngày cụ thể cho mỗi ngày trong tuần
  const getDateForDay = (dayIndex) => {
    const date = new Date(weekStartDate)
    date.setDate(weekStartDate.getDate() + dayIndex)
    return date
  }

  const conflicts = useMemo(() => {
    const list = [];
    for (let i = 0; i < coursesData.length; i++) {
      for (let j = i + 1; j < coursesData.length; j++) {
        const a = coursesData[i];
        const b = coursesData[j];
        if (a.day !== b.day) continue;
        // kiểm tra overlap về tiết
        const timeOverlap = a.startPeriod <= b.endPeriod && b.startPeriod <= a.endPeriod;
        // kiểm tra overlap về ngày
        const dateOverlap = a.ngaybd <= b.ngaykt && b.ngaybd <= a.ngaykt;

        if (timeOverlap && dateOverlap) {
          list.push({ a, b });
        }
      }
    }
    return list;
  }, [coursesData]);

  // Hàm lấy chuỗi hiển thị cho ngày trong tuần

  return (
    <div className="app-container">
      {/* Main content chứa thời khóa biểu */}
      <div className="main-content">
        {/* Header chứa tiêu đề và tabs */}
        <div className="header">
          {/* Tiêu đề thời khóa biểu */}
          <h1 className="title">Thời Khóa Biểu</h1>

          {/* Container cho tabs */}
          <div className="tabs-container">
            {/* Tabs list */}
            <div className="tabs-list">
              {/* Tab xem theo ngày */}
              <button
                className={`tab-trigger ${activeTab === "day" ? "active" : ""}`}
                onClick={() => setActiveTab("day")}
              >
                Theo Ngày
              </button>
              {/* Tab xem theo tuần */}
              <button
                className={`tab-trigger ${activeTab === "week" ? "active" : ""}`}
                onClick={() => setActiveTab("week")}
              >
                Theo Tuần
              </button>
            </div>
          </div>
        </div>
        <span className="year-label">Năm:</span>
        <select
          value={selectedYear}
          onChange={e => {
            const y = parseInt(e.target.value, 10);
            setSelectedYear(y);

            // nếu bạn muốn reset tuần/tháng/ngày khi đổi năm, 
            // có thể tính lại weekStartDate, currentWeek, currentDay...
            const newDate = new Date(weekStartDate);
            newDate.setFullYear(y);
            setWeekStartDate(newDate);
          }}
          className="year-select"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}

        </select>
        {/* Tabs content */}
        <div className="tabs">
          {/* Xem theo ngày */}
          <div className={`tab-content ${activeTab === "day" ? "active" : ""}`}>
            {/* Các nút chọn ngày */}
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

            {/* Nút điều hướng ngày */}
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

              {/* Danh sách môn học */}
              <div className="course-list">
                {getCoursesByDay(currentDay).length > 0 ? (
                  getCoursesByDay(currentDay).map((course) => (
                    <div key={course.id} className="course-card blue" onClick={() => handleCourseClick(course)}>
                      <div className="course-name">{course.name}</div>

                      <div className="course-info">
                        <MapPin className="course-icon" />
                        {course.room} - Khu {course.khu}
                      </div>

                      <div className="course-info">
                        <Clock className="course-icon" />
                        Tiết {course.startPeriod}-{course.endPeriod} ({course.startTime} - {course.endTime})
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-message">Không có môn học nào vào ngày này</div>
                )}
              </div>
            </div>
          </div>

          {/* Xem theo tuần */}
          <div className={`tab-content ${activeTab === "week" ? "active" : ""}`}>
            {/* Hiển thị thông tin tuần */}
            <div className="week-info">
              Tuần: {formatDate(weekStartDate)} - {formatDate(getDateForDay(6))}
            </div>

            {/* Nút điều hướng tuần */}
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
                  {/* Header */}
                  <div className="header-cell"></div>
                  {weekdays.map((day, index) => (
                    <div key={index} className="header-cell">
                      {day}
                      <div className="header-date">{formatDate(getDateForDay(index))}</div>
                    </div>
                  ))}

                  {/* Tiết học */}
                  {periods.map((period, periodIndex) => (
                    <React.Fragment key={`period-${periodIndex}`}>
                      <div className="time-cell">
                        Tiết {period.period}
                        <br />
                        <small>{period.time}</small>
                      </div>

                      {weekdays.map((_, dayIndex) => {
                        const dateOfThisCell = getDateForDay(dayIndex);
                        const coursesAtPeriod = coursesData.filter(course =>
                          course.day === dayIndex &&
                          dateOfThisCell >= course.ngaybd &&
                          dateOfThisCell <= course.ngaykt &&
                          (
                            course.startPeriod === period.period ||
                            (course.startPeriod < period.period && course.endPeriod >= period.period)
                          )
                        );
                        return (
                          <div key={`slot-${dayIndex}-${periodIndex}`} className="slot-cell">
                            {coursesAtPeriod.map((course) => {
                              // Chỉ hiển thị ở ô bắt đầu
                              if (course.startPeriod === period.period) {
                                // Tính số ô chiếm dụng
                                const rowSpan = course.endPeriod - course.startPeriod + 1

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
                                      <span><b>Nhóm: </b>{course.tennhom}</span><br />
                                      <span><b>Phòng:</b> {course.room} - Khu {course.khu}</span><br />

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
                      <b>{a.name} (Nhóm {a.tennhom})</b> xung đột với <b>{b.name} (Nhóm {b.tennhom})</b> —
                      Tiết {Math.max(a.startPeriod, b.startPeriod)}–{Math.min(a.endPeriod, b.endPeriod)},{" "}
                      {weekdays[a.day]}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>

        {/* Dialog hiển thị thông tin chi tiết môn học */}
        {isDialogOpen && selectedCourse && (
          <div className="dialog-overlay" onClick={() => setIsDialogOpen(false)}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <div className="dialog-title">{selectedCourse.name}  ({selectedCourse.code})</div>
              </div>

              <div className="dialog-body">
                {/* Thông tin mã môn học */}
                <div className="info-item">
                  <div className="icon-container blue">
                    <Calendar />
                  </div>
                  <div>
                    <div className="info-label">Tên nhóm</div>
                    <div className="info-value">{selectedCourse.tennhom}</div>
                  </div>
                </div>

                {/* Thông tin phòng học */}
                <div className="info-item">
                  <div className="icon-container blue">
                    <MapPin />
                  </div>
                  <div>
                    <div className="info-label">Phòng học</div>
                    <div className="info-value">{selectedCourse.room} – Khu {selectedCourse.khu} </div>
                  </div>
                </div>

                {/* Thông tin thời gian */}
                <div className="info-item">
                  <div className="icon-container blue">
                    <Clock />
                  </div>
                  <div>
                    <div className="info-label">Thời gian</div>
                    <div className="info-value">
                      {weekdays[selectedCourse.day]}, Tiết {selectedCourse.startPeriod}-{selectedCourse.endPeriod} (
                      {selectedCourse.startTime} - {selectedCourse.endTime})
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút đóng dialog */}
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
