const admin = require('firebase-admin');

// ==========================
// CREATE QUEST
// ==========================
exports.createQuest = async (req, res) => {
    const db = admin.firestore();

    try {
        const questData = {
            missionName: req.body.missionName || "",
            category: req.body.category || "ทั่วไป",
            xp: Number(req.body.xp || 0),
            status: "ACTIVE",
            targetUser: req.body.targetUser || "GLOBAL",
            goalType: req.body.goalType || "count",
            unit: req.body.unit || "ครั้ง",
            totalCount: Number(req.body.totalCount || 1),
            dailyQuota: Number(req.body.dailyQuota || 1),
            duration: Number(req.body.duration || 30),
            isCompleted: false,
            currentProgress: 0,
            currentDamage: 0,
            lastUpdated: new Date().toISOString().split('T')[0],
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('missions').add(questData);

        res.status(200).json({
            success: true,
            id: docRef.id
        });

    } catch (err) {
        console.error("CREATE ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ==========================
// GET USERS
// ==========================
exports.getUsers = async (req, res) => {
    const db = admin.firestore();

    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(users);

    } catch (err) {
        console.error("GET USERS ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ==========================
// GET ALL MISSIONS
// ==========================
exports.getMissions = async (req, res) => {
    const db = admin.firestore();

    try {
        const snapshot = await db.collection('missions').get();
        const missions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(missions);

    } catch (err) {
        console.error("GET MISSIONS ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ==========================
// GET MISSION BY ID
// ==========================
// ✅ เหลือแค่อันนี้ (ลบอันที่สองออก)
exports.getMissionById = async (req, res) => {
    try {
        const db = admin.firestore();
        const missionId = req.params.id;
        console.log("🔥 GET MISSION ID:", missionId);

        const doc = await db.collection('missions')
            .doc(missionId)
            .get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: "Mission not found"
            });
        }

        return res.json({
            id: doc.id,
            ...doc.data()
        });

    } catch (err) {
        console.error("❌ GET MISSION ERROR:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ==========================
// UPDATE QUEST
// ==========================
exports.updateQuest = async (req, res) => {
    const db = admin.firestore();
    const { id } = req.params;

    try {
        console.log("🔥 UPDATE ID:", id);
        console.log("📦 DATA:", req.body);

        const docRef = db.collection('missions').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ Mission ID นี้"
            });
        }

        const oldData = docSnap.data();
        const updatedData = {
            ...oldData,
            missionName: req.body.missionName || oldData.missionName,
            category: req.body.category || oldData.category,
            xp: Number(req.body.xp || oldData.xp || 0),
            goalType: req.body.goalType || oldData.goalType,
            unit: req.body.unit || oldData.unit,
            totalCount: Number(req.body.totalCount || oldData.totalCount || 1),
            dailyQuota: Number(req.body.dailyQuota || oldData.dailyQuota || 1),
            duration: Number(req.body.duration || oldData.duration || 30),
            targetUser: req.body.targetUser || oldData.targetUser || "GLOBAL",
            status: oldData.status || "ACTIVE",
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        await docRef.update(updatedData);

        console.log("✅ UPDATE SUCCESS");

        res.status(200).json({
            success: true,
            message: "อัปเดตข้อมูลสำเร็จ",
            data: updatedData
        });

    } catch (err) {
        console.error("UPDATE ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ==========================
// DELETE MISSION
// ==========================
exports.deleteMission = async (req, res) => {
    const db = admin.firestore();
    const { id } = req.params;

    try {
        console.log("🗑️ DELETE MISSION ID:", id);

        const docRef = db.collection('missions').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ Mission ID นี้"
            });
        }

        await docRef.delete();

        console.log(`✅ ลบ Mission ID: ${id} สำเร็จ`);

        return res.status(200).json({
            success: true,
            message: "Mission deleted successfully"
        });

    } catch (err) {
        console.error("❌ DELETE ERROR:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};