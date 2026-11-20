import Activity from "../models/Activity.js";

// Activity log fail ho jaye to main kaam rukna nahi chahiye
const logActivity = async (project, user, action, targetName = "") => {
  try {
    await Activity.create({
      project,
      user,
      action,
      targetName: String(targetName).slice(0, 200),
    });
  } catch (error) {
    console.error("Activity log failed:", error.message);
  }
};

export default logActivity;