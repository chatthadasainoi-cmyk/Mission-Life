const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');

const serviceAccount = require("./serviceAccountKey.json");

// ==========================
// FIREBASE
// ==========================
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

db.settings({
    ignoreUndefinedProperties: true
});

console.log("🔥 Firebase Connected & Firestore Ready!");

// ==========================
// EXPRESS
// ==========================
const app = express();

app.use(cors());
app.use(express.json());

// ==========================
// STATIC FILES
// ==========================
app.use(express.static(path.join(__dirname, '../frontendAdmin')));

// ==========================
// CONTROLLERS
// ==========================
const controller = require('./controllers/controllers');
const questCtrl = require('./questController');

console.log("🔥 Firebase & Controller Linked!");

// ==========================
// LOGIN API
// ==========================
app.post('/api/admin/login', controller.adminLogin);

// ==========================
// MISSIONS API
// ==========================
app.post('/api/missions/create', questCtrl.createQuest);
app.get('/api/users', questCtrl.getUsers);
app.get('/api/missions', questCtrl.getMissions);
app.get('/api/missions/:id', questCtrl.getMissionById);
app.put('/api/missions/:id', questCtrl.updateQuest);
app.delete('/api/missions/:id', questCtrl.deleteMission);

// ==========================
// USER UPDATE API
// ==========================
app.put('/api/users/update/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        console.log("👤 USER ID:", userId);
        console.log("📦 BODY:", req.body);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Missing User ID"
            });
        }

        const updatedData = {
            username: req.body.username || "",
            characterName: req.body.characterName || "",
            birthDate: req.body.birthDate || "",
            age: Number(req.body.age) || 0,
            email: req.body.email || "",
            password: req.body.password || ""
        };

        console.log("🔥 CLEAN DATA:", updatedData);

        await db.collection('users')
            .doc(userId)
            .update(updatedData);

        return res.json({
            success: true,
            message: "Updated Successfully"
        });

    } catch (err) {
        console.error("❌ FIREBASE ERROR:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ==========================
// SERVER START
// ==========================
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is flying at http://localhost:${PORT}`);
});