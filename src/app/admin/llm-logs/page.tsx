'use client'
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/llm-logs")
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">LLM Logs Admin</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search prompt/response/error..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-64"
          />
          <Input
            placeholder="Filter by route"
            value={routeFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRouteFilter(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusFilter(e.target.value)}
            className="w-40"
          />
          <Button onClick={downloadLogs} variant="outline">Download JSON</Button>
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
    </div>
  );
} 