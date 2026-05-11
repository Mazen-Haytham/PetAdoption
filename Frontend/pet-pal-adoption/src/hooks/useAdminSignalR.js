import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import { getMe, ORIGIN_URL } from "../api/api";
import { useAuthStore } from "../store/authStore";
import useAdminStore from "../store/useAdminStore";
import { toast } from "sonner";

/**
 * Runs inside AdminLayout only.
 *
 * 1) Wait for Admin JWT.
 * 2) Open hub (server puts this user in group "Admins").
 * 3) On `NewPostCreated`: toast + bell; if URL is pets page, refresh pet list quietly.
 */
export function useAdminSignalR() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const location = useLocation();
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!accessToken || role !== "Admin") return;

    let connection;

    (async () => {
      try {
        await getMe();
      } catch (e) {
        console.error("Admin SignalR: getMe failed", e);
        return;
      }

      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${ORIGIN_URL}/hubs/notifications`, {
          accessTokenFactory: () => useAuthStore.getState().accessToken ?? "",
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .build();

      connection.on("NewPostCreated", (payload) => {
        const text =
          payload?.message ??
          payload?.Message ??
          "New pet post waiting for approval";
        toast.info(text);
        useAdminStore.getState().bumpNewPostNotification();
        if (pathRef.current.startsWith("/admin/pets")) {
          useAdminStore.getState().refreshPetsAfterHubEvent();
        }
      });

      try {
        await connection.start();
      } catch (e) {
        console.warn("Admin SignalR: connect failed", e);
      }
    })();

    return () => {
      if (connection) {
        connection.off("NewPostCreated");
        connection.stop().catch(() => {});
      }
    };
  }, [accessToken, role]);
}
