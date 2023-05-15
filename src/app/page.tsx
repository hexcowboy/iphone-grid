"use client";

import React, { CSSProperties, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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

export default function App() {
  const [items, setItems] = useState(initialItems);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="grid grid-cols-4 auto-cols-min gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
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
  );

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    const activeObj = items.find((item) => item.id === activeId);
    const overObj = items.find((item) => item.id === overId);

    if (activeObj && overObj && activeId !== overId) {
      setItems((items) => {
        const oldIndex = items.indexOf(activeObj);
        const newIndex = items.indexOf(overObj);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
      className={"bg-white rounded-2xl flex justify-center items-center"}
    >
      <p className="text-black">{node.id}</p>
    </div>
  );
}
