const db = require('../config/db');

class EnhancedTKBAlgorithm {
    constructor() {
        this.tietHoc = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13'];
        this.ngayHoc = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        this.maxTietPerDay = 4;
        this.minBreakBetweenZones = 2;
        this.weekCount = 15;
        this.roomUsage = new Map();
        this._slotCallCount = 0;
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
        WHERE d.trangthai = 'Da duyet'
      `);

            // 3) build nhóm môn và filter
            const monHocGroups = monhocs
                .map(mh => {
                    const nhom = nhommhs.filter(n => n.mamh === mh.mamh);
                    return {
                        ...mh,
                        nhom: nhom.map(g => ({
                            ...g,
                            svCount: dangkys.filter(d => d.manhom === g.manhom).length
                        })),
                        totalSvCount: nhom.reduce((sum, g) => sum + dangkys.filter(d => d.manhom === g.manhom).length, 0)
                    };
                })
                .filter(mh => mh.nhom.length > 0);

            const weeksSinceStart = Math.ceil((Date.now() - new Date(hocky.ngaybd)) / (7 * 24 * 3600 * 1000));

            // Giải thuật heuristic 
            const monHocsFiltered = monHocGroups.sort((a, b) => {
                const priorityA = a.sotinchi * 10 + a.totalSvCount;
                const priorityB = b.sotinchi * 10 + b.totalSvCount;
                const diffPriority = priorityB - priorityA;
                if (diffPriority !== 0) {
                    return diffPriority;
                }
                const roomsA = phonghocs.filter(
                    ph => ph.loaiphong === a.loaiphong && ph.succhua >= a.totalSvCount
                ).length;
                const roomsB = phonghocs.filter(
                    ph => ph.loaiphong === b.loaiphong && ph.succhua >= b.totalSvCount
                ).length;
                return roomsA - roomsB;
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

            for (const credit of [4, 3, 2, 1]) {
                for (const unit of units.filter(u => (u.sotinchi || 3) === credit)) {
                    const ok = await this.scheduleMonHoc(
                        unit, phonghocs, giangviens, tkb,
                        gvBusyMap, phongBusyMap, svBusyMap,
                        nhommhs, hocky
                    );
                    if (!ok) {
                        conflicts.push({
                            mamh: unit.mamh,
                            tenmh: unit.tenmh,
                            lyDo: 'Không thể xếp lịch do xung đột'
                        });
                    }
                }
            }
            await this.saveTKBToDatabaseAndEnrollStudents(tkb, hocky.mahk);

            return { tkb, conflicts };
        } catch (err) {
            console.error('Lỗi khi tạo TKB:', err);
            throw err;
        }
    }

    async scheduleMonHoc(unit, phonghocs, giangviens, tkb, gvBusyMap, phongBusyMap, svBusyMap, nhommhs, hocky) {
        const { manhom, sotinchi, totalSvCount, mgv } = unit;
        const nhomMonHoc = nhommhs.find(nhom => nhom.manhom === unit.manhom);
        if (!nhomMonHoc) return false;

        const giangVien = giangviens.find(gv => gv.mgv === nhomMonHoc.mgv);
        if (!giangVien) return false;
        //Pattern based scheduling
        const schedulePattern = this.getSchedulePattern(sotinchi);
        const suitableRooms = phonghocs
            .filter(r => r.succhua >= totalSvCount)
            .sort((a, b) => {
                const ua = this.roomUsage.get(a.maphong) || 0;
                const ub = this.roomUsage.get(b.maphong) || 0;
                return ua - ub;
            });

        for (const pattern of schedulePattern) {
            for (const phong of suitableRooms) {
                const scheduledDays = [];
                let success = true;

                // Mỗi pattern có nhiều session
                for (const session of pattern.sessions) {
                    const scheduled = this.findSlot(
                        unit, giangVien, phong, tkb,
                        gvBusyMap, phongBusyMap, svBusyMap,
                        session.tietCount, scheduledDays,
                        hocky
                    );
                    if (!scheduled) { success = false; break; }

                    for (const entry of Array.isArray(scheduled) ? scheduled : [scheduled]) {
                        scheduledDays.push(entry.thu);
                        tkb.push(entry);
                        this.roomUsage.set(
                            phong.maphong,
                            (this.roomUsage.get(phong.maphong) || 0) + 1
                        );
                    }
                }

                if (success) {
                    return true;
                }
            }
        }

        return false;

    }
    //backtracking
    findSlot(unit, giangVien, phongHoc, tkb,
        gvBusyMap, phongBusyMap, svBusyMap,
        count, usedDays, hocky) {
        const { manhom } = unit;

        // 1) Tạo mảng các "thu" là 2→7
        const days = this.ngayHoc.map((_, i) => i + 2);

        // 2) Xác định vị trí xoay vòng từ biến _slotCallCount
        const offset = this._slotCallCount++ % days.length;
        const rotated = days
            .slice(offset)
            .concat(days.slice(0, offset));

        // 3) helper format date
        const fmt = d => new Date(d).toISOString().split('T')[0];

        // 4) Duyệt từng ngày theo thứ tự đã xoay
        for (const thu of rotated) {
            if (usedDays.includes(thu)) continue;

            // Tìm tiết liền chân đủ count, không cắt giữa sáng/trưa
            for (let s = 0; s + count <= this.tietHoc.length; s++) {
                const startTiet = s + 1;
                const endTiet = s + count;
                if (startTiet < 6 && endTiet > 5) continue;

                // Kiểm tra giảng viên + phòng rảnh
                let ok = true;
                for (let j = 0; j < count; j++) {
                    const tiet = this.tietHoc[s + j];
                    if (gvBusyMap.has(`${giangVien.mgv}-${thu}-${tiet}`)
                        || phongBusyMap.has(`${phongHoc.maphong}-${thu}-${tiet}`)) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) continue;

                // 5) Nếu được, xây dựng 2 entry (pha 1 & pha 2)
                const firstWeeks = 9;
                const secondStart = 11;
                const secondEnd = 19;

                // entry pha 1
                const entry1 = {
                    manhom,
                    maphong: phongHoc.maphong,
                    thu,
                    tietbd: startTiet,
                    tietkt: endTiet,
                    ngaybd: fmt(hocky.ngaybd),
                    ngaykt: fmt(new Date(new Date(hocky.ngaybd)
                        .setDate(new Date(hocky.ngaybd).getDate()
                            + 7 * (firstWeeks - 1))))
                };
                // entry pha 2
                const entry2 = {
                    manhom,
                    maphong: phongHoc.maphong,
                    thu,
                    tietbd: startTiet,
                    tietkt: endTiet,
                    ngaybd: fmt(new Date(new Date(hocky.ngaybd)
                        .setDate(new Date(hocky.ngaybd).getDate()
                            + 7 * (secondStart - 1)))),
                    ngaykt: fmt(new Date(new Date(hocky.ngaybd)
                        .setDate(new Date(hocky.ngaybd).getDate()
                            + 7 * (secondEnd - 1))))
                };

                // 6) Đánh dấu busy cho giảng viên và phòng
                for (let j = 0; j < count; j++) {
                    const tiet = this.tietHoc[s + j];
                    gvBusyMap.set(`${giangVien.mgv}-${thu}-${tiet}`, true);
                    phongBusyMap.set(`${phongHoc.maphong}-${thu}-${tiet}`, true);
                }

                // Trả về 2 buổi
                return [entry1, entry2];
            }
        }

        // Không tìm được slot
        return null;
    }
    async saveTKBToDatabaseAndEnrollStudents(tkb, mahk) {
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