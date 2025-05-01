"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "@/app/store";
import { PersistGate } from "redux-persist/integration/react";

export default function ClientRootProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}