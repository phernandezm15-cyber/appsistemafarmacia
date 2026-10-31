/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { AndroidSimulatorFrame } from "./components/AndroidSimulatorFrame";

const router = getRouter();

export default function App() {
  return (
    <AndroidSimulatorFrame>
      <RouterProvider router={router} />
    </AndroidSimulatorFrame>
  );
}

