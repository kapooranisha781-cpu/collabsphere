
import Note from "../models/Note.js";
import File from "../models/File.js";
import Activity from "../models/Activity.js";
import asyncHandler from "../utils/asyncHandler.js";

const countBy = (rows) => {
  const result = {};

  rows.forEach((row) => {
    result[row._id] = row.count;
  });

  return result;
};

export const getAnalytics = asyncHandler(async (req, res) => {
  const project = req.project;
  const projectId = project._id;

  // Last 7 days
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  // Group data by user
  const groupData = (field) => [
    { $match: { project: projectId } },
    {
      $group: {
        _id: field,
        count: { $sum: 1 },
      },
    },
  ];

  const [
    noteRows,
    fileRows,
    activityRows,
    totalActivities,
    recentActivities,
    dayRows,
  ] = await Promise.all([
    
    Note.aggregate(groupData("$author")),
    File.aggregate(groupData("$uploadedBy")),
    Activity.aggregate(groupData("$user")),
    Activity.countDocuments({ project: projectId }),
    Activity.find({ project: projectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name"),
    Activity.aggregate([
      {
        $match: {
          project: projectId,
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Get project owner and members
  await project.populate([
    { path: "owner", select: "name email" },
    { path: "members", select: "name email" },
  ]);

  const notes = countBy(noteRows);
  const files = countBy(fileRows);
  const activities = countBy(activityRows);

  const people = [
    { user: project.owner, role: "owner" },
    ...project.members.map((member) => ({
      user: member,
      role: "member",
    })),
  ];

  // Member statistics
  const memberStats = people.map(({ user, role }) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    notes: notes[user.id] || 0,
    files: files[user.id] || 0,
    activities: activities[user.id] || 0,
  }));

  // Activity count for each day
  const dayMap = {};

  dayRows.forEach((row) => {
    dayMap[row._id] = row.count;
  });

  const activityByDay = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(since);
    date.setDate(date.getDate() + i);

    const key = date.toLocaleDateString("en-CA");

    activityByDay.push({
      date: key,
      count: dayMap[key] || 0,
    });
  }

  res.json({
    success: true,
    message: "Analytics fetched",
    data: {
      totals: {
        notes: noteRows.reduce((sum, row) => sum + row.count, 0),
        files: fileRows.reduce((sum, row) => sum + row.count, 0),
        activities: totalActivities,
        members: people.length,
      },
      memberStats,
      activityByDay,
      recentActivities,
    },
  });
});
