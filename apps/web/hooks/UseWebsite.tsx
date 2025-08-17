"use client";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";

interface Website {
  id: string;
  url: string;
  checkInterval: string;
  ticks: {
    id: string;
    createdAt: string;
    status: string;
    latency: number;
    interval: string;
    checkInterval: string;
  }[];
}

const API_BACKEND_URL = "http://localhost:8080";

export function useWebsites(interval: "3min" | "10min" | "20min") {
  const { getToken } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);

  async function refreshWebsites() {
    const token = await getToken();

    const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
      headers: {
        Authorization: token,
      },
      params: {
        interval,
      },
    });

    setWebsites(response.data.websites);
  }

  useEffect(() => {
    refreshWebsites();

    const intervalId = setInterval(refreshWebsites, 1000 * 60 * 1);
    return () => clearInterval(intervalId);
  }, [interval]);

  return { websites, refreshWebsites };
}
