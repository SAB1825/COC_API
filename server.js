import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const COC_API_URL = "https://api.clashofclans.com/v1/clans/";
const COC_API_KEY = process.env.COC_API_KEY;

if (!COC_API_KEY) {
    throw new Error("COC_API_KEY is not defined in the environment variables.");
}
app.get("/get-ip", async (req, res) => {
    try {
        const ipResponse = await axios.get("https://api64.ipify.org?format=json");
        res.json({ ip: ipResponse.data.ip });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch IP" });
    }
})
app.get("/clan/:clanTag", async (req, res) => {
    const { clanTag } = req.params;
    if (!clanTag) {
        return res.status(400).json({ error: "Clan tag is required!" });
    }

    try {
        const response = await axios.get(`${COC_API_URL}${encodeURIComponent(clanTag)}`, {
            headers: { Authorization: `Bearer ${COC_API_KEY}` },
        });

        const clanData = response.data;

        // Count the number of players at each Town Hall level
        const townHallCounts = {};
        clanData.memberList.forEach(member => {
            const thLevel = member.townHallLevel;
            townHallCounts[thLevel] = (townHallCounts[thLevel] || 0) + 1;
        });

        // Prepare the filtered response
        const filteredData = {
            name: clanData.name,
            tag: clanData.tag,
            description: clanData.description,
            clanLevel: clanData.clanLevel,
            location : clanData.location.name,
            badgeUrl : clanData.badgeUrls.large,
            warWins : clanData.warWins,
            trophies : clanData.trophies,
            clanCaptial : clanData.clanCapital.capitalHallLevel,
            warWinStreak: clanData.warWinStreak,
            warLeague: clanData.warLeague?.name || "Unranked",
            townHallCounts
        };

        res.json(filteredData);
    } catch (error) {
        console.error("Error fetching clan data:", error.message);
        res.status(error.response?.status || 500).json({ error: "Failed to fetch clan data." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
