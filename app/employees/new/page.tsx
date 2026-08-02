"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEmployeePage() {
  const router = useRouter();

  const [employee, setEmployee] = useState({
    id: "",
    name: "",
    department: "",
    email: "",
    status: "Active",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const existingEmployees = JSON.parse(
      localStorage.getItem("employees") || "[]"
    );

    existingEmployees.push(employee);

    localStorage.setItem(
      "employees",
      JSON.stringify(existingEmployees)
    );

    router.push("/employees");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">

        <h1 className="mb-6 text-3xl font-bold">
          Add Employee
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            className="w-full rounded border p-3"
            placeholder="Employee ID"
            value={employee.id}
            onChange={(e) =>
              setEmployee({ ...employee, id: e.target.value })
            }
            required
          />

          <input
            className="w-full rounded border p-3"
            placeholder="Full Name"
            value={employee.name}
            onChange={(e) =>
              setEmployee({ ...employee, name: e.target.value })
            }
            required
          />

          <input
            className="w-full rounded border p-3"
            placeholder="Department"
            value={employee.department}
            onChange={(e) =>
              setEmployee({
                ...employee,
                department: e.target.value,
              })
            }
            required
          />

          <input
            type="email"
            className="w-full rounded border p-3"
            placeholder="Email"
            value={employee.email}
            onChange={(e) =>
              setEmployee({
                ...employee,
                email: e.target.value,
              })
            }
            required
          />

          <select
            className="w-full rounded border p-3"
            value={employee.status}
            onChange={(e) =>
              setEmployee({
                ...employee,
                status: e.target.value,
              })
            }
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
          >
            Save Employee
          </button>

        </form>

      </div>
    </main>
  );
}
