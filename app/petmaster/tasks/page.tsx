"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Check } from "lucide-react"

function uaeTodayYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

type DailyTask = {
  id: string
  task_date: string
  time_uae: string | null
  type: string | null
  title: string | null
  platform: string | null
  status: string
  done_at: string | null
}

function platformBadgeStyle(platform: string | null): { bg: string; text: string } {
  const p = (platform ?? "").trim().toLowerCase()
  if (p === "instagram") return { bg: "#FCE7F3", text: "#BE185D" }
  if (p === "facebook") return { bg: "#DBEAFE", text: "#1D4ED8" }
  if (p === "tiktok") return { bg: "#111827", text: "#F9FAFB" }
  if (p === "pinterest") return { bg: "#FEE2E2", text: "#B91C1C" }
  if (p === "outreach") return { bg: "#FFEDD5", text: "#C2410C" }
  if (p === "admin") return { bg: "#F3F4F6", text: "#4B5563" }
  return { bg: "#F3F4F6", text: "#374151" }
}

function formatTimeUae(raw: string | null): string {
  if (!raw?.trim()) return "—"
  const t = raw.trim()
  if (/^\d{2}:\d{2}/.test(t)) return `${t.slice(0, 5)} UAE`
  return `${t} UAE`
}

export default function PetmasterTasksPage() {
  const todayUae = useMemo(() => uaeTodayYmd(), [])
  const [date, setDate] = useState(todayUae)
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    const res = await fetch(`/api/petmaster-tasks?date=${encodeURIComponent(date)}`, {
      credentials: "same-origin",
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
      setTasks([])
    } else {
      const json = (await res.json()) as DailyTask[]
      setTasks(Array.isArray(json) ? json : [])
    }
    setLoading(false)
  }, [date])

  useEffect(() => {
    load()
  }, [load])

  const doneCount = tasks.filter((t) => t.status === "done").length
  const total = tasks.length
  const isToday = date === todayUae
  const summary = isToday
    ? `${doneCount} of ${total} tasks done today`
    : `${doneCount} of ${total} tasks done`

  async function toggleDone(task: DailyTask) {
    const isDone = task.status === "done"
    const endpoint = isDone ? "/api/petmaster-task-undone" : "/api/petmaster-task-done"
    setBusyId(task.id)
    setError(null)
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
        return
      }
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: isDone ? "to_do" : "done",
                done_at: isDone ? null : new Date().toISOString(),
              }
            : t,
        ),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#111827]">Tasks</h1>
        <label className="flex flex-col gap-1 text-sm text-[#111827]/70">
          <span className="font-medium text-[#111827]">Date (UAE)</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-organic-sm border border-[#111827]/20 bg-white px-3 py-2 text-[#111827] shadow-sm"
          />
        </label>
      </div>

      <p className="text-sm font-medium text-[#111827]/80">{summary}</p>

      {error ? (
        <div className="rounded-organic-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-[#111827]/70">Loading tasks…</p>
      ) : !tasks.length ? (
        <p className="rounded-organic-sm bg-[#1F2937] p-6 text-sm text-[#F2EEE2]">No tasks for this date.</p>
      ) : (
        <ul className="divide-y divide-[#111827]/10 rounded-organic-sm border border-[#111827]/10 bg-white shadow-sm">
          {tasks.map((task) => {
            const done = task.status === "done"
            const badge = platformBadgeStyle(task.platform)
            const busy = busyId === task.id
            return (
              <li key={task.id}>
                <div
                  className={`flex items-start gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 ${
                    done ? "opacity-70" : ""
                  }`}
                >
                  <button
                    type="button"
                    disabled={busy}
                    aria-pressed={done}
                    aria-label={done ? "Mark as not done" : "Mark as done"}
                    onClick={() => toggleDone(task)}
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
                      done
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-[#111827]/30 bg-white text-transparent hover:border-[#111827]/50"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4 stroke-[3]" aria-hidden /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-block rounded-organic-sm px-2 py-0.5 text-xs font-semibold capitalize"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {task.platform?.trim() || "—"}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-wide text-[#111827]/50">
                        {task.type?.trim() || "—"}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-base font-semibold text-[#111827] ${
                        done ? "line-through" : ""
                      }`}
                    >
                      {task.title?.trim() || "Untitled"}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-xs text-[#111827]/50 sm:text-sm">
                    {formatTimeUae(task.time_uae)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
