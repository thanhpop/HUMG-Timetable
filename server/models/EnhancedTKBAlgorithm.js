const db = require('../config/db');

class EnhancedTKBAlgorithm {
    constructor() {
        this.tietHoc = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13'];
        // this.ngayHoc = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        this.ngayHoc = [2, 3, 4, 5, 6, 7];
        this.maxTietPerDay = 4;
        this.minBreakBetweenZones = 2;
        this.weekCount = 15;
    }
    //Pattern based scheduling
    getSchedulePattern(sotinchi) {
        switch (sotinchi) {
            case 4: return [{ sessions: [{ tietCount: 2 }, { tietCount: 2 }], description: "4 tín: 2 buổi/tuần, 2 tiết/buổi" }];
            case 3: return [{ sessions: [{ tietCount: 3 }], description: "3 tín: 1 buổi/tuần, 3 tiết" }];
            case 2: return [{ sessions: [{ tietCount: 2 }, { tietCount: 2 }], description: "2 tín: 2 buổi/tuần, 2 tiết/buổi" }];
            case 1: return [{ sessions: [{ tietCount: 2 }], description: "1 tín: 1 buổi/tuần, 2 tiết" }];
            default: return [{ sessions: [{ tietCount: 3 }], description: "Mặc định: 1 buổi/tuần, 3 tiết" }];
        }
    }
    /**
     * public API: chạy thuật toán cho học kỳ được truyền vào
     */
    async generateTKBForSemester(mahk) {


        try {
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

            // 4) xếp lịch
            const tkb = [], conflicts = [];
            const gvBusyMap = new Map();
            const phongBusyMap = new Map();
            const svBusyMap = new Map();

            // flat thành từng unit (1 nhóm môn)
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
                for (const unit of group) {
                    const scheduled = await this.scheduleMonHoc(
                        unit,
                        phonghocs,
                        giangviens,
                        tkb,
                        gvBusyMap,
                        phongBusyMap,
                        svBusyMap,
                        nhommhs,
                        hocky
                    );
                    if (!scheduled) {
                        conflicts.push({
                            mamh: unit.mamh,
                            tenmh: unit.tenmh,
                            lyDo: 'Không thể xếp lịch do xung đột'
                        });
                    }
                }
            }
            await this.saveTKBToDatabase(tkb, hocky.mahk);
            return { tkb, conflicts };
        } catch (err) {
            console.error('Lỗi khi tạo TKB:', err);
            throw err;
        }
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

    async scheduleMonHoc(unit, phonghocs, giangviens, tkb,
        gvBusyMap, phongBusyMap, svBusyMap,
        nhommhs, hocky) {
        const { manhom, sotinchi, totalSvCount, mgv } = unit;
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
                const usedDays = new Set();
                const tempEntries = [];
                let ok = true;

                for (const session of pattern.sessions) {
                    const entry = this.tryScheduleSession(
                        unit, giangVien, phong,
                        gvBusyMap, phongBusyMap,
                        session.tietCount, usedDays,
                        hocky
                    );
                    if (!entry) {
                        ok = false;
                        break;
                    }
                    tempEntries.push(entry);
                    usedDays.add(entry.thu);
                }

                if (ok) {
                    // Chỉ thêm vào tkb khi đã xếp đủ các session
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
    tryScheduleSession(unit, giangVien, phongHoc,
        gvBusyMap, phongBusyMap,
        tietCount, usedDays, hocky) {

        const fmt = d => new Date(d).toISOString().slice(0, 10);

        const availableDays = this.ngayHoc.filter(thu =>
            !usedDays.has(thu) &&
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

                // Tính ngày bắt đầu và kết thúc kéo dài suốt học kỳ
                const ngaybd = new Date(hocky.ngaybd);
                const durationWeeks = unit.sotinchi <= 2 ? 8 : this.weekCount;
                const ngaykt = new Date(ngaybd);
                ngaykt.setDate(ngaybd.getDate() + (durationWeeks - 1) * 7);

                // Đánh dấu busy cho từng tiết trong khối
                this.updateBusyMaps(
                    thu,
                    slotStart,               // tietBatDau (ví dụ 'T3')
                    slotEnd,// tietKetThuc
                    giangVien.mgv,
                    phongHoc.maphong,
                    phongHoc.khu,
                    gvBusyMap,
                    phongBusyMap
                );

                // Trả về entry
                return {
                    manhom: unit.manhom,
                    maphong: phongHoc.maphong,
                    thu,
                    tietbd: tietBatDau,
                    tietkt: tietKetThuc,
                    ngaybd: fmt(ngaybd),
                    ngaykt: fmt(ngaykt)
                };
            }
        }

        // không tìm được
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
            if (this.hasGvZoneConflict(ngay, tiet, mgv, gvSchedule)) {
                currentSlots = [];
                continue;
            }
            currentSlots.push(tiet);
            if (currentSlots.length >= soTiet) {
                bestSlots = currentSlots.slice(0, soTiet);
                break;
            }
        }
        return bestSlots;
    }
    /**
     * Kiểm tra giữa 2 tiết liền nhau của GV phải có tối thiểu minBreakBetweenZones tiết nghỉ
     */
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
        gvBusyMap, phongBusyMap /*, svBusyMap, nhomMonHoc */
    ) {
        const gvKey = `${mgv}-${ngay}`;
        if (!gvBusyMap.has(gvKey)) {
            gvBusyMap.set(gvKey, { tiet: [], khu: [] });
        }
        const gvSchedule = gvBusyMap.get(gvKey);

        const startIdx = this.tietHoc.indexOf(tietBatDau);
        const endIdx = this.tietHoc.indexOf(tietKetThuc);

        // Đánh dấu busy cho giảng viên và phòng
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
    async saveTKBToDatabase(tkb, mahk) {
        // Helper để format date
        const fmt = date => new Date(date).toISOString().split('T')[0];

        if (tkb.length === 0) return;

        // Chuẩn bị bulk‑insert cho lichhoc
        const lichhocValues = tkb.map(entry => [
            entry.manhom,
            entry.maphong,
            entry.thu,
            entry.tietbd,
            entry.tietkt,
            fmt(entry.ngaybd),
            fmt(entry.ngaykt)
        ]);

        // Thực hiện 1 câu INSERT nhiều dòng
        await db.query(
            `INSERT INTO lichhoc 
       (manhom, maphong, thu, tietbd, tietkt, ngaybd, ngaykt)
     VALUES ?`,
            [lichhocValues]
        );


    }
}

module.exports = new EnhancedTKBAlgorithm();