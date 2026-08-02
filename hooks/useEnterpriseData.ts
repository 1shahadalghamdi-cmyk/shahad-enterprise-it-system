"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ENTERPRISE_DATA_EVENT,
  getEnterpriseData,
  type EnterpriseData,
} from "@/lib/storage";

export function useEnterpriseData() {
  const [data, setData] = useState<EnterpriseData>({
    assets: [],
    employees: [],
    tickets: [],
    history: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(() => {
    const enterpriseData = getEnterpriseData();

    setData(enterpriseData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      refreshData();
    }, 0);

    function handleEnterpriseUpdate() {
      refreshData();
    }

    function handleStorageUpdate() {
      refreshData();
    }

    function handlePageFocus() {
      refreshData();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshData();
      }
    }

    window.addEventListener(
      ENTERPRISE_DATA_EVENT,
      handleEnterpriseUpdate,
    );

    window.addEventListener(
      "storage",
      handleStorageUpdate,
    );

    window.addEventListener(
      "focus",
      handlePageFocus,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.clearTimeout(timeoutId);

      window.removeEventListener(
        ENTERPRISE_DATA_EVENT,
        handleEnterpriseUpdate,
      );

      window.removeEventListener(
        "storage",
        handleStorageUpdate,
      );

      window.removeEventListener(
        "focus",
        handlePageFocus,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [refreshData]);

  return {
    assets: data.assets,
    employees: data.employees,
    tickets: data.tickets,
    history: data.history,
    isLoading,
    refreshData,
  };
}