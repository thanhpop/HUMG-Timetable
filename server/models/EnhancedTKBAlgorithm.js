const db = require('../config/db');

class EnhancedTKBAlgorithm {
    constructor() {
        this.tietHoc = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13'];
        this.ngayHoc = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        this.maxTietPerDay = 4;
        this.weekCount = 15;
    }
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
        // 1) Lấy thông tin học kỳ
        const [hkRows] = await db.query(`SELECT * FROM hocky WHERE mahk = ?`, [mahk]);
        if (!hkRows.length) {
            throw new Error(`Không tìm thấy học kỳ ${mahk}`);
        }
        const hocky = hkRows[0];

        // 2) Load tất cả dữ liệu đầu vào
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

        // 3) Gọi vào thuật toán gốc, truyền hocky để dùng ngaybd/ngaykt
        const { tkb, conflicts } = await this._runAlgorithm(
            monhocs, phonghocs, giangviens,
            sinhviens, dangkys, nhommhs,
            hocky
        );
        return { tkb, conflicts };
    }

    /**
     * thuật toán gốc (đổi tên từ generateTKB → _runAlgorithm)
     * - không còn load db.query()
     * - dùng ngaybd/ngaykt từ đối tượng hocky
     */
    async _runAlgorithm(
        monhocs, phonghocs, giangviens,
        sinhviens, dangkys, nhommhs,  // giờ chỉ còn nhóm môn trong kỳ
        hocky
    ) {
        // 1) Build các nhóm môn
        const monHocGroups = monhocs.map(mh => {
            const groups = nhommhs.filter(n => n.mamh === mh.mamh);
            return {
                ...mh,
                nhom: groups.map(g => ({
                    ...g,
                    svCount: dangkys.filter(d => d.manhom === g.manhom).length
                })),
                totalSvCount: groups.reduce((acc, g) =>
                    acc + dangkys.filter(d => d.manhom === g.manhom).length, 0)
            };
        })
            // ***chỉ giữ môn có ít nhất 1 nhóm***
            .filter(mh => mh.nhom.length > 0);
        const classUnits = monHocGroups.flatMap(mh =>
            mh.nhom.map(g => ({
                // g là 1 nhóm môn cụ thể
                manhom: g.manhom,
                mamh: mh.mamh,
                tenmh: mh.tenmh,
                sotinchi: mh.sotinchi,
                svCount: g.svCount,
                totalSvCount: mh.totalSvCount,
                mgv: g.mgv
            }))
        );
        // 2) Lọc tín chỉ 2 trong >8 tuần
        const weeksSinceStart = Math.ceil(
            (Date.now() - new Date(hocky.ngaybd)) /
            (7 * 24 * 3600 * 1000)
        );
        const filtered = monHocGroups.filter(mh =>
            !(mh.sotinchi === 2 && weeksSinceStart > 8)
        );

        // 3) Sắp xếp ưu tiên
        filtered.sort((a, b) => {
            return (b.sotinchi * 10 + b.totalSvCount)
                - (a.sotinchi * 10 + a.totalSvCount);
        });

        const tkb = [], conflicts = [];
        const gvBusyMap = new Map(), phongBusyMap = new Map(), svBusyMap = new Map();

        // 4) Theo từng nhóm tín chỉ
        for (const credit of [4, 3, 2, 1]) {
            // Lọc classUnits theo tín chỉ
            const units = classUnits.filter(u => (u.sotinchi || 3) === credit);
            // Sắp xếp ưu tiên như trước (đã sort filtered, nếu muốn bạn có thể resort units)
            for (const unit of units) {
                const ok = await this.scheduleMonHoc(
                    unit,      // giờ là 1 nhóm môn
                    phonghocs,
                    giangviens,
                    tkb,
                    gvBusyMap,
                    phongBusyMap,
                    svBusyMap,
                    nhommhs,
                    hocky
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

        return { tkb, conflicts };
    }
    // pattern based scheduling
    async scheduleMonHoc(unit, phonghocs, giangviens, tkb, gvBusyMap, phongBusyMap, svBusyMap, nhommhs, hocky) {
        const { manhom, sotinchi, totalSvCount, mgv } = unit;
        const nhomMonHoc = nhommhs.find(nhom => nhom.manhom === manhom);
        if (!nhomMonHoc) return false;

        const giangVien = giangviens.find(gv => gv.mgv === nhomMonHoc.mgv);
        if (!giangVien) return false;

        const schedulePattern = this.getSchedulePattern(sotinchi || 3);
        const suitableRooms = phonghocs.filter(r => r.succhua >= totalSvCount).sort((a, b) => a.succhua - b.succhua);

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
                    }
                }

                if (success) {
                    return true;
                }
            }
        }

        return false;
    }
    findSlot(unit, giangviens, phonghocs, tkb, gvBusyMap, phongBusyMap, svBusyMap, count, usedDays, hocky) {
        const { manhom } = unit;        // chỉ lấy manhom (và mamh, tenmh nếu bạn cần)
        for (let i = 0; i < this.ngayHoc.length; i++) {
            const thu = i + 2;            // 2 = Thứ 2, 3 = Thứ 3, …
            if (usedDays.includes(thu)) continue;

            for (let s = 0; s + count <= this.tietHoc.length; s++) {
                const startTiet = s + 1;
                const endTiet = s + count;
                if (startTiet < 6 && endTiet > 5) continue;
                let ok = true;
                for (let j = 0; j < count; j++) {
                    const tiet = this.tietHoc[s + j];
                    if (gvBusyMap.has(`${giangviens.mgv}-${thu}-${tiet}`) ||
                        phongBusyMap.has(`${phonghocs.maphong}-${thu}-${tiet}`)) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) continue;
                const firstPhaseWeeks = 9;
                const secondPhaseStart = 11;
                const secondPhaseWeeks = 19;
                // build entry, dùng ngaybd/ngaykt từ hocky
                const entry1 = {
                    manhom,
                    maphong: phonghocs.maphong,
                    thu,
                    tietbd: startTiet,
                    tietkt: endTiet,
                    ngaybd: hocky.ngaybd,
                    ngaykt: (() => {
                        const d = new Date(hocky.ngaybd);
                        // + (firstPhaseWeeks‑1) tuần
                        d.setDate(d.getDate() + 7 * (firstPhaseWeeks - 1));
                        return d.toISOString().split('T')[0];
                    })()
                };

                // build entry đợt 2: tuần 11 → tuần 18
                const entry2 = {
                    manhom,
                    maphong: phonghocs.maphong,
                    thu,
                    tietbd: startTiet,
                    tietkt: endTiet,
                    ngaybd: (() => {
                        const d = new Date(hocky.ngaybd);
                        // start at tuần secondPhaseStart → offset (secondPhaseStart - 1) tuần
                        d.setDate(d.getDate() + 7 * (secondPhaseStart - 1));
                        return d.toISOString().split('T')[0];
                    })(),
                    ngaykt: (() => {
                        const d = new Date(hocky.ngaybd);
                        // end at tuần secondPhaseWeeks → offset (secondPhaseWeeks - 1) tuần
                        d.setDate(d.getDate() + 7 * (secondPhaseWeeks - 1));
                        return d.toISOString().split('T')[0];
                    })()
                };

                // đánh dấu busy
                for (let j = 0; j < count; j++) {
                    const tiet = this.tietHoc[s + j];
                    gvBusyMap.set(`${giangviens.mgv}-${thu}-${tiet}`, true);
                    phongBusyMap.set(`${phonghocs.maphong}-${thu}-${tiet}`, true);
                }
                entry1.thu = i + 2;
                entry2.thu = i + 2;
                return [entry1, entry2];
            }
        }
        return null;
    }
}

module.exports = new EnhancedTKBAlgorithm();