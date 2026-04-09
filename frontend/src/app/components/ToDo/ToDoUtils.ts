import { setHours, setMinutes } from "date-fns";
import { TODO_TYPE } from "./ToDoService";

export type SortKey = "title" | "created" | "deadline";
export type SortDirection = "asc" | "desc";

export const PAGE_SIZE = 4;

export const buildDeadline = (
  dateValue: Date | null,
  hourValue: string,
  minuteValue: string,
) => {
  const hasHour = hourValue.trim() !== "";
  const hasMinute = minuteValue.trim() !== "";
  const hasTime = hasHour || hasMinute;
  const parsedHour =
    hourValue.trim() !== "" ? Number.parseInt(hourValue, 10) : 0;
  const parsedMinute =
    minuteValue.trim() !== "" ? Number.parseInt(minuteValue, 10) : 0;

  const dateFromPicker = dateValue ? new Date(dateValue) : null;

  if (!hasTime && !dateFromPicker) {
    return null;
  }

  if (!dateFromPicker && hasHour && !Number.isNaN(parsedHour)) {
    const now = new Date();
    const timeAdjusted = setMinutes(
      setHours(now, parsedHour),
      Number.isNaN(parsedMinute) ? 0 : parsedMinute,
    );
    return timeAdjusted.toISOString();
  }

  if (dateFromPicker) {
    const deadline = new Date(dateFromPicker);
    if (Number.isNaN(deadline.getTime())) {
      return null;
    }
    const adjusted = setMinutes(
      setHours(deadline, hasHour && !Number.isNaN(parsedHour) ? parsedHour : 0),
      hasMinute && !Number.isNaN(parsedMinute) ? parsedMinute : 0,
    );
    return adjusted.toISOString();
  }

  return null;
};

export const formatDeadline = (deadline: string | null) => {
  if (!deadline) {
    return "No deadline";
  }
  const dateValue = new Date(deadline);
  if (Number.isNaN(dateValue.getTime())) {
    return "No deadline";
  }

  return dateValue.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const sortTodos = (
  todos: TODO_TYPE[],
  sortKey: SortKey,
  sortDirection: SortDirection,
) => {
  const sorted = [...todos].sort((left, right) => {
    if (sortKey === "title") {
      const comparison = left.name.localeCompare(right.name);
      return sortDirection === "asc" ? comparison : -comparison;
    }
    if (sortKey === "deadline") {
      const leftHasDeadline = Boolean(left.deadline);
      const rightHasDeadline = Boolean(right.deadline);
      if (!leftHasDeadline && !rightHasDeadline) {
        return 0;
      }
      if (!leftHasDeadline) {
        return 1;
      }
      if (!rightHasDeadline) {
        return -1;
      }
      const leftTime = new Date(left.deadline as string).getTime();
      const rightTime = new Date(right.deadline as string).getTime();
      const comparison = leftTime - rightTime;
      return sortDirection === "asc" ? comparison : -comparison;
    }
    const comparison = left.id - right.id;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return sorted;
};

export const paginateTodos = (
  todos: TODO_TYPE[],
  currentPage: number,
  pageSize: number,
) => {
  const totalPages = Math.ceil(todos.length / pageSize);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginated = todos.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { totalPages, safePage, paginated };
};
