import React from "react";

/**
 * Queue display component for showing queue numbers
 */
export function QueueSection({ title, subtitle, queueNumbers }) {
  return (
    <div className="ticket-container mb-3 p-3">
      <h3 className="mb-0">{title}</h3>
      <p className="mb-0">{subtitle}</p>
      <div className="row">
        <div className="col-4">1</div>
        <div className="col-4">2</div>
        <div className="col-4">3</div>
      </div>
      <div className="row">
        {queueNumbers.map((number, index) => (
          <div key={index} className="col-4">
            <h1 dangerouslySetInnerHTML={{ __html: number || "&nbsp;" }}></h1>
          </div>
        ))}
      </div>
    </div>
  );
}
