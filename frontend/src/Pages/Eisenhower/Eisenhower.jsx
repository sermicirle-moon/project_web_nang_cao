import { useState } from "react";

export default function Eisenhower() {
  const [tasks, setTasks] = useState({
    doFirst: [
      { id: 1, title: "Submit quarterly tax returns", due: "Today at 5:00 PM" },
      { id: 2, title: "Fix server critical error", due: "Just now, system crashed" },
    ],
    schedule: [
      { id: 3, title: "Weekly gym session", due: "Monday, 6th of April" },
      { id: 4, title: "Read 'Atomic Habits' - 2 chapters", due: "Personal Growth" },
    ],
    delegate: [
      { id: 5, title: "Week flight for conference", due: "Ask VA to handle" },
      { id: 6, title: "Format slide deck styles", due: "Next to coming down" },
    ],
    eliminate: [
      { id: 7, title: "Organize old email archives", due: "Last month" },
      { id: 8, title: "Check social media trends", due: "Limit to 10 mins" },
    ],
  });

  const Quadrant = ({ title, items, bgColor }) => (
    <div className={`p-4 rounded-2xl ${bgColor} shadow-md`}>
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="bg-white/80 p-3 rounded-xl shadow-sm">
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-gray-500 mt-1">{item.due}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Eisenhower Matrix</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrant title="Do First" items={tasks.doFirst} bgColor="bg-red-100" />
        <Quadrant title="Schedule" items={tasks.schedule} bgColor="bg-blue-100" />
        <Quadrant title="Delegate" items={tasks.delegate} bgColor="bg-yellow-100" />
        <Quadrant title="Eliminate" items={tasks.eliminate} bgColor="bg-gray-100" />
      </div>
    </div>
  );
}