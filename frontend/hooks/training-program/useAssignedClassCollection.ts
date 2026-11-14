"use client";

import { useQueries } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import useAssignedTrainingClass from "./useAssignedTrainingClass";

type CollectionResponse<T> = ApiResponse<T[]>;

export default function useAssignedClassCollection<T>(name: string, fetch: (classId: string) => Promise<CollectionResponse<T>>, enabled = true) {
  const { commanderId, classes, assignedClasses } = useAssignedTrainingClass();
  const queries = useQueries({
    queries: assignedClasses.map((trainingClass) => ({
      queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, trainingClass.id, name],
      queryFn: () => fetch(trainingClass.id),
      enabled: Boolean(commanderId && enabled),
    })),
  });
  const rows = assignedClasses.flatMap((trainingClass, index) =>
    (queries[index]?.data?.data ?? []).map((row) => ({ ...row, classId: trainingClass.id, className: trainingClass.name }))
  ) as (T & { classId: string; className: string })[];
  return {
    commanderId, classes, assignedClasses, queries, rows,
    isLoading: classes.isLoading || queries.some((query) => query.isLoading),
    isError: classes.isError || queries.some((query) => query.isError),
    refetch: () => { void classes.refetch(); queries.forEach((query) => { void query.refetch(); }); },
  };
}
