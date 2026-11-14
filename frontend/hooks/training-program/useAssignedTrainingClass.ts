"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-program/training-classes";
import { useAuthStore } from "@/store/useAuthStore";

export default function useAssignedTrainingClass() {
  const commanderId = useAuthStore((state) => state.user?.id);
  const classes = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId],
    queryFn: trainingClassService.getMine,
    enabled: Boolean(commanderId),
  });
  const assignedClasses = classes.data?.data ?? [];
  return { commanderId, classes, assignedClasses };
}
