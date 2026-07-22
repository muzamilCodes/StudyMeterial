import { getDashboardSummary, getRegisteredUsers } from "../services.js";
export async function dashboard(req, res) {
    const summary = await getDashboardSummary();
    const users = await getRegisteredUsers();
    res.json({
        message: "Admin dashboard data",
        summary,
        users,
        admin: req.user
    });
}
