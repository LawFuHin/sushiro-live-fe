import React, { useCallback, useMemo } from "react";
import "./App.css";
import { NET_TICKET_STATUS, UI } from "./utils/constants";
import { useStoreValidation } from "./hooks/useStoreValidation";
import { useQueueData } from "./hooks/useQueueData";
import { useCurrentTime } from "./hooks/useCurrentTime";
import { LoadingSpinner, ErrorDisplay } from "./components/LoadingAndError";
import { QueueSection } from "./components/QueueSection";
import {
  WalkInSuspended,
  StoreDescription,
  StoreLogo,
} from "./components/StoreInfo";

function App() {
  // Custom hooks for state management
  const {
    storeId,
    storeInfo,
    isLoading: storeLoading,
    error: storeError,
  } = useStoreValidation();
  const {
    queueData,
    isLoading: queueLoading,
    error: queueError,
  } = useQueueData(storeId, storeInfo);
  const currentTime = useCurrentTime();

  // Helper function to get queue numbers with placeholder
  const getQueueNumbersWithPlaceholder = useCallback((queueArray) => {
    if (!Array.isArray(queueArray) || queueArray.length === 0) {
      return ["&nbsp;", "&nbsp;", "&nbsp;"];
    }
    return [
      queueArray[0] || "&nbsp;",
      queueArray[1] || "&nbsp;",
      queueArray[2] || "&nbsp;",
    ];
  }, []);

  // Memoized queue display data
  const queueDisplayData = useMemo(() => {
    if (!queueData) return null;

    return {
      store: getQueueNumbersWithPlaceholder(queueData.storeQueue),
      booth: getQueueNumbersWithPlaceholder(queueData.boothQueue),
      reservation: getQueueNumbersWithPlaceholder(queueData.reservationQueue),
    };
  }, [queueData, getQueueNumbersWithPlaceholder]);

  // Memoized walk-in status
  const isWalkInSuspended = useMemo(() => {
    return (
      storeInfo &&
      storeInfo.netTicketStatus !== NET_TICKET_STATUS.OFFLINE_MANUAL
    );
  }, [storeInfo]);

  // Show loading state while determining store ID
  if (storeLoading) {
    return <LoadingSpinner message={UI.LOADING_STATES.VALIDATING_STORE} />;
  }

  // Show error state if store validation failed
  if (storeError && !storeId) {
    return <ErrorDisplay error={storeError} />;
  }

  return (
    <div className="App">
      {/* Bootstrap Grid System Demo */}
      <div className="container">
        {/* Left and Right Card Layout */}
        <div className="row py-4 d-flex align-items-stretch">
          {/* Left Card - 6 columns on desktop, full width on tablet/mobile */}
          <div className="col-lg-6 col-md-12 col-sm-12 mb-3 d-flex">
            <div className="w-100">
              <h1>
                {storeInfo
                  ? `${storeInfo.name}即將要帶位的號碼:`
                  : "即將要帶位的號碼:"}
              </h1>
              <QueueSection
                title="吧檯 / 卡位 都可以"
                subtitle="Counter / booth"
                queueNumbers={
                  queueDisplayData?.store || ["&nbsp;", "&nbsp;", "&nbsp;"]
                }
              />
              <QueueSection
                title="卡位"
                subtitle="Booth"
                queueNumbers={
                  queueDisplayData?.booth || ["&nbsp;", "&nbsp;", "&nbsp;"]
                }
              />
              <QueueSection
                title="手機APP預約(按預約時間先後順序叫號)"
                subtitle="Reservation"
                queueNumbers={
                  queueDisplayData?.reservation || [
                    "&nbsp;",
                    "&nbsp;",
                    "&nbsp;",
                  ]
                }
              />
            </div>
          </div>

          {/* Right Card - 6 columns on desktop, full width on tablet/mobile */}
          <div className="col-lg-6 col-md-12 col-sm-12 mb-3 d-flex">
            <div className="w-100 d-flex flex-column justify-content-between">
              {/* Conditionally show walk-in suspended message based on netTicketStatus */}
              {isWalkInSuspended && <WalkInSuspended />}
              <StoreDescription />
              <StoreLogo />
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <p className="mb-0">{currentTime}</p>
      </div>
    </div>
  );
}

export default App;
