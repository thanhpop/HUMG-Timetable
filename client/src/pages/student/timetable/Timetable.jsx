"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react"

import "./timetable.css"

// Dữ liệu mẫu cho thời khóa biểu
const initialCoursesData = [
  {
    id: 1,
    name: "Lập trình Web",
    code: "IT001",
    room: "A1.203",
    instructor: "Nguyễn Văn A",
    day: 2, // Thứ 4
    startPeriod: 1,
    endPeriod: 4,
    startTime: "06:45",
    endTime: "10:35",
  },
  {
    id: 2,
    name: "Cơ sở dữ liệu",
    code: "IT002",
    room: "B2.401",
    instructor: "Trần Thị B",
    day: 1, // Thứ 3
    startPeriod: 6,
    endPeriod: 8,
    startTime: "12:30",
    endTime: "15:20",
  },
  {
    id: 3,
    name: "Trí tuệ nhân tạo",
    code: "IT003",
    room: "C3.105",
    instructor: "Lê Văn C",
    day: 2, // Thứ 4
    startPeriod: 3,
    endPeriod: 5,
    startTime: "08:45",
    endTime: "11:35",
  },
  {
    id: 4,
    name: "Mạng máy tính",
    code: "IT004",
    room: "A2.305",
    instructor: "Phạm Thị D",
    day: 3, // Thứ 5
    startPeriod: 1,
    endPeriod: 3,
    startTime: "06:45",
    endTime: "09:35",
  },
  {
    id: 5,
    name: "Lập trình di động",
    code: "IT005",
    room: "B1.203",
    instructor: "Hoàng Văn E",
    day: 4, // Thứ 6
    startPeriod: 6,
    endPeriod: 8,
    startTime: "12:30",
    endTime: "15:20",
  },
  {
    id: 6,
    name: "Phân tích thiết kế hệ thống",
    code: "IT006",
    room: "C2.401",
    instructor: "Ngô Thị F",
    day: 5, // Thứ 7
    startPeriod: 3,
    endPeriod: 5,
    startTime: "08:45",
    endTime: "11:35",
  },
  {
    id: 7,
    name: "An toàn thông tindccc",
    code: "IT007",
    room: "A3.105",
    instructor: "Vũ Văn G",
    day: 6, // Chủ nhật
    startPeriod: 1,
    endPeriod: 3,
    startTime: "06:45",
    endTime: "09:35",
  },
];

// Tên các ngày trong tuần - đã thay đổi thứ tự để Chủ nhật ở cuối
const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"]

// Các tiết học - đã thêm tiết 11-13
const periods = [
  { period: 1, time: "06:45 - 07:35" }, // Tiết 1 và thời gian tương ứng
  { period: 2, time: "07:45 - 08:35" }, // Tiết 2
  { period: 3, time: "08:45 - 09:35" }, // Tiết 3
  { period: 4, time: "09:45 - 10:35" }, // Tiết 4
  { period: 5, time: "10:45 - 11:35" }, // Tiết 5
  { period: 6, time: "12:30 - 13:20" }, // Tiết 6
  { period: 7, time: "13:30 - 14:20" }, // Tiết 7
  { period: 8, time: "14:30 - 15:20" }, // Tiết 8
  { period: 9, time: "15:30 - 16:20" }, // Tiết 9
  { period: 10, time: "16:30 - 17:20" }, // Tiết 10
  { period: 11, time: "17:30 - 18:20" }, // Tiết 11
  { period: 12, time: "18:30 - 19:20" }, // Tiết 12
  { period: 13, time: "19:30 - 20:20" }, // Tiết 13
]

export default function Timetable() {
  // State lưu trữ dữ liệu môn học
  const [coursesData, setCoursesData] = useState([])

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

  // Lấy dữ liệu từ localStorage khi component được mount
  useEffect(() => {
    // Kiểm tra xem có dữ liệu đã lưu trong localStorage không
    const savedCourses = localStorage.getItem("timetableCourses")
    if (savedCourses) {
      // Nếu có, sử dụng dữ liệu đã lưu
      setCoursesData(JSON.parse(savedCourses))
    } else {
      // Nếu không, sử dụng dữ liệu mẫu
      setCoursesData(initialCoursesData)
    }

    // Tính toán ngày bắt đầu của tuần hiện tại (Thứ 2)
    calculateWeekStartDate(0)
  }, [])

  // Tính toán ngày bắt đầu của tuần dựa vào offset tuần
  const calculateWeekStartDate = (weekOffset) => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7

    // Tính số ngày cần trừ để về thứ 2 của tuần hiện tại
    // Nếu hôm nay là Chủ nhật (0), cần trừ 6 ngày để về thứ 2
    // Nếu hôm nay là thứ 2 (1), cần trừ 0 ngày
    // Nếu hôm nay là thứ 3 (2), cần trừ 1 ngày, v.v.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    // Tạo một bản sao của ngày hôm nay
    const startDate = new Date(today)

    // Trừ số ngày để về thứ 2 của tuần hiện tại
    startDate.setDate(today.getDate() - daysToSubtract)

    // Cộng thêm số tuần offset (7 ngày * số tuần)
    startDate.setDate(startDate.getDate() + weekOffset * 7)

    // Cập nhật state
    setWeekStartDate(startDate)
  }

  // Cập nhật ngày bắt đầu của tuần khi currentWeek thay đổi
  useEffect(() => {
    calculateWeekStartDate(currentWeek)
  }, [currentWeek])

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
  const getCoursesByDay = (day) => {
    // Trả về danh sách các môn học có ngày trùng với ngày được chọn
    return coursesData.filter((course) => course.day === day)
  }

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

  // Hàm lấy chuỗi hiển thị cho ngày trong tuần
  const getWeekdayDisplay = (dayIndex) => {
    const date = getDateForDay(dayIndex)
    return `${weekdays[dayIndex]} (${formatDate(date)})`
  }

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
                        <Clock className="course-icon" />
                        Tiết {course.startPeriod}-{course.endPeriod} ({course.startTime} - {course.endTime})
                      </div>
                      <div className="course-info">
                        <MapPin className="course-icon" />
                        {course.room}
                      </div>
                      <div className="course-info">
                        <User className="course-icon" />
                        {course.instructor}
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
                        const coursesAtPeriod = coursesData.filter(
                          (course) =>
                            course.day === dayIndex &&
                            (course.startPeriod === period.period ||
                              (course.startPeriod < period.period && course.endPeriod >= period.period)),
                        )

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
                                      height: `${rowSpan * 32}px`,
                                      // Add z-index to ensure course appears above cell borders
                                      zIndex: 2,
                                    }}
                                    onClick={() => handleCourseClick(course)}
                                  >
                                    <div className="course-item-name">{course.name}</div>
                                    {/* Thêm thông tin giảng viên và phòng học */}
                                    <div className="course-item-details">
                                      <span>{course.instructor}</span> | <span>{course.room}</span>
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
          </div>
        </div>

        {/* Dialog hiển thị thông tin chi tiết môn học */}
        {isDialogOpen && selectedCourse && (
          <div className="dialog-overlay" onClick={() => setIsDialogOpen(false)}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <div className="dialog-title">{selectedCourse.name}</div>
              </div>

              <div className="dialog-body">
                {/* Thông tin mã môn học */}
                <div className="info-item">
                  <div className="icon-container blue">
                    <Calendar />
                  </div>
                  <div>
                    <div className="info-label">Mã môn học</div>
                    <div className="info-value">{selectedCourse.code}</div>
                  </div>
                </div>

                {/* Thông tin phòng học */}
                <div className="info-item">
                  <div className="icon-container blue">
                    <MapPin />
                  </div>
                  <div>
                    <div className="info-label">Phòng học</div>
                    <div className="info-value">{selectedCourse.room}</div>
                  </div>
                </div>

                {/* Thông tin giảng viên */}
                <div className="info-item">
                  <div className="icon-container blue">
                    <User />
                  </div>
                  <div>
                    <div className="info-label">Giảng viên</div>
                    <div className="info-value">{selectedCourse.instructor}</div>
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
