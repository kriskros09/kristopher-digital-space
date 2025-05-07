'use client'
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/common/button";
import { Input } from "@/components/ui/common/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/admin/table";
import { LogoutButton } from "@/components/ui/login/logout-button";
interface LlmLogEntry {
  timestamp: string;
  userId?: string;
  route: string;
  prompt: string;
  response: string;
  status: string;
  error?: string;
}

export default function LlmLogsAdminPage() {
  const [logs, setLogs] = useState<LlmLogEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchLogs() {
    setLoading(true);
    const res = await fetch(`/api/admin/llm-logs?page=${page}&pageSize=${pageSize}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setTotalCount(data.totalCount || 0);
    setLoading(false);
  }

  const filteredLogs = logs.filter(log =>
    (!statusFilter || log.status === statusFilter) &&
    (!routeFilter || log.route.includes(routeFilter)) &&
    (!search ||
      log.prompt.toLowerCase().includes(search.toLowerCase()) ||
      log.response.toLowerCase().includes(search.toLowerCase()) ||
      (log.error && log.error.toLowerCase().includes(search.toLowerCase()))
    )
  );

  function downloadLogs() {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function clearAllLogs() {
    if (!window.confirm("Are you sure you want to delete all logs?")) return;
    setLoading(true);
    await fetch("/api/admin/llm-logs", { method: "DELETE" });
    setPage(1);
    await fetchLogs();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">LLM Logs Admin</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search prompt/response/error..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-64"
          />
          <Input
            placeholder="Filter by route"
            value={routeFilter}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRouteFilter(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setStatusFilter(e.target.value)}
            className="w-40"
          />
          <Button onClick={downloadLogs} variant="outline">Download JSON</Button>
          <Button onClick={fetchLogs} variant="secondary">Fetch All Logs</Button>
          <Button onClick={clearAllLogs} variant="destructive">Clear All</Button>
        </div>
        <LogoutButton />
      </div>
      <div className="overflow-auto max-h-[80vh] border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead>Response</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow><TableCell colSpan={7}>No logs found.</TableCell></TableRow>
            ) : (
              filteredLogs.map((log, i) => (
                <TableRow key={i} className={log.status === "error" ? "bg-red-50" : ""}>
                  <TableCell className="whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell>{log.userId || "-"}</TableCell>
                  <TableCell>{log.route}</TableCell>
                  <TableCell className="max-w-xs truncate" title={log.prompt}>{log.prompt}</TableCell>
                  <TableCell className="max-w-xs truncate" title={log.response}>{log.response}</TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell className="max-w-xs truncate" title={log.error}>{log.error}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end items-center gap-2 mt-2">
        <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
        <span>Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
        <Button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= totalCount}>Next</Button>
      </div>
    </div>
  );
} 