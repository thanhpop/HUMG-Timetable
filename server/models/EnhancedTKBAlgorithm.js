const db = require('../config/db');

class EnhancedTKBAlgorithm {
    constructor() {
        this.tietHoc = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13'];
        this.ngayHoc = [2, 3, 4, 5, 6, 7];
        this.maxTietPerDay = 4;
        this.minBreakBetweenZones = 2;
        this.weekCount = 15;
    }
    // Pattern based scheduling 
    getSchedulePattern(sotinchi) {
        switch (sotinchi) {
            case 4: return [{ sessions: [{ tietCount: 2 }, { tietCount: 2 }], description: "4 tín: 2 buổi/tuần, 2 tiết/buổi" }];
            case 3: return [{ sessions: [{ tietCount: 3 }], description: "3 tín: 1 buổi/tuần, 3 tiết" }];
            case 2: return [{ sessions: [{ tietCount: 2 }, { tietCount: 2 }], description: "2 tín: 2 buổi/tuần, 2 tiết/buổi" }];
            case 1: return [{ sessions: [{ tietCount: 2 }], description: "1 tín: 1 buổi/tuần, 2 tiết" }];
            default: return [{ sessions: [{ tietCount: 3 }], description: "Mặc định: 1 buổi/tuần, 3 tiết" }];
        }
    }
    /**tạo TKB và tự động đăng ký sinh viên
     */
    async generateTKBForSemester(mahk) {
        try {
            // 1) Tạo thời khóa biểu
            const result = await this.generateTKB(mahk);

            // 2) Tự động đăng ký sinh viên 
            await this.autoRegisterStudents(mahk);

            return result;
        } catch (err) {
            console.error('Lỗi khi tạo TKB và đăng ký sinh viên:', err);
            throw err;
        }
    }
    async generateTKB(mahk) {
        // 1) load học kỳ
        const [hkRows] = await db.query(`SELECT * FROM hocky WHERE mahk = ?`, [mahk]);
        if (!hkRows.length) throw new Error(`Không tìm thấy học kỳ ${mahk}`);
        const hocky = hkRows[0];
        // 2) load dữ liệu
        const [monhocs] = await db.query('SELECT * FROM monhoc');
        const [phonghocs] = await db.query('SELECT * FROM phonghoc');
        const [giangviens] = await db.query('SELECT * FROM giangvien');
        const [sinhviens] = await db.query('SELECT * FROM sinhvien');
        const [allNhomMhs] = await db.query('SELECT * FROM nhommh');
        const nhommhs = allNhomMhs.filter(n => n.mahk === mahk);
        const [dangkys] = await db.query(`
            SELECT d.*, l.manhom 
            FROM dangky d 
            JOIN lichhoc l ON d.lichhoc_id = l.id
        `);

        const monHocGroups = this.processMonHocGroups(monhocs, nhommhs, dangkys)
            .filter(mh => mh.nhom.length > 0);

        // Giải thuật heuristic 
        const monHocsFiltered = monHocGroups;
        monHocsFiltered.sort((a, b) => {
            const priorityA = this.calculatePriority(a);
            const priorityB = this.calculatePriority(b);
            const diffPriority = priorityB - priorityA;
            return diffPriority ||
                (this.countPossibleRooms(a, phonghocs) - this.countPossibleRooms(b, phonghocs));
        });

        const tkb = [], conflicts = [];
        const gvBusyMap = new Map();
        const phongBusyMap = new Map();
        const svBusyMap = new Map();

        const units = monHocsFiltered.flatMap(mh =>
            mh.nhom.map(g => ({
                manhom: g.manhom,
                mamh: mh.mamh,
                tenmh: mh.tenmh,
                sotinchi: mh.sotinchi,
                totalSvCount: mh.totalSvCount,
                mgv: g.mgv
            }))
        );

        const creditGroups = this.groupByCreditType(units);
        for (const creditType of [4, 3, 2, 1]) {
            const group = creditGroups[creditType];
            if (!group) continue;
            for (const monHoc of group) {
                const scheduled = await this.scheduleMonHoc(
                    monHoc,
                    phonghocs,
                    giangviens,
                    tkb,
                    gvBusyMap,
                    phongBusyMap,
                    nhommhs,
                    hocky
                );
                if (!scheduled) {
                    const nhomObj = nhommhs.find(n => n.manhom === monHoc.manhom);
                    conflicts.push({
                        mamh: monHoc.mamh,
                        tenNhom: nhomObj ? nhomObj.tennhom : '',
                        tenmh: monHoc.tenmh,
                        lyDo: 'Không thể xếp lịch do xung đột'
                    });
                }
            }
        }
        await this.saveTKBToDatabase(tkb, hocky.mahk);
        return { tkb, conflicts };
    }


    processMonHocGroups(monhocs, nhommhs, dangkys) {
        return monhocs.map(monHoc => {
            const nhom = nhommhs.filter(n => n.mamh === monHoc.mamh);
            const totalSvCount = nhom
                .reduce((sum, g) => sum + dangkys.filter(d => d.manhom === g.manhom).length, 0);

            return {
                ...monHoc,
                nhom: nhom.map(g => ({
                    ...g,
                    svCount: dangkys.filter(d => d.manhom === g.manhom).length
                })),
                totalSvCount
            };
        });
    }

    groupByCreditType(monhocs) {
        return monhocs.reduce((groups, monHoc) => {
            const credit = monHoc.sotinchi || 3;
            if (!groups[credit]) groups[credit] = [];
            groups[credit].push(monHoc);
            return groups;
        }, {});
    }
    // thuật toán tham lam
    // Backtracking
    async scheduleMonHoc(monHoc, phonghocs, giangviens, tkb,
        gvBusyMap, phongBusyMap,
        nhommhs, hocky) {
        const { manhom, sotinchi, totalSvCount, mgv } = monHoc;
        const nhomMonHoc = nhommhs.find(n => n.manhom === manhom);
        if (!nhomMonHoc) return false;

        const giangVien = giangviens.find(gv => gv.mgv === mgv);
        if (!giangVien) return false;

        const schedulePattern = this.getSchedulePattern(sotinchi || 3);
        const suitableRooms = phonghocs
            .filter(ph => ph.succhua >= totalSvCount)
            .sort((a, b) => a.succhua - b.succhua);

        for (const pattern of schedulePattern) {
            for (const phong of suitableRooms) {
                const scheduledDays = new Set();
                const tempEntries = [];

                for (const session of pattern.sessions) {
                    const scheduled = this.tryScheduleSession(
                        monHoc, giangVien, phong,
                        gvBusyMap, phongBusyMap,
                        session.tietCount, scheduledDays,
                        hocky
                    );
                    if (!scheduled) {
                        break;
                    }
                    tempEntries.push(scheduled);
                    scheduledDays.add(scheduled.thu);
                }

                if (scheduledDays.size === pattern.sessions.length) {
                    for (const e of tempEntries) {
                        tkb.push(e);
                    }
                    return true;
                }
            }
        }

        return false;
    }

    isGvOverloaded(mgv, ngay, gvBusyMap) {
        const gvKey = `${mgv}-${ngay}`;
        const gvSchedule = gvBusyMap.get(gvKey) || { tiet: [] };
        return gvSchedule.tiet.length >= this.maxTietPerDay;
    }

    tryScheduleSession(monHoc, giangVien, phongHoc,
        gvBusyMap, phongBusyMap,
        tietCount, scheduledDays, hocky) {

        const fmt = d => new Date(d).toISOString().slice(0, 10);

        const availableDays = this.ngayHoc.filter(thu =>
            !scheduledDays.has(thu) &&
            !this.isGvOverloaded(giangVien.mgv, thu, gvBusyMap)
        );

        for (const thu of availableDays) {
            const consecutiveSlots = this.findConsecutiveSlotsWithZones(
                thu,
                tietCount,
                phongHoc.maphong,
                giangVien.mgv,
                gvBusyMap,
                phongBusyMap
            );

            if (consecutiveSlots.length >= tietCount) {
                const slotStart = consecutiveSlots[0];
                const slotEnd = consecutiveSlots[tietCount - 1];
                const tietBatDau = this.tietHoc.indexOf(slotStart) + 1;
                const tietKetThuc = this.tietHoc.indexOf(slotEnd) + 1;
                if (!(
                    (tietBatDau >= 1 && tietKetThuc <= 5) ||
                    (tietBatDau >= 6 && tietKetThuc <= 13)
                )) {
                    continue;
                }

                const ngaybd = new Date(hocky.ngaybd);
                const durationWeeks = monHoc.sotinchi <= 2 ? 8 : this.weekCount;
                const ngaykt = new Date(ngaybd);
                ngaykt.setDate(ngaybd.getDate() + (durationWeeks * 7) - 1);

                this.updateBusyMaps(
                    thu,
                    slotStart,
                    slotEnd,
                    giangVien.mgv,
                    phongHoc.maphong,
                    phongHoc.khu,
                    gvBusyMap,
                    phongBusyMap
                );

                return {
                    manhom: monHoc.manhom,
                    maphong: phongHoc.maphong,
                    thu,
                    tietbd: tietBatDau,
                    tietkt: tietKetThuc,
                    ngaybd: fmt(ngaybd),
                    ngaykt: fmt(ngaykt)
                };
            }
        }

        return null;
    }

    findConsecutiveSlotsWithZones(ngay, soTiet, maphong, mgv, gvBusyMap, phongBusyMap) {
        const gvKey = `${mgv}-${ngay}`;
        const gvSchedule = gvBusyMap.get(gvKey) || { tiet: [], khu: [] };

        const availableSlots = this.tietHoc.filter(tiet => {
            const phongKey = `${maphong}-${ngay}-${tiet}`;
            return !phongBusyMap.has(phongKey) &&
                !gvSchedule.tiet.includes(tiet);
        });

        let bestSlots = [], currentSlots = [];
        for (const tiet of availableSlots) {
            if (currentSlots.length === 0 || this.isNextSlot(currentSlots[currentSlots.length - 1], tiet)) {
                if (!this.hasGvZoneConflict(ngay, tiet, mgv, gvSchedule)) {
                    currentSlots.push(tiet);
                    if (currentSlots.length === soTiet) {
                        bestSlots = currentSlots.slice();
                        break;
                    }
                } else {
                    currentSlots = [];
                }
            } else {
                if (!this.hasGvZoneConflict(ngay, tiet, mgv, gvSchedule)) {
                    currentSlots = [tiet];
                } else {
                    currentSlots = [];
                }
            }
        }
        return bestSlots;
    }
    isNextSlot(prevTiet, currentTiet) {
        const prevIndex = this.tietHoc.indexOf(prevTiet);
        const currentIndex = this.tietHoc.indexOf(currentTiet);
        return currentIndex === prevIndex + 1;
    }
    hasGvZoneConflict(ngay, tiet, mgv, gvSchedule) {
        const tietIndex = this.tietHoc.indexOf(tiet);
        for (let i = 1; i <= this.minBreakBetweenZones; i++) {
            if (tietIndex - i >= 0) {
                const prevTiet = this.tietHoc[tietIndex - i];
                if (gvSchedule.tiet.includes(prevTiet)) return true;
            }
            if (tietIndex + i < this.tietHoc.length) {
                const nextTiet = this.tietHoc[tietIndex + i];
                if (gvSchedule.tiet.includes(nextTiet)) return true;
            }
        }
        return false;
    }

    updateBusyMaps(
        ngay, tietBatDau, tietKetThuc,
        mgv, maphong, khu,
        gvBusyMap, phongBusyMap
    ) {
        const gvKey = `${mgv}-${ngay}`;
        if (!gvBusyMap.has(gvKey)) {
            gvBusyMap.set(gvKey, { tiet: [], khu: [] });
        }
        const gvSchedule = gvBusyMap.get(gvKey);

        const startIdx = this.tietHoc.indexOf(tietBatDau);
        const endIdx = this.tietHoc.indexOf(tietKetThuc);

        for (let i = startIdx; i <= endIdx; i++) {
            const tiet = this.tietHoc[i];
            gvSchedule.tiet.push(tiet);
            gvSchedule.khu.push(khu);

            const phongKey = `${maphong}-${ngay}-${tiet}`;
            phongBusyMap.set(phongKey, true);
        }
    }

    calculatePriority(monHoc) {
        return monHoc.sotinchi * 10 + monHoc.totalSvCount;
    }

    countPossibleRooms(monHoc, phonghocs) {
        return phonghocs.filter(ph =>
            ph.succhua >= monHoc.totalSvCount
        ).length;
    }

    isGeneralSubject(khoa) {
        const generalDepartments = [
            'Khoa học cơ bản',
            'Lý luận chính trị',
            'Giáo dục thể chất',
            'Ngoại ngữ'
        ];
        const khoaLower = khoa ? khoa.toLowerCase() : '';
        const isGeneralByDepartment = generalDepartments.some(dept =>
            khoaLower.includes(dept.toLowerCase())
        );
        return isGeneralByDepartment;
    }
    async autoRegisterStudents(mahk) {
        try {
            console.log(`Bắt đầu tự động đăng ký sinh viên cho học kỳ ${mahk}...`);
            // 1) Lấy tất cả lịch học trong học kỳ NHÓM THEO MANHOM
            const [lichHocs] = await db.query(`
            SELECT l.*, n.mahk, n.mamh, n.tennhom, m.khoa, m.tenmh, m.sotinchi, p.khu, p.succhua
            FROM lichhoc l
            JOIN nhommh n ON l.manhom = n.manhom
            JOIN monhoc m ON n.mamh = m.mamh
            JOIN phonghoc p ON l.maphong = p.maphong
            WHERE n.mahk = ?
            ORDER BY l.manhom, l.id
        `, [mahk]);

            // 2) Nhóm các buổi học theo manhom (một môn có thể có nhiều buổi)
            const nhomLichHoc = new Map();
            for (const lichHoc of lichHocs) {
                if (!nhomLichHoc.has(lichHoc.manhom)) {
                    nhomLichHoc.set(lichHoc.manhom, []);
                }
                nhomLichHoc.get(lichHoc.manhom).push(lichHoc);
            }

            // 3) Lấy tất cả sinh viên
            const [allStudents] = await db.query('SELECT * FROM sinhvien');
            const [existingSchedules] = await db.query(`
            SELECT d.msv, l.thu, l.tietbd, l.tietkt, p.khu, n.mamh
            FROM dangky d
            JOIN lichhoc l ON d.lichhoc_id = l.id  
            JOIN phonghoc p ON l.maphong = p.maphong
            JOIN nhommh n ON l.manhom = n.manhom
            WHERE n.mahk = ?
        `, [mahk]);
            // 4) Theo dõi trạng thái đăng ký của sinh viên
            const studentRegisteredSubjects = new Map(); // msv -> Set(mamh)
            const studentCredits = new Map(); // msv -> tổng tín chỉ đã đăng ký
            const studentScheduleMap = new Map();
            const registrationData = [];
            let totalRegistrations = 0;

            for (const schedule of existingSchedules) {
                const svKey = `${schedule.msv}-${schedule.thu}`;
                if (!studentScheduleMap.has(svKey)) {
                    studentScheduleMap.set(svKey, { tiet: [], khu: [] });
                }
                const svSchedule = studentScheduleMap.get(svKey);
                for (let i = schedule.tietbd; i <= schedule.tietkt; i++) {
                    svSchedule.tiet.push(this.tietHoc[i - 1]);
                    svSchedule.khu.push(schedule.khu);
                }

                // Cập nhật môn đã đăng ký
                if (!studentRegisteredSubjects.has(schedule.msv)) {
                    studentRegisteredSubjects.set(schedule.msv, new Set());
                }
                studentRegisteredSubjects.get(schedule.msv).add(schedule.mamh);
            }
            // 5) Duyệt qua từng nhóm môn học 
            for (const [manhom, danhSachBuoiHoc] of nhomLichHoc) {
                const firstBuoiHoc = danhSachBuoiHoc[0];

                const roomCapacity = firstBuoiHoc.succhua;

                if (!roomCapacity) {
                    console.log(`Cảnh báo: Không tìm thấy thông tin phòng cho nhóm ${manhom}`);
                    continue;
                }

                const [currentRegistrations] = await db.query(`
                SELECT COUNT(DISTINCT msv) as current_count 
                FROM dangky d 
                JOIN lichhoc l ON d.lichhoc_id = l.id
                WHERE l.manhom = ?
            `, [manhom]);

                const currentCount = currentRegistrations[0].current_count;
                const availableSlots = roomCapacity - currentCount;

                if (availableSlots <= 0) {
                    console.log(`${firstBuoiHoc.tenmh} (${firstBuoiHoc.tennhom}): Đã đầy (${currentCount}/${roomCapacity})`);
                    continue;
                }

                // Kiểm tra loại môn học
                const isGeneralSubject = this.isGeneralSubject(firstBuoiHoc.khoa);

                // Lọc sinh viên phù hợp
                const eligibleStudents = allStudents.filter(sv => {
                    // Kiểm tra xem sinh viên đã đăng ký môn này chưa
                    const registeredSubjects = studentRegisteredSubjects.get(sv.msv) || new Set();
                    if (registeredSubjects.has(firstBuoiHoc.mamh)) {
                        return false; // Đã đăng ký môn này rồi
                    }

                    // Kiểm tra giới hạn tín chỉ (15 tín chỉ tối đa)
                    const currentCredits = studentCredits.get(sv.msv) || 0;
                    if (currentCredits + firstBuoiHoc.sotinchi > 15) {
                        return false; // Vượt quá giới hạn tín chỉ
                    }

                    // Kiểm tra điều kiện khoa
                    if (isGeneralSubject) {
                        return true; // Môn chung: tất cả khoa đều được đăng ký
                    } else {
                        return sv.khoa === firstBuoiHoc.khoa; // Môn chuyên ngành: chỉ sinh viên cùng khoa
                    }
                });


                this.shuffleArray(eligibleStudents);

                // Kiểm tra xung đột lịch và đăng ký
                const studentsToRegister = [];

                for (const sv of eligibleStudents) {
                    if (studentsToRegister.length >= availableSlots) break;

                    // Kiểm tra xung đột lịch học 
                    let hasAnyConflict = false;
                    for (const buoiHoc of danhSachBuoiHoc) {
                        // Kiểm tra xung đột database
                        const hasDbConflict = await this.checkScheduleConflict(sv.msv, buoiHoc);
                        if (hasDbConflict) {
                            hasAnyConflict = true;
                            break;
                        }

                        // Kiểm tra xung đột trong memory (các đăng ký trong session này)
                        const hasMemoryConflict = this.checkMemoryScheduleConflict(sv.msv, buoiHoc, studentScheduleMap);
                        if (hasMemoryConflict) {
                            hasAnyConflict = true;
                            break;
                        }

                        // Kiểm tra xung đột khu
                        const hasZoneConflict = await this.checkStudentZoneConflicts(sv.msv, buoiHoc, studentScheduleMap, this.minBreakBetweenZones);
                        if (hasZoneConflict) {
                            hasAnyConflict = true;
                            break;
                        }
                        const hasMaxTietConflict = this.checkMaxTietPerDay(sv.msv, buoiHoc, studentScheduleMap);
                        if (hasMaxTietConflict) {
                            hasAnyConflict = true;
                            break;
                        }
                    }

                    if (hasAnyConflict) continue;

                    studentsToRegister.push(sv);

                    for (const buoiHoc of danhSachBuoiHoc) {
                        registrationData.push([sv.msv, buoiHoc.id, manhom]);

                        const svKey = `${sv.msv}-${buoiHoc.thu}`;
                        if (!studentScheduleMap.has(svKey)) {
                            studentScheduleMap.set(svKey, { tiet: [], khu: [] });
                        }
                        const svSchedule = studentScheduleMap.get(svKey);
                        for (let i = buoiHoc.tietbd; i <= buoiHoc.tietkt; i++) {
                            svSchedule.tiet.push(this.tietHoc[i - 1]);
                            svSchedule.khu.push(buoiHoc.khu);
                        }
                    }
                    if (!studentRegisteredSubjects.has(sv.msv)) {
                        studentRegisteredSubjects.set(sv.msv, new Set());
                    }
                    studentRegisteredSubjects.get(sv.msv).add(firstBuoiHoc.mamh);

                    // Cập nhật tín chỉ
                    const currentCredits = studentCredits.get(sv.msv) || 0;
                    studentCredits.set(sv.msv, currentCredits + firstBuoiHoc.sotinchi);
                }

                totalRegistrations += studentsToRegister.length * danhSachBuoiHoc.length;
            }

            // 6) Thực hiện đăng ký
            if (registrationData.length > 0) {
                await db.query(`
                INSERT IGNORE INTO dangky (msv, lichhoc_id, manhom) 
                VALUES ?
            `, [registrationData]);

                console.log(`Đã đăng ký thành công ${registrationData.length} lượt sinh viên.`);
            }

            // 7) Thống kê kết quả CHÍNH XÁC
            const [stats] = await db.query(`
            SELECT 
                n.tennhom,
                m.tenmh,
                m.khoa,
                m.sotinchi,
                COUNT(DISTINCT d.msv) as so_sv_dangky,
                p.succhua as suc_chua_phong
            FROM nhommh n
            LEFT JOIN lichhoc l ON n.manhom = l.manhom
            LEFT JOIN dangky d ON l.id = d.lichhoc_id
            LEFT JOIN phonghoc p ON l.maphong = p.maphong
            LEFT JOIN monhoc m ON n.mamh = m.mamh
            WHERE n.mahk = ?
            GROUP BY n.manhom, n.tennhom, m.tenmh, m.khoa, m.sotinchi, p.succhua
            ORDER BY n.tennhom
        `, [mahk]);

            console.log('\n=== THỐNG KÊ ĐĂNG KÝ ===');
            let overCapacityCount = 0;

            stats.forEach(stat => {
                const fillRate = ((stat.so_sv_dangky / stat.suc_chua_phong) * 100).toFixed(1);
                const status = stat.so_sv_dangky > stat.suc_chua_phong ? ' VƯỢT SỨC CHỨA' : '';
                const subjectType = this.isGeneralSubject(stat.khoa) ? ' (CHUNG)' : ' (CHUYÊN NGÀNH)';

                if (stat.so_sv_dangky > stat.suc_chua_phong) {
                    overCapacityCount++;
                }

                console.log(`${stat.tenmh}${subjectType} - ${stat.tennhom}: ${stat.so_sv_dangky}/${stat.suc_chua_phong} SV (${fillRate}%) - ${stat.sotinchi} TC`);
            });

            console.log('\n=== THỐNG KÊ TÍN CHỈ SINH VIÊN ===');
            const creditStats = Array.from(studentCredits.entries())
                .sort((a, b) => b[1] - a[1]);

            const creditDistribution = {};
            creditStats.forEach(([msv, credits]) => {
                if (!creditDistribution[credits]) {
                    creditDistribution[credits] = 0;
                }
                creditDistribution[credits]++;
            });

            Object.keys(creditDistribution)
                .sort((a, b) => parseInt(b) - parseInt(a))
                .forEach(credits => {
                    console.log(`${credits} tín chỉ: ${creditDistribution[credits]} sinh viên`);
                });

            console.log(`\nTổng cộng: ${totalRegistrations} lượt đăng ký`);
            console.log(`Số nhóm vượt sức chứa: ${overCapacityCount}`);
            console.log(`Sinh viên có đăng ký: ${studentCredits.size}/${allStudents.length}`);

            return {
                registeredCount: registrationData.length,
                stats: stats,
                overCapacityCount: overCapacityCount,
                creditDistribution: creditDistribution,
                studentsWithRegistration: studentCredits.size
            };

        } catch (error) {
            console.error('Lỗi khi đăng ký tự động sinh viên:', error);
            throw error;
        }
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    /**
     * Kiểm tra xung đột lịch học của sinh viên
     */
    async checkScheduleConflict(msv, newLichHoc) {
        try {
            const [conflicts] = await db.query(`
            SELECT COUNT(*) as conflict_count
            FROM dangky d
            JOIN lichhoc l ON d.lichhoc_id = l.id
            WHERE d.msv = ?
            AND l.thu = ?
            AND l.tietkt >= ?
            AND l.tietbd <= ?
            AND l.ngaybd <= ?
            AND l.ngaykt >= ?
        `, [
                msv,
                newLichHoc.thu,
                newLichHoc.tietkt,
                newLichHoc.tietbd,
                newLichHoc.ngaykt,
                newLichHoc.ngaybd
            ]);

            return conflicts[0].conflict_count > 0;
        } catch (error) {
            console.error('Lỗi khi kiểm tra xung đột lịch:', error);
            return true; // An toàn: coi như có xung đột
        }
    }
    async checkStudentZoneConflicts(sv, newLichHoc, svBusyMap, minBreakBetweenZones) {
        const ngay = newLichHoc.thu;
        const svKey = `${sv}-${ngay}`;
        const svSchedule = svBusyMap.get(svKey) || { tiet: [], khu: [] };

        const tietSlots = [];
        for (let i = newLichHoc.tietbd; i <= newLichHoc.tietkt; i++) {
            tietSlots.push(this.tietHoc[i - 1]);
        }


        for (const tiet of tietSlots) {
            const tietIndex = this.tietHoc.indexOf(tiet);
            for (let i = 1; i <= minBreakBetweenZones; i++) {
                if (tietIndex - i >= 0) {
                    const prevTiet = this.tietHoc[tietIndex - i];
                    const prevIndex = svSchedule.tiet.indexOf(prevTiet);
                    if (prevIndex !== -1 && svSchedule.khu[prevIndex] !== newLichHoc.khu) {
                        return true;
                    }
                }
                if (tietIndex + i < this.tietHoc.length) {
                    const nextTiet = this.tietHoc[tietIndex + i];
                    const nextIndex = svSchedule.tiet.indexOf(nextTiet);
                    if (nextIndex !== -1 && svSchedule.khu[nextIndex] !== newLichHoc.khu) {
                        return true;
                    }
                }
            }
        }

        const allTiets = [...svSchedule.tiet, ...tietSlots].sort();
        const allKhus = [...svSchedule.khu, ...Array(tietSlots.length).fill(newLichHoc.khu)];

        for (let i = 0; i < allTiets.length - 1; i++) {
            const currentTietIndex = this.tietHoc.indexOf(allTiets[i]);
            const nextTietIndex = this.tietHoc.indexOf(allTiets[i + 1]);
            if (nextTietIndex === currentTietIndex + 1 && allKhus[i] !== allKhus[i + 1]) {
                return true;
            }
        }

        return false;
    }
    checkMemoryScheduleConflict(msv, newLichHoc, studentScheduleMap) {
        const svKey = `${msv}-${newLichHoc.thu}`;
        const svSchedule = studentScheduleMap.get(svKey);

        if (!svSchedule) return false;

        // Kiểm tra xung đột tiết học
        for (let i = newLichHoc.tietbd; i <= newLichHoc.tietkt; i++) {
            const tiet = this.tietHoc[i - 1];
            if (svSchedule.tiet.includes(tiet)) {
                return true; // Có xung đột
            }
        }

        return false;
    }
    checkMaxTietPerDay(msv, newLichHoc, studentScheduleMap) {
        const svKey = `${msv}-${newLichHoc.thu}`;
        const svSchedule = studentScheduleMap.get(svKey) || { tiet: [] };

        // Tính số tiết hiện tại trong ngày
        const currentTietCount = svSchedule.tiet.length;

        // Tính số tiết của buổi học mới
        const newTietCount = newLichHoc.tietkt - newLichHoc.tietbd + 1;

        // Kiểm tra xem có vượt quá maxTietPerDay không
        if (currentTietCount + newTietCount > this.maxTietPerDay) {
            return true; // Vượt quá
        }

        return false; // Không vượt quá
    }

    async saveTKBToDatabase(tkb, mahk) {
        const fmt = date => new Date(date).toISOString().split('T')[0];

        if (tkb.length === 0) return;

        const lichhocValues = tkb.map(entry => [
            entry.manhom,
            entry.maphong,
            entry.thu,
            entry.tietbd,
            entry.tietkt,
            fmt(entry.ngaybd),
            fmt(entry.ngaykt)
        ]);

        await db.query(
            `INSERT INTO lichhoc 
       (manhom, maphong, thu, tietbd, tietkt, ngaybd, ngaykt)
     VALUES ?`,
            [lichhocValues]
        );
    }
}

module.exports = new EnhancedTKBAlgorithm();