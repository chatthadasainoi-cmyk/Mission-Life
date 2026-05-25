const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// ตั้งค่าระบบส่งเมล
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: 'missionlife.project@gmail.com', 
        pass: 'oqwdionylmnxgwwc' 
    }
});

// --- ฟังก์ชัน Login Admin ---
exports.adminLogin = async (req, res) => {
    try {
        // เรียกใช้ฐานข้อมูล Firestore
        const db = admin.firestore();
        const { email, password } = req.body;
        console.log(`🔍 ตรวจสอบ Login: ${email}`);

        const adminRef = db.collection('admin_db').doc(email);
        const doc = await adminRef.get();

        if (!doc.exists) {
            return res.status(401).json({ success: false, message: "ไม่พบข้อมูล Admin ในระบบ" });
        }

        const adminData = doc.data();

        if (adminData.password === password) {
            // ✅ จุดที่แก้: ส่ง Response กลับไปก่อนทันที เพื่อให้หน้าเว็บเข้า Dashboard ได้เลย
            res.status(200).json({ 
                success: true, 
                message: "เข้าสู่ระบบสำเร็จ", 
                adminEmail: email 
            });

            // 📧 ส่วนส่งอีเมล (แบบสวยงามพร้อมปุ่มตรวจสอบ)
const userAgent = req.headers['user-agent'] || 'Unknown Device'; // ดึงข้อมูลเครื่องที่ใช้

transporter.sendMail({
    to: email, 
    subject: '🔒 Security Alert: Admin Login Detected',
    html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d9534f; text-align: center;">🛡️ Security Alert</h2>
        <p style="font-size: 16px;">ตรวจพบการเข้าสู่ระบบใหม่ของบัญชี Admin ของคุณ</p>
        <hr style="border: none; border-top: 1px solid #eee;">
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; line-height: 1.6;">
            <strong>รายละเอียดการเข้าใช้งาน:</strong><br>
            📅 <b>เวลา:</b> ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}<br>
            💻 <b>อุปกรณ์/เบราว์เซอร์:</b> <span style="font-size: 12px; color: #666;">${userAgent}</span>
        </div>

        <p style="margin-top: 20px; text-align: center;">
            <a href="http://127.0.0.1:5500/frontendAdmin/Login.html" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                ตรวจสอบการล็อกอิน
            </a>
        </p>

        <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            หากนี่ไม่ใช่การกระทำของคุณ โปรดเปลี่ยนรหัสผ่านทันทีเพื่อความปลอดภัย
        </p>
    </div>
    `
}).catch(mailErr => {
    console.error("⚠️ เมลส่งไม่สำเร็จ (แต่ Login ผ่านแล้ว):", mailErr.message);
});

        } else {
            return res.status(401).json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
        }
    } catch (err) {
        console.error("🔥 Login Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

// --- ฟังก์ชันดึงรายชื่อ Mission (เปลี่ยนชื่อ collection ให้ตรงกับรูป) ---
exports.getAllMissions = async (req, res) => {
    try {
        // เปลี่ยนจาก 'missions' เป็น 'quest_db' ตามรูปของคุณ
        // เรียกใช้ฐานข้อมูล Firestore
        const db = admin.firestore();
        const snapshot = await db.collection('quest_db').get(); 
        const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(missions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- ฟังก์ชันสร้าง Quest (เปลี่ยนชื่อ collection ให้ตรงกับรูป) ---
exports.createQuest = async (req, res) => {
    try {
        // เรียกใช้ฐานข้อมูล Firestore
        const db = admin.firestore();
        const body = req.body;
        const questData = {
            missionName: body.missionName,
            description: body.description,
            comparison: body.comparison,
            logic: body.logic,
            reward: {
                medal: body.reward.medal,
                xp: Number(body.reward.xp),
                message: body.reward.message
            },
            startDate: body.startDate,
            endDate: body.endDate,
            targetUser: body.targetUser,
            type: body.type || "ACTIVE"
        };

        // เปลี่ยนจาก 'missions' เป็น 'quest_db' ตามรูปของคุณ
        const docRef = await db.collection('quest_db').add(questData); 
        res.status(200).json({ success: true, id: docRef.id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};