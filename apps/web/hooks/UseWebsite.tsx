"use client";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";

interface Website {
  id: string;
  url: string;
  ticks: {
    id: string;
    createdAt: string;
    status: string;
    latency: number;
  }[];
}

const API_BACKEND_URL = "http://localhost:8080";

export function useWebsites() {
  const { getToken } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);

  async function refreshWebsites() {
    const token = await getToken();
    const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
      headers: {
        Authorization: token,
      },
    });

    setWebsites(response.data.websites);
  }

  useEffect(() => {
    refreshWebsites();

    const interval = setInterval(
      () => {
        refreshWebsites();
      },
      1000 * 60 * 1
    );

    return () => clearInterval(interval);
  }, []);

  return { websites, refreshWebsites };
}
