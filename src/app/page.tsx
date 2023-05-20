"use client";

import React, { CSSProperties, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Node = {
  id: number;
  width: number;
  height: number;
};

const initialItems: Node[] = [
  { id: 1, width: 2, height: 2 },
  { id: 2, width: 1, height: 1 },
  { id: 3, width: 1, height: 1 },
  { id: 4, width: 1, height: 1 },
  { id: 5, width: 1, height: 1 },
  { id: 6, width: 1, height: 1 },
  { id: 7, width: 1, height: 1 },
  { id: 8, width: 1, height: 1 },
  { id: 9, width: 1, height: 1 },
  { id: 10, width: 1, height: 1 },
  { id: 11, width: 1, height: 1 },
  { id: 12, width: 1, height: 1 },
  { id: 13, width: 1, height: 1 },
  { id: 14, width: 1, height: 1 },
  { id: 15, width: 1, height: 1 },
  { id: 16, width: 2, height: 2 },
  { id: 17, width: 1, height: 1 },
  { id: 18, width: 1, height: 1 },
];

const GRID_COLS = 4;

function calculateGridIndex(items: Node[], itemId: number) {
  let gridIndex = 0;
  let nextRowSkip: Array<number> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.id === itemId) {
      break;
    }

    const { width, height } = item;

    if (height > 1) {
      nextRowSkip = nextRowSkip.concat(Array(height - 1).fill(width));
    }

    if ((gridIndex + 1) % 4 === 0) {
      const shift = nextRowSkip.shift() ?? 0;
      gridIndex += shift;
    }

    gridIndex += width;
  }

  return gridIndex;
}

export default function App() {
  const [items, setItems] = useState(initialItems);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <div className="grid grid-cols-4 auto-cols-min gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
          >
            <SortableContext items={items} strategy={rectSortingStrategy}>
              {items.map((item) => (
                <SortableItem key={item.id} node={item} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      <div className="min-h-screen flex items-center p-20 flex-col">
        <div className="max-w-sm flex flex-col gap-4">
          <h2 className="text-4xl">
            Bounty (
            <a
              href="https://github.com/hexcowboy/iphone-grid"
              className="underline cursor-pointer"
              target="_blank"
            >
              🔗
            </a>
            )
          </h2>
          <p>
            Make the grid behave more like an iPhone home screen. Implement
            however you like, but follow the requirements and use the
            technologies mentioned.
          </p>

          <h3 className="text-xl">Requirements</h3>
          <ul className="list-disc list-inside">
            <li>
              Upon releasing a grid item, transition it to its new position (
              <a
                href="https://drive.google.com/file/d/1AqjF70LsQRhDL9LyzsNK5sjOzhbGj-As/view?usp=sharing"
                className="underline cursor-pointer"
                target="_blank"
              >
                📼
              </a>
              )
            </li>
            <li>
              Fix the issue with dragging smaller items over larger ones (
              <a
                href="https://drive.google.com/file/d/18nAnudUS37LHdcj8ovxpnzFXqlHmjucF/view?usp=share_link"
                className="underline cursor-pointer"
                target="_blank"
              >
                📼
              </a>
              )
            </li>
            <li>
              Fix issues with glitchy layout changes when large items are moved
              in vertices of smaller items (
              <a
                href="https://drive.google.com/file/d/1jXdMXbcvOAGkybKKDqsqZFMdc9VENI58/view?usp=sharing"
                className="underline cursor-pointer"
                target="_blank"
              >
                📼
              </a>
              )
            </li>
            <li>In general, fix any bugginess and smooth out the experience</li>
          </ul>

          <h3 className="text-xl">Assumptions</h3>
          <ul className="list-disc list-inside">
            <li>Grid will always be 4 columns wide</li>
            <li>Grid can be more than 6 rows high</li>
            <li>Items can be any width (up to 4)</li>
          </ul>

          <h3 className="text-xl">Technologies</h3>
          <ul className="list-disc list-inside">
            <li>
              <a className="text-blue-300" href="https://docs.dndkit.com/">
                dnd-kit
              </a>{" "}
              <em>or</em>{" "}
              <a
                className="text-blue-300"
                href="https://react-dnd.github.io/react-dnd/about"
              >
                react-dnd
              </a>{" "}
              with{" "}
              <a
                className="text-blue-300"
                href="https://react-dnd.github.io/react-dnd/docs/backends/html5"
              >
                react-dnd-html5-backend
              </a>{" "}
            </li>
            <li>tailwind</li>
            <li>next.js</li>
            <li>pnpm</li>
            <li>typescript</li>
          </ul>

          <h3 className="text-xl">Reward</h3>
          <ul className="list-disc list-inside">
            <li>400 USDC (ETH Mainnet)</li>
          </ul>
        </div>
      </div>
    </>
  );

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || !active) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    const activeObj = items.find((item) => item.id === activeId);
    const overObj = items.find((item) => item.id === overId);

    if (!activeObj || !overObj || activeId === overId) return;

    const overGridIndex = calculateGridIndex(items, overId);
    if ((overObj.width + overGridIndex) % GRID_COLS > 4) return;

    setItems((currentItems) => {
      const oldIndex = currentItems.indexOf(activeObj);
      const newIndex = currentItems.indexOf(overObj);

      return arrayMove(currentItems, oldIndex, newIndex);
    });
  }
}

function SortableItem({ node }: { node: Node }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: node.id });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: `calc(${node.height * 80}px + ${node.height - 1 * 1}rem)`,
    width: `calc(${node.width * 80}px + ${node.width - 1 * 1}rem)`,
    gridColumn: `span ${node.width}`,
    gridRow: `span ${node.height}`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-2xl flex justify-center items-center select-none"
    >
      <p className="text-black">{node.id}</p>
    </div>
  );
}
