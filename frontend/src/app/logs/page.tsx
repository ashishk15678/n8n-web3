"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
  Calendar,
  Clock,
  RefreshCw,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@/server-store";

// Types
type LogType =
  | "WORKFLOW_CREATED"
  | "WORKFLOW_UPDATED"
  | "WORKFLOW_DELETED"
  | "NODE_ADDED"
  | "NODE_REMOVED"
  | "NODE_UPDATED"
  | "EDGE_ADDED"
  | "EDGE_REMOVED"
  | "EDGE_UPDATED"
  | "EXECUTION_STARTED"
  | "EXECUTION_COMPLETED"
  | "EXECUTION_FAILED"
  | "SETTINGS_UPDATED"
  | "PROJECT_CREATED"
  | "PROJECT_DELETED"
  | "PROJECT_UPDATED";

type LogLevel = "INFO" | "WARNING" | "ERROR" | "DEBUG";

interface Log {
  id: string;
  type: LogType;
  level: LogLevel;
  message: string;
  metadata?: any;
  projectId?: string;
  project?: {
    name: string;
  };
  createdAt: string;
}

// Helper function to get log level info
const getLogLevelInfo = (level: LogLevel) => {
  switch (level) {
    case "ERROR":
      return {
        color: "text-red-500",
        bgColor: "bg-red-50",
        icon: <AlertCircle size={14} />,
      };
    case "WARNING":
      return {
        color: "text-amber-500",
        bgColor: "bg-amber-50",
        icon: <AlertTriangle size={14} />,
      };
    case "INFO":
      return {
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        icon: <Info size={14} />,
      };
    case "DEBUG":
      return {
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        icon: <Bug size={14} />,
      };
  }
};

// Helper function to get log type label
const getLogTypeLabel = (type: LogType) => {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function LogsPage() {
  const { data: user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<LogType[]>([]);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">(
    "24h"
  );

  // Fetch logs with filters
  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useQuery<Log[]>({
    queryKey: ["logs", searchQuery, selectedLevels, selectedTypes, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedLevels.length)
        params.append("levels", selectedLevels.join(","));
      if (selectedTypes.length) params.append("types", selectedTypes.join(","));
      params.append("timeRange", timeRange);

      const response = await fetch(`/api/logs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch logs");
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.project?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedLevels.length === 0 || selectedLevels.includes(log.level);
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(log.type);
    return matchesSearch && matchesLevel && matchesType;
  });

  const toggleLevel = (level: LogLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleType = (type: LogType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">Logs</h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Monitor and analyze your workflow activities
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-3 py-2 border border-zinc-200 shadow-sm text-sm font-medium rounded-lg text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors duration-200"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search and Time Range */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-zinc-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg bg-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {(["1h", "24h", "7d", "30d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    timeRange === range
                      ? "bg-zinc-900 text-white"
                      : "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Level and Type Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Level Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-700">Level:</span>
              {(["INFO", "WARNING", "ERROR", "DEBUG"] as LogLevel[]).map(
                (level) => {
                  const levelInfo = getLogLevelInfo(level);
                  return (
                    <button
                      key={level}
                      onClick={() => toggleLevel(level)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                        selectedLevels.includes(level)
                          ? `${levelInfo.bgColor} ${levelInfo.color}`
                          : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-200"
                      }`}
                    >
                      {levelInfo.icon}
                      {level}
                    </button>
                  );
                }
              )}
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-700">Type:</span>
              <div className="relative">
                <button className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 flex items-center gap-1.5">
                  <Filter size={14} />
                  {selectedTypes.length
                    ? `${selectedTypes.length} selected`
                    : "All Types"}
                  <ChevronDown size={14} />
                </button>
                {/* Type dropdown menu would go here */}
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-zinc-500"
                    >
                      Loading logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-zinc-500"
                    >
                      No logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const levelInfo = getLogLevelInfo(log.level);
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-zinc-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {format(new Date(log.createdAt), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400 mt-0.5">
                            <Clock size={14} />
                            {format(new Date(log.createdAt), "HH:mm:ss")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`px-2.5 py-1 rounded-full ${levelInfo.bgColor} ${levelInfo.color} inline-flex items-center gap-1.5`}
                          >
                            {levelInfo.icon}
                            <span className="text-xs font-medium">
                              {log.level}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                          {getLogTypeLabel(log.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                          {log.project?.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600">
                          {log.message}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
