"use client";

import { useEffect, useRef, useState, RefObject, CSSProperties } from "react";
import { AxisBox2D, BoxDelta, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

type Node = {
  id: number;
  width: number;
  height: number;
};

type ArrayMoveMutable = (
  array: Node[],
  fromIndex: number,
  toIndex: number
) => void;

type ArrayMoveImmutable = (
  array: Node[],
  fromIndex: number,
  toIndex: number
) => Node[];

type Position = {
  top: number;
  width: number;
  height: number;
  left: number;
};

type UpdatePosition = (i: number, offset: Position) => void;

type UpdateOrder = (
  i: number,
  dragXOffset: number,
  dragYOffset: number
) => void;

type UsePositionReorderReturn = [Node[], UpdatePosition, UpdateOrder];

type UsePositionReorder = (initialState: Node[]) => UsePositionReorderReturn;

type FindIndex = (
  i: number,
  xOffset: number,
  yOffset: number,
  positions: Position[]
) => number;

type Item = {
  i: number;
  updatePosition: UpdatePosition;
  updateOrder: UpdateOrder;
  item: Node;
};

type UseMeasurePosition = (
  update: (position: Position) => void
) => RefObject<HTMLDivElement>;

const items: Node[] = [
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
  const [order, updatePosition, updateOrder] = usePositionReorder(items);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="grid grid-cols-4 auto-cols-min gap-4">
        {order.map((item, i) => (
          <Item
            key={item.id}
            i={i}
            updatePosition={updatePosition}
            updateOrder={updateOrder}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}

function Item({ i, updatePosition, updateOrder, item }: Item) {
  const [isDragging, setDragging] = useState(false);
  const ref = useMeasurePosition((pos) => updatePosition(i, pos));

  const style: CSSProperties = {
    height: `calc(${item.height * 80}px + ${item.height - 1 * 1}rem)`,
    width: `calc(${item.width * 80}px + ${item.width - 1 * 1}rem)`,
    gridColumn: `span ${item.width}`,
    gridRow: `span ${item.height}`,
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={false}
      style={style}
      whileTap={{
        scale: 1.12,
        boxShadow: "0px 5px 5px rgba(0,0,0,0.1)",
      }}
      drag
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      onViewportBoxUpdate={(_: AxisBox2D, delta: BoxDelta) => {
        if (isDragging) {
          updateOrder(i, delta.x.translate, delta.y.translate);
        }
      }}
      className={twMerge(
        "bg-white rounded-2xl flex justify-center items-center select-none cursor-pointer",
        isDragging ? "z-[1]" : "z-0"
      )}
    >
      <p className="text-black">{item.id}</p>
    </motion.div>
  );
}

const useMeasurePosition: UseMeasurePosition = (update) => {
  // We'll use a `ref` to access the DOM element that the `motion.li` produces.
  // This will allow us to measure its height and position, which will be useful to
  // decide when a dragging element should switch places with its siblings.
  const ref = useRef<HTMLDivElement>(null);

  // Update the measured position of the item so we can calculate when we should rearrange.
  useEffect(() => {
    update({
      height: ref?.current?.offsetHeight ?? 0,
      width: ref?.current?.offsetWidth ?? 0,
      top: ref?.current?.offsetTop ?? 0,
      left: ref?.current?.offsetLeft ?? 0,
    });
  });

  return ref;
};

function distance(a: number, b: number) {
  return Math.abs(a - b);
}

function clamp(min: number, max: number, v: number) {
  return Math.min(Math.max(v, min), max);
}

const usePositionReorder: UsePositionReorder = (initialState) => {
  const [order, setOrder] = useState(initialState);

  // We need to collect an array of height and position data for all of this component's
  // `Item` children, so we can later us that in calculations to decide when a dragging
  // `Item` should swap places with its siblings.
  const positions = useRef<Position[]>([]).current;
  const updatePosition: UpdatePosition = (i, offset) => {
    positions[i] = offset;
  };

  // Find the ideal index for a dragging item based on its position in the array, and its
  // current drag offset. If it's different to its current index, we swap this item with that
  // sibling.
  const updateOrder: UpdateOrder = (i, dragXOffset, dragYOffset) => {
    const targetIndex = findIndex(i, dragXOffset, dragYOffset, positions);
    if (targetIndex !== i) setOrder(arrayMoveImmutable(order, i, targetIndex));
  };

  return [order, updatePosition, updateOrder];
};

const buffer = 0;

const findIndex: FindIndex = (i, xOffset, yOffset, positions) => {
  let target = i;
  const { top, width, height, left } = positions[i];
  const bottom = top + height;
  const right = left + width;

  // going right is x positive
  // going down is y positive

  // If going up
  if (yOffset < 0 && Math.abs(yOffset) > Math.abs(xOffset)) {
    const prevItem = positions[i - 3];
    if (prevItem === undefined) return i;
    const prevBottom = prevItem.top + prevItem.height;
    const ySwapOffset =
      distance(top, prevBottom - prevItem.height / 2) + buffer;
    if (yOffset < -ySwapOffset) target = i - 3;
  } else if (yOffset > 0 && Math.abs(yOffset) > Math.abs(xOffset)) {
    // going down
    const nextItem = positions[i + 3];
    if (nextItem === undefined) return i;
    const ySwapOffset =
      distance(bottom, nextItem.top + nextItem.height / 2) + buffer;
    if (yOffset > ySwapOffset) target = i + 3;
    // If moving left
  } else if (xOffset < 0 && Math.abs(xOffset) > Math.abs(yOffset)) {
    const prevItem = positions[i - 1];
    if (prevItem === undefined) return i;
    const prevRight = prevItem.left + prevItem.width;
    const xSwapOffset = distance(left, prevRight - prevItem.width / 2) + buffer;
    if (xOffset < -xSwapOffset) target = i - 1;
    // If moving right
  } else if (xOffset > 0 && Math.abs(xOffset) > Math.abs(yOffset)) {
    const nextItem = positions[i + 1];
    if (nextItem === undefined) return i;
    const xSwapOffset =
      distance(right, nextItem.left + nextItem.width / 2) + buffer;
    if (xOffset > xSwapOffset) target = i + 1;
  }

  return clamp(0, positions.length, target);
};

const arrayMoveMutable: ArrayMoveMutable = (array, fromIndex, toIndex) => {
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

    const [item] = array.splice(fromIndex, 1);
    array.splice(endIndex, 0, item);
  }
};

const arrayMoveImmutable: ArrayMoveImmutable = (array, fromIndex, toIndex) => {
  array = [...array];
  arrayMoveMutable(array, fromIndex, toIndex);
  return array;
};
