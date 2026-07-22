import { getDashboardSummary, deleteContent, updateContent } from "../services.js";
export async function dashboard(req, res) {
    const summary = await getDashboardSummary();
    res.json({
        message: "Admin dashboard data",
        summary,
        admin: req.user
    });
}
export async function deleteItem(req, res) {
    const { type, id } = req.params;
    try {
        const success = await deleteContent(type, id);
        if (!success)
            return res.status(404).json({ message: "Item not found" });
        res.json({ message: `${type} item deleted successfully` });
    }
    catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Failed to delete item" });
    }
}
export async function updateItem(req, res) {
    const { type, id } = req.params;
    try {
        const success = await updateContent(type, id, req.body);
        if (!success)
            return res.status(404).json({ message: "Item not found or not modified" });
        res.json({ message: `${type} item updated successfully` });
    }
    catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Failed to update item" });
    }
}
