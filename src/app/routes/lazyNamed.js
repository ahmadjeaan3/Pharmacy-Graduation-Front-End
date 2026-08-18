import { lazy } from "react";

export function lazyNamed(loader, exportName) {
  return lazy(() =>
    loader().then((module) => ({ default: module[exportName] })),
  );
}
