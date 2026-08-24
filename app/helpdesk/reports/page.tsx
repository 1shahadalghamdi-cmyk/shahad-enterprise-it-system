"use client";

import Sidebar from "@/app/components/system/Sidebar";

export default function ReportsPage() {
  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-8">

        <p className="text-xs uppercase tracking-[0.35em] text-blue-400">
          IT Reporting & Analytics
        </p>

        <h1 className="mt-2 text-5xl font-bold">
          Helpdesk Reports
        </h1>

        <p className="mt-3 max-w-3xl text-gray-400">
          Analyze IT support performance, technician productivity,
          SLA compliance, recurring incidents and operational trends.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-4">

          <Card
            title="Incidents"
            value="284"
            color="text-blue-400"
          />

          <Card
            title="Resolved"
            value="267"
            color="text-green-400"
          />

          <Card
            title="SLA Compliance"
            value="98%"
            color="text-emerald-400"
          />

          <Card
            title="Avg Resolution"
            value="4.1h"
            color="text-yellow-400"
          />

        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <Panel
            title="Tickets by Category"
            items={[
              ["Hardware","86"],
              ["Software","73"],
              ["Microsoft 365","49"],
              ["Network","41"],
              ["Security","35"]
            ]}
          />

          <Panel
            title="Top Technicians"
            items={[
              ["Sarah Hassan","98%"],
              ["Mohammed Saleh","96%"],
              ["Ali Nasser","94%"],
              ["Yousef Omar","89%"]
            ]}
          />

        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900">

          <div className="border-b border-white/10 p-6">

            <h2 className="text-2xl font-semibold">
              Monthly Performance
            </h2>

          </div>

          <table className="w-full">

            <thead className="border-b border-white/10 text-left text-gray-400">

              <tr>

                <th className="px-6 py-4">Month</th>
                <th>Incidents</th>
                <th>Resolved</th>
                <th>SLA</th>
                <th>Avg Time</th>

              </tr>

            </thead>

            <tbody>

              <Row
                month="May"
                incidents="91"
                resolved="88"
                sla="98%"
                time="4.4h"
              />

              <Row
                month="June"
                incidents="95"
                resolved="94"
                sla="99%"
                time="4.0h"
              />

              <Row
                month="July"
                incidents="98"
                resolved="95"
                sla="97%"
                time="4.1h"
              />

            </tbody>

          </table>

        </div>

        <div className="mt-8 flex gap-4">

          <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">
            Export PDF
          </button>

          <button className="rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 font-semibold hover:bg-zinc-800">
            Export Excel
          </button>

        </div>

      </section>
    </main>
  );
}

function Card({
  title,
  value,
  color,
}:{
  title:string;
  value:string;
  color:string;
}){

  return(

    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h2 className={`mt-4 text-5xl font-bold ${color}`}>
        {value}
      </h2>

    </div>

  );

}

function Panel({
  title,
  items,
}:{
  title:string;
  items:string[][];
}){

  return(

    <div className="rounded-2xl border border-white/10 bg-zinc-900">

      <div className="border-b border-white/10 p-5">

        <h2 className="text-xl font-semibold">
          {title}
        </h2>

      </div>

      <div className="p-5 space-y-4">

        {items.map((item)=>(
          <div
            key={item[0]}
            className="flex justify-between rounded-xl bg-zinc-950 p-4"
          >

            <span>{item[0]}</span>

            <span className="font-bold text-blue-400">
              {item[1]}
            </span>

          </div>
        ))}

      </div>

    </div>

  );

}

function Row({
  month,
  incidents,
  resolved,
  sla,
  time,
}:{
  month:string;
  incidents:string;
  resolved:string;
  sla:string;
  time:string;
}){

  return(

    <tr className="border-b border-white/5 hover:bg-zinc-800/40">

      <td className="px-6 py-4 font-semibold">
        {month}
      </td>

      <td>{incidents}</td>

      <td>{resolved}</td>

      <td className="text-green-400 font-semibold">
        {sla}
      </td>

      <td>{time}</td>

    </tr>

  );

}
