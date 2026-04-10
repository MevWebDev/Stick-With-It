import React from "react";
import { TODO_TYPE } from "./ToDoService";

type Props = {
  todo: TODO_TYPE;
  onToggle: (id: number) => void;
  onEdit: (todo: TODO_TYPE) => void;
  onRemove: (id: number) => void;
  formatDeadline: (deadline: string | null) => string;
};

export default function ToDoItem({
  todo,
  onToggle,
  onEdit,
  onRemove,
  formatDeadline,
}: Props) {
  return (
    <div className="rounded px-4 pt-3 pb-1 mt-[15px] shadow-md dark:bg-[#3b3b3f]">
      <div className="flex flex-wrap items-center justify-between">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="h-4 w-4"
          />
          <span
            className={todo.completed ? "line-through dark:text-gray-400" : ""}
          >
            {todo.name}
          </span>
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm dark:text-gray-300">
        <span>{formatDeadline(todo.deadline)}</span>
        <div className="flex items-center">
          <button onClick={() => onEdit(todo)}>Edit</button>
          <button onClick={() => onRemove(todo.id)}>Remove</button>
        </div>
      </div>
    </div>
  );
}
