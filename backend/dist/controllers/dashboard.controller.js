import { getDashboardSummary } from "../services.js";
export async function summary(_req, res) {
    res.json(await getDashboardSummary());
}
