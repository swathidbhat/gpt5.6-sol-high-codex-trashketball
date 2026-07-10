import type { Metadata } from "next";
import TrashketballGame from "./TrashketballGame";

export const metadata: Metadata = {
  title: "Trashketball — Two Worlds. One Bin.",
  description: "A cinematic 3D paper-ball trick-shot game built with Three.js.",
};

export default function Home() {
  return <TrashketballGame />;
}
