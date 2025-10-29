import React from "react";

/**
 * Walk-in suspended message component
 */
export function WalkInSuspended() {
  return (
    <div className="suspended-container text-center">
      <h1>本店已停止Walk-in</h1>
      <h1>Walk-ins Suspended</h1>
    </div>
  );
}

/**
 * Store description component
 */
export function StoreDescription() {
  return (
    <div className="description-container mt-5">
      <h2>
        本店設有卡位、吧檯兩種座位。如果吧檯先有空位時,會先為吧檯客人帶位,有可能導致帶位先後順序變動。
        敬請諒解。
      </h2>
      <h5>
        Guests who have chosen counters will be seated first when a counter is
        available first. The order the numbers are called might changedepending
        on the situation. <br />
        Thank you.
      </h5>
    </div>
  );
}

/**
 * Logo component
 */
export function StoreLogo() {
  return (
    <div className="logo-container d-flex justify-content-end">
      <img
        src="/images/logo.jpg"
        alt="Sushiro Logo"
        className="img-fluid w-25"
      />
    </div>
  );
}
