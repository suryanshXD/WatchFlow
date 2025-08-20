"use client";
import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, Globe, Plus, Moon, Sun } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useWebsites } from "@/hooks/UseWebsite";

const API_BACKEND_URL = "http://localhost:8080";

type UptimeStatus = "GOOD" | "BAD" | "UNKNOWN";

function StatusCircle({ status }: { status: UptimeStatus }) {
  return (
    <div
      className={`w-3 h-3 rounded-full ${
        status === "GOOD"
          ? "bg-green-500"
          : status === "BAD"
            ? "bg-red-500"
            : "bg-gray-500"
      }`}
    />
  );
}

function UptimeTicks({ ticks }: { ticks: UptimeStatus[] }) {
  return (
    <div className="flex gap-1 mt-2">
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={`w-8 h-2 rounded ${
            tick === "GOOD"
              ? "bg-green-500"
              : tick === "BAD"
                ? "bg-red-500"
                : "bg-gray-500"
          }`}
        />
      ))}
    </div>
  );
}

function CreateWebsiteModal({
  isOpen,
  onClose,
  isLimitReached,
}: {
  isOpen: boolean;
  onClose: (url: string | null) => void;
  isLimitReached: boolean;
}) {
  const [url, setUrl] = useState("");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-300"
        style={{
          boxShadow: `rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px`,
        }}
      >
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          Add New Website
        </h2>

        {isLimitReached ? (
          <p className="text-red-500 font-medium mb-4">
            ❌ You can only add up to 2 websites.
          </p>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => onClose(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          {!isLimitReached && (
            <button
              type="submit"
              onClick={() => onClose(url)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Add Website
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProcessedWebsite {
  id: string;
  url: string;
  status: UptimeStatus;
  uptimePercentage: number;
  lastChecked: string;
  uptimeTicks: UptimeStatus[];
}

function WebsiteCard({ website }: { website: ProcessedWebsite }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <StatusCircle status={website.status} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {website.url}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {website.uptimePercentage.toFixed(1)}% uptime
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Last 100 minutes status (10-min intervals):
            </p>
            <UptimeTicks ticks={website.uptimeTicks} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last checked: {website.lastChecked}
          </p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { websites: websites10, refreshWebsites } = useWebsites("10min"); // ✅ explicitly for 10m
  const { getToken } = useAuth();

  const processedWebsites = useMemo(() => {
    return websites10.map((website) => {
      const sortedTicks = [...website.ticks].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const hundredMinutesAgo = new Date(Date.now() - 100 * 60 * 1000);
      const recentTicks = sortedTicks.filter(
        (tick) => new Date(tick.createdAt) > hundredMinutesAgo
      );

      const windows: UptimeStatus[] = [];
      for (let i = 0; i < 10; i++) {
        const windowStart = new Date(Date.now() - (i + 1) * 10 * 60 * 1000);
        const windowEnd = new Date(Date.now() - i * 10 * 60 * 1000);

        const windowTicks = recentTicks.filter((tick) => {
          const tickTime = new Date(tick.createdAt);
          return tickTime >= windowStart && tickTime < windowEnd;
        });

        const upTicks = windowTicks.filter(
          (tick) => tick.status === "GOOD"
        ).length;

        windows[9 - i] =
          windowTicks.length === 0
            ? "UNKNOWN"
            : upTicks / windowTicks.length >= 0.5
              ? "GOOD"
              : "BAD";
      }

      const validTicks = sortedTicks.filter(
        (tick) => tick.status === "GOOD" || tick.status === "BAD"
      );
      const totalValidTicks = validTicks.length;
      const upTicks = validTicks.filter(
        (tick) => tick.status === "GOOD"
      ).length;

      const uptimePercentage =
        totalValidTicks === 0 ? 0 : (upTicks / totalValidTicks) * 100;

      const currentStatus = windows[windows.length - 1];
      const lastChecked = sortedTicks[0]
        ? new Date(sortedTicks[0].createdAt).toLocaleTimeString()
        : "Never";

      return {
        id: website.id,
        url: website.url,
        status: currentStatus,
        uptimePercentage,
        lastChecked,
        uptimeTicks: windows,
      };
    });
  }, [websites10]);

  const isLimitReached = processedWebsites.length >= 10;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-8 px-4 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              WatchFlow
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isLimitReached}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isLimitReached
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isLimitReached ? "Limit Reached" : "Add Website"}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {processedWebsites.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      </div>

      <CreateWebsiteModal
        isOpen={isModalOpen}
        isLimitReached={isLimitReached}
        onClose={async (url) => {
          setIsModalOpen(false);
          if (!url || isLimitReached) return;

          const token = await getToken();
          await axios.post(
            `${API_BACKEND_URL}/api/v1/website`,
            { url, interval: "10min" },
            {
              headers: {
                Authorization: token,
              },
            }
          );
          refreshWebsites();
        }}
      />
    </div>
  );
}

export default App;
