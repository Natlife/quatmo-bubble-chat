import React from "react";

export function SlotTag({ name }) {
  return <span className="slot-tag">{"{{" + name + "}}"}</span>;
}
